"""
Tu espacio — Flask: SYSTEM INTERFACE, módulos funcionales y APIs mejorada.

Mejoras implementadas:
  - Validación exhaustiva de entrada
  - Retry logic con backoff para APIs externas
  - Logging centralizado
  - Refactorización de UPDATE dinámico
  - Paginación básica
  - Docstrings en funciones
"""
from __future__ import annotations

import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from flask import Flask, abort, jsonify, redirect, render_template, request, url_for

from config import logger, NEWS_TTL, MERCADOS_TTL, API_TIMEOUT
from database import get_db, init_db, row_to_dict
from utils import (
    validate_event_data, validate_contact_data, validate_assignment_data,
    validate_iso_date, build_safe_update, retry_with_backoff, log_endpoint
)

load_dotenv(Path(__file__).resolve().parent / ".env")

app = Flask(__name__)

# Constantes
_MONTHS_ES = ("ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC")
_MESES_ES = ("ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic")
_NEWS_TZ = ZoneInfo("America/Santiago")
_SLUG_REMOVED_CALC = "calculadora"

# Cache global
_mercados_cache: dict = {"t": 0.0, "rows": []}
_news_cache: dict = {"t": 0.0, "items": []}

# Definición de módulos
MODULES = [
    {
        "slug": "calendario",
        "title": "CALENDARIO",
        "desc": "Día - semana - mes",
        "icon": "🕐",
        "theme": "red",
        "lead": "Horario 24 h (local): mes, semana y día con eventos en SQLite.",
    },
    {
        "slug": "universidad",
        "title": "UNIVERSIDAD",
        "desc": "Aula y entregas",
        "icon": "🎓",
        "theme": "gold",
        "lead": "Plan de estudios y vida académica: campus, créditos y entregas en un solo espacio.",
    },
    {
        "slug": "contactos",
        "title": "CONTACTOS",
        "desc": "Tarjetas y agenda",
        "icon": "✉",
        "theme": "purple",
        "lead": "CRM en SQLite: filtro en vivo, edición y toasts de confirmación.",
    },
    {
        "slug": "mercados",
        "title": "MERCADOS",
        "desc": "Futuros, FX, acciones · precios y contexto",
        "icon": "📊",
        "theme": "blue",
        "lead": "Historias y noticias de precios: futuros, forex, índices y acciones; cotizaciones de referencia (yfinance).",
    },
    {
        "slug": "noticias",
        "title": "NOTICIAS",
        "desc": "Economía & política",
        "icon": "📰",
        "theme": "green",
        "lead": "Economía, mercados, política e internacional (BBC, NYT, Guardian, El País, CNBC…); hora de publicación en Chile.",
    },
    {
        "slug": "ciberseguridad",
        "title": "CIBERSEGURIDAD",
        "desc": "Shadow Network",
        "icon": "🛡",
        "theme": "white",
        "lead": "Checklist por categorías con progreso visual; datos solo en tu navegador.",
    },
]

_NEWS_REGION_LABELS = {
    "economia": "Economía & finanzas",
    "internacional": "Internacional & geopolítica",
    "politica": "Política",
}

init_db()


def _flask_debug() -> bool:
    """Modo debug solo si FLASK_DEBUG=1/true/yes (más seguro que True fijo)."""
    v = os.environ.get("FLASK_DEBUG", "0").strip().lower()
    return v in ("1", "true", "yes")


def _modules_ui():
    """Menú y tarjetas: excluye el módulo retirado (slug calculadora)."""
    return [m for m in MODULES if m.get("slug") != _SLUG_REMOVED_CALC]


@app.after_request
def _no_cache_sensitive(response):
    """Evita caché agresiva del navegador en HTML, CSS y JS servidos por Flask."""
    ct = response.headers.get("Content-Type", "")
    if any(x in ct for x in ("text/html", "text/css", "javascript", "application/javascript")):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
    return response


def _month_badge():
    """Badge con mes y año actual."""
    now = datetime.now()
    return f"{_MONTHS_ES[now.month - 1]} - {now.year}"


@app.context_processor
def _ctx():
    """Variables globales para templates."""
    return {
        "month_badge": _month_badge(),
        "university_intranet_url": (os.environ.get("TU_ESPACIO_INTRANET_URL") or "").strip(),
        "university_aula_url": (os.environ.get("TU_ESPACIO_AULA_URL") or "").strip(),
    }


def _access_cards():
    """Genera tarjetas de acceso a módulos."""
    return [
        {
            "title": m["title"],
            "desc": m["desc"],
            "icon": m["icon"],
            "theme": m["theme"],
            "href": url_for("modulo", slug=m["slug"]),
        }
        for m in _modules_ui()
    ]


def _entry_published_utc(entry: dict) -> datetime | None:
    """Extrae timestamp UTC de entrada RSS."""
    t = entry.get("published_parsed") or entry.get("updated_parsed")
    if not t:
        return None
    return datetime(
        t.tm_year, t.tm_mon, t.tm_mday,
        t.tm_hour, t.tm_min, t.tm_sec,
        tzinfo=timezone.utc,
    )


def _published_label_chile(dt: datetime) -> str:
    """Formatea fecha a zona horaria de Chile."""
    local = dt.astimezone(_NEWS_TZ)
    return (
        f"{local.day} {_MESES_ES[local.month - 1]} {local.year}, "
        f"{local.hour:02d}:{local.minute:02d} · hora Chile"
    )


def _fetch_news_items():
    """
    Obtiene noticias de RSS feeds con caché.
    TTL: 90 segundos.
    """
    now = time.time()
    if _news_cache["items"] and (now - _news_cache["t"]) < NEWS_TTL:
        logger.debug("Noticias desde caché")
        return _news_cache["items"]
    
    items: list[dict] = []
    try:
        import feedparser
        
        feeds: list[tuple[str, str, str]] = [
            ("http://feeds.bbci.co.uk/news/business/rss.xml", "BBC · Business", "economia"),
            ("http://feeds.bbci.co.uk/news/world/rss.xml", "BBC · World", "internacional"),
            ("http://feeds.bbci.co.uk/news/politics/rss.xml", "BBC · Politics", "politica"),
            ("https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml", "The New York Times · Economy", "economia"),
            ("https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "The New York Times · World", "internacional"),
            ("https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", "The New York Times · Politics", "politica"),
            ("https://www.theguardian.com/business/rss", "The Guardian · Business", "economia"),
            ("https://www.theguardian.com/world/rss", "The Guardian · World", "internacional"),
            ("https://www.theguardian.com/politics/rss", "The Guardian · Politics", "politica"),
            ("https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia", "El País · Economía", "economia"),
            ("https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional", "El País · Internacional", "internacional"),
            ("https://www.marketwatch.com/rss/topstories", "MarketWatch", "economia"),
            ("https://www.cnbc.com/id/100003114/device/rss/rss.html", "CNBC · Top news", "economia"),
        ]
        collected: list[dict] = []
        
        for url, source, region in feeds:
            try:
                parsed = feedparser.parse(url)
                for e in getattr(parsed, "entries", [])[:8]:
                    title = (e.get("title") or "").strip()
                    link = (e.get("link") or "").strip() or "#"
                    if not title:
                        continue
                    
                    summary = e.get("summary", "") or e.get("description", "") or ""
                    if summary:
                        summary = re.sub(r"<[^>]+>", " ", summary)
                        summary = re.sub(r"\s+", " ", summary).strip()
                        if len(summary) > 280:
                            summary = summary[:280] + "…"
                    
                    dt = _entry_published_utc(e)
                    sort_ts = dt.timestamp() if dt else 0.0
                    published_iso = dt.isoformat() if dt else ""
                    published_label = _published_label_chile(dt) if dt else ""
                    raw_pub = (e.get("published") or e.get("updated") or "").strip()
                    
                    collected.append({
                        "title": title,
                        "link": link,
                        "source": source,
                        "region": region,
                        "region_label": _NEWS_REGION_LABELS.get(region, region),
                        "summary": summary,
                        "published": raw_pub,
                        "published_iso": published_iso,
                        "published_label": published_label or raw_pub,
                        "sort_ts": sort_ts,
                    })
            except Exception as e:
                logger.warning(f"Error parseando {source}: {e}")
                continue
        
        collected.sort(key=lambda x: x.get("sort_ts") or 0.0, reverse=True)
        seen: set[str] = set()
        
        for row in collected:
            link = row.get("link") or ""
            if not link or link == "#" or link in seen:
                continue
            seen.add(link)
            row.pop("sort_ts", None)
            items.append(row)
            if len(items) >= 56:
                break
        
        logger.info(f"Obtenidas {len(items)} noticias")
        
    except Exception as e:
        logger.error(f"Error fetching noticias: {e}", exc_info=True)
    
    _news_cache["t"] = now
    _news_cache["items"] = items
    return items


def _fetch_mercados_rows():
    """
    Obtiene cotizaciones de mercados con retry y caché.
    TTL: 60 segundos.
    """
    now = time.time()
    if _mercados_cache["rows"] and (now - _mercados_cache["t"]) < MERCADOS_TTL:
        logger.debug("Mercados desde caché")
        return _mercados_cache["rows"]
    
    rows = []
    
    def fetch_yfinance(timeout=API_TIMEOUT):
        """Función interna para retry."""
        import yfinance as yf
        
        symbols = ["ES=F", "NQ=F", "SPY", "QQQ", "EURUSD=X", "GBPUSD=X", "NVDA", "BTC-USD"]
        result = []
        
        for sym in symbols:
            try:
                t = yf.Ticker(sym)
                h = t.history(period="5d")
                if h is None or h.empty:
                    continue
                
                last = float(h["Close"].iloc[-1])
                prev = float(h["Close"].iloc[-2]) if len(h) > 1 else last
                chg = ((last - prev) / prev * 100.0) if prev else 0.0
                
                if sym in ("EURUSD=X", "BTC-USD"):
                    pf = f"{last:,.5f}"
                else:
                    pf = f"{last:,.2f}"
                
                result.append({
                    "symbol": sym,
                    "price": last,
                    "chg_pct": chg,
                    "price_fmt": pf,
                    "chg_fmt": f"{chg:+.2f}%",
                })
            except Exception as e:
                logger.warning(f"Error fetching {sym}: {e}")
                continue
        
        return result
    
    try:
        rows = retry_with_backoff(fetch_yfinance, max_attempts=3, backoff_factor=2.0)
        logger.info(f"Obtenidas {len(rows)} cotizaciones")
    except Exception as e:
        logger.error(f"Error fetching mercados después de reintentos: {e}")
        rows = [{
            "symbol": "—",
            "price": 0,
            "chg_pct": 0.0,
            "price_fmt": "—",
            "chg_fmt": "—",
            "error": True,
        }]
    
    _mercados_cache["t"] = now
    _mercados_cache["rows"] = rows
    return rows


# ——— RUTAS ———


@app.route("/")
def index():
    """Redirige a tu-espacio."""
    return redirect(url_for("tu_espacio"))


@app.route("/tu-espacio")
@log_endpoint
def tu_espacio():
    """Panel principal con tarjetas de módulos."""
    return render_template(
        "tu_espacio.html",
        access_cards=_access_cards(),
        active_nav="home",
    )


@app.route("/trading-lab")
def trading_lab_redirect():
    """Antigua ruta del módulo de cotizaciones → Mercados."""
    logger.info("Redirigiendo /trading-lab a /mercados")
    return redirect(url_for("modulo", slug="mercados"), code=301)


@app.route("/<slug>")
@log_endpoint
def modulo(slug):
    """Renderiza módulo por slug."""
    if slug.strip().lower() == _SLUG_REMOVED_CALC:
        abort(404)
    
    mod = next((m for m in MODULES if m["slug"] == slug), None)
    if not mod:
        abort(404)
    
    extra = {}
    if slug == "noticias":
        if request.args.get("refresh"):
            _news_cache["t"] = 0.0
        extra["news_items"] = _fetch_news_items()
    
    return render_template(f"modulos/{slug}.html", mod=mod, active_nav=slug, **extra)


@app.route("/api/mercados")
@app.route("/api/trading")
@log_endpoint
def api_mercados():
    """API: Cotizaciones de mercados."""
    if request.args.get("refresh"):
        _mercados_cache["t"] = 0.0
    return jsonify({"rows": _fetch_mercados_rows()})


@app.route("/api/news")
@log_endpoint
def api_news():
    """API: Noticias RSS."""
    if request.args.get("refresh"):
        _news_cache["t"] = 0.0
    payload = {
        "items": _fetch_news_items(),
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ttl_seconds": int(NEWS_TTL),
    }
    return jsonify(payload)


# ——— API CALENDARIO ———


@app.route("/api/calendar/events", methods=["GET"])
@log_endpoint
def api_calendar_list():
    """
    GET: Obtiene eventos entre fechas (con paginación).
    Parámetros: from, to (ISO format), page, limit (default 50).
    """
    from_q = request.args.get("from", "").strip()
    to_q = request.args.get("to", "").strip()
    
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(200, int(request.args.get("limit", 50)))
    except ValueError:
        page = 1
        limit = 50
    
    offset = (page - 1) * limit
    
    with get_db() as conn:
        if from_q and to_q:
            if not validate_iso_date(from_q) or not validate_iso_date(to_q):
                return jsonify({"error": "from y to deben ser fechas ISO válidas"}), 400
            cur = conn.execute(
                "SELECT * FROM events WHERE start_iso >= ? AND start_iso <= ? ORDER BY start_iso LIMIT ? OFFSET ?",
                (from_q, to_q, limit, offset),
            )
        else:
            cur = conn.execute(
                "SELECT * FROM events ORDER BY start_iso LIMIT ? OFFSET ?",
                (limit, offset),
            )
        rows = cur.fetchall()
    
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/calendar/events", methods=["POST"])
@log_endpoint
def api_calendar_create():
    """POST: Crea nuevo evento con validación."""
    data = request.get_json(force=True, silent=True) or {}
    
    valid, cleaned, error = validate_event_data(data)
    if not valid:
        logger.warning(f"Evento inválido: {error}")
        return jsonify({"error": error}), 400
    
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO events (title, start_iso, end_iso, all_day, color, notes) VALUES (?,?,?,?,?,?)",
            (cleaned["title"], cleaned["start_iso"], cleaned["end_iso"], 
             cleaned["all_day"], cleaned["color"], cleaned["notes"]),
        )
        eid = cur.lastrowid
        row = conn.execute("SELECT * FROM events WHERE id = ?", (eid,)).fetchone()
    
    logger.info(f"Evento creado: {eid}")
    return jsonify(row_to_dict(row)), 201


@app.route("/api/calendar/events/<int:eid>", methods=["PUT"])
@log_endpoint
def api_calendar_update(eid):
    """PUT: Actualiza evento con validación y refactorización."""
    data = request.get_json(force=True, silent=True) or {}
    
    # Validar campos individuales si los hay
    if data:
        valid, cleaned, error = validate_event_data(data)
        if not valid:
            logger.warning(f"Update evento inválido: {error}")
            return jsonify({"error": error}), 400
    else:
        cleaned = {}
    
    sql, vals = build_safe_update(
        "events", cleaned, eid,
        {"title", "start_iso", "end_iso", "color", "notes", "all_day"}
    )
    
    if not sql:
        return jsonify({"error": "sin cambios"}), 400
    
    with get_db() as conn:
        conn.execute(sql, vals)
        row = conn.execute("SELECT * FROM events WHERE id = ?", (eid,)).fetchone()
    
    if not row:
        return jsonify({"error": "no encontrado"}), 404
    
    logger.info(f"Evento {eid} actualizado")
    return jsonify(row_to_dict(row))


@app.route("/api/calendar/events/<int:eid>", methods=["DELETE"])
@log_endpoint
def api_calendar_delete(eid):
    """DELETE: Elimina evento."""
    with get_db() as conn:
        conn.execute("DELETE FROM events WHERE id = ?", (eid,))
    
    logger.info(f"Evento {eid} eliminado")
    return jsonify({"ok": True})


# ——— API CONTACTOS ———


@app.route("/api/contacts", methods=["GET"])
@log_endpoint
def api_contacts_list():
    """GET: Obtiene todos los contactos (con paginación)."""
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(200, int(request.args.get("limit", 50)))
    except ValueError:
        page = 1
        limit = 50
    
    offset = (page - 1) * limit
    
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM contacts ORDER BY name COLLATE NOCASE LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
    
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/contacts", methods=["POST"])
@log_endpoint
def api_contacts_create():
    """POST: Crea nuevo contacto con validación."""
    data = request.get_json(force=True, silent=True) or {}
    
    valid, cleaned, error = validate_contact_data(data)
    if not valid:
        logger.warning(f"Contacto inválido: {error}")
        return jsonify({"error": error}), 400
    
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO contacts (name, email, phone, company, notes) VALUES (?,?,?,?,?)",
            (cleaned["name"], cleaned["email"], cleaned["phone"], 
             cleaned["company"], cleaned["notes"]),
        )
        cid = cur.lastrowid
        row = conn.execute("SELECT * FROM contacts WHERE id = ?", (cid,)).fetchone()
    
    logger.info(f"Contacto creado: {cid}")
    return jsonify(row_to_dict(row)), 201


@app.route("/api/contacts/<int:cid>", methods=["PUT"])
@log_endpoint
def api_contacts_update(cid):
    """PUT: Actualiza contacto con validación."""
    data = request.get_json(force=True, silent=True) or {}
    
    if data:
        valid, cleaned, error = validate_contact_data(data)
        if not valid:
            logger.warning(f"Update contacto inválido: {error}")
            return jsonify({"error": error}), 400
    else:
        cleaned = {}
    
    sql, vals = build_safe_update(
        "contacts", cleaned, cid,
        {"name", "email", "phone", "company", "notes"}
    )
    
    if not sql:
        return jsonify({"error": "sin cambios"}), 400
    
    with get_db() as conn:
        conn.execute(sql, vals)
        row = conn.execute("SELECT * FROM contacts WHERE id = ?", (cid,)).fetchone()
    
    if not row:
        return jsonify({"error": "no encontrado"}), 404
    
    logger.info(f"Contacto {cid} actualizado")
    return jsonify(row_to_dict(row))


@app.route("/api/contacts/<int:cid>", methods=["DELETE"])
@log_endpoint
def api_contacts_delete(cid):
    """DELETE: Elimina contacto."""
    with get_db() as conn:
        conn.execute("DELETE FROM contacts WHERE id = ?", (cid,))
    
    logger.info(f"Contacto {cid} eliminado")
    return jsonify({"ok": True})


# ——— API UNIVERSIDAD ———


@app.route("/api/assignments", methods=["GET"])
@log_endpoint
def api_assignments_list():
    """GET: Obtiene todas las tareas (con paginación)."""
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(200, int(request.args.get("limit", 50)))
    except ValueError:
        page = 1
        limit = 50
    
    offset = (page - 1) * limit
    
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM assignments ORDER BY due_iso LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
    
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/assignments", methods=["POST"])
@log_endpoint
def api_assignments_create():
    """POST: Crea nueva tarea con validación."""
    data = request.get_json(force=True, silent=True) or {}
    
    valid, cleaned, error = validate_assignment_data(data)
    if not valid:
        logger.warning(f"Tarea inválida: {error}")
        return jsonify({"error": error}), 400
    
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO assignments (course, title, due_iso, status, weight, notes) VALUES (?,?,?,?,?,?)",
            (cleaned["course"], cleaned["title"], cleaned["due_iso"],
             cleaned["status"], cleaned["weight"], cleaned.get("notes", "")),
        )
        aid = cur.lastrowid
        row = conn.execute("SELECT * FROM assignments WHERE id = ?", (aid,)).fetchone()
    
    logger.info(f"Tarea creada: {aid}")
    return jsonify(row_to_dict(row)), 201


@app.route("/api/assignments/<int:aid>", methods=["PUT"])
@log_endpoint
def api_assignments_update(aid):
    """PUT: Actualiza tarea con validación."""
    data = request.get_json(force=True, silent=True) or {}
    
    if data:
        valid, cleaned, error = validate_assignment_data(data)
        if not valid:
            logger.warning(f"Update tarea inválido: {error}")
            return jsonify({"error": error}), 400
    else:
        cleaned = {}
    
    sql, vals = build_safe_update(
        "assignments", cleaned, aid,
        {"course", "title", "due_iso", "status", "weight", "notes"}
    )
    
    if not sql:
        return jsonify({"error": "sin cambios"}), 400
    
    with get_db() as conn:
        conn.execute(sql, vals)
        row = conn.execute("SELECT * FROM assignments WHERE id = ?", (aid,)).fetchone()
    
    if not row:
        return jsonify({"error": "no encontrado"}), 404
    
    logger.info(f"Tarea {aid} actualizada")
    return jsonify(row_to_dict(row))


@app.route("/api/assignments/<int:aid>", methods=["DELETE"])
@log_endpoint
def api_assignments_delete(aid):
    """DELETE: Elimina tarea."""
    with get_db() as conn:
        conn.execute("DELETE FROM assignments WHERE id = ?", (aid,))
    
    logger.info(f"Tarea {aid} eliminada")
    return jsonify({"ok": True})


# ——— ERROR HANDLERS ———


@app.errorhandler(404)
def not_found(e):
    """Manejador para 404."""
    logger.warning(f"404 no encontrado")
    return jsonify({"error": "no encontrado"}), 404


@app.errorhandler(500)
def server_error(e):
    """Manejador para 500."""
    logger.error(f"Error interno del servidor: {e}", exc_info=True)
    return jsonify({"error": "error interno del servidor"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    logger.info(f"Iniciando servidor en {host}:{port}")
    app.run(host=host, port=port, debug=_flask_debug())
