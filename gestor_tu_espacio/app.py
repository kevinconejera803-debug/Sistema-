"""
Tu espacio — Flask: SYSTEM INTERFACE, módulos funcionales y APIs.
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

from database import get_db, init_db, row_to_dict

load_dotenv(Path(__file__).resolve().parent / ".env")

app = Flask(__name__)


def _flask_debug() -> bool:
    """Modo debug solo si FLASK_DEBUG=1/true/yes (más seguro que True fijo)."""
    v = os.environ.get("FLASK_DEBUG", "0").strip().lower()
    return v in ("1", "true", "yes")

_MONTHS_ES = (
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
)

init_db()

_trading_cache: dict = {"t": 0.0, "rows": []}
_NEWS_TTL = 90.0
_news_cache: dict = {"t": 0.0, "items": []}
_NEWS_TZ = ZoneInfo("America/Santiago")
_MESES_ES = (
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
)
_NEWS_REGION_LABELS = {
    "economia": "Economía & finanzas",
    "internacional": "Internacional & geopolítica",
    "politica": "Política",
}

MODULES = [
    {
        "slug": "calendario",
        "title": "CALENDARIO",
        "desc": "Día - semana - mes",
        "icon": "🕐",
        "theme": "teal",
        "lead": "Horario 24 h (local): mes, semana y día con eventos en SQLite.",
    },
    {
        "slug": "universidad",
        "title": "UNIVERSIDAD",
        "desc": "Aula y entregas",
        "icon": "🎓",
        "theme": "purple",
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
        "slug": "trading-lab",
        "title": "TRADING LAB",
        "desc": "Mercados",
        "icon": "📈",
        "theme": "yellow",
        "lead": "Índices, FX y cripto con variación diaria (yfinance, caché ~60 s).",
    },
    {
        "slug": "noticias",
        "title": "NOTICIAS",
        "desc": "Economía & política",
        "icon": "📰",
        "theme": "blue",
        "lead": "Economía, mercados, política e internacional (BBC, NYT, Guardian, El País, CNBC…); hora de publicación en Chile.",
    },
    {
        "slug": "ciberseguridad",
        "title": "CIBERSEGURIDAD",
        "desc": "Shadow Network",
        "icon": "🛡",
        "theme": "teal",
        "lead": "Checklist por categorías con progreso visual; datos solo en tu navegador.",
    },
    {
        "slug": "calculadora",
        "title": "CALCULADORA",
        "desc": "Científica · math.js",
        "icon": "🔢",
        "theme": "orange",
        "lead": "Calculadora (tema SYSTEM INTERFACE): panel oscuro, KaTeX + math.js, teclado 123 / ƒ(x), historial, Rad·Deg, C/CE/ans.",
    },
]


def _month_badge():
    now = datetime.now()
    return f"{_MONTHS_ES[now.month - 1]} - {now.year}"


@app.context_processor
def _ctx():
    return {
        "month_badge": _month_badge(),
        "nav_modules": MODULES,
        "university_intranet_url": (os.environ.get("TU_ESPACIO_INTRANET_URL") or "").strip(),
        "university_aula_url": (os.environ.get("TU_ESPACIO_AULA_URL") or "").strip(),
    }


def _access_cards():
    return [
        {
            "title": m["title"],
            "desc": m["desc"],
            "icon": m["icon"],
            "theme": m["theme"],
            "href": url_for("modulo", slug=m["slug"]),
        }
        for m in MODULES
    ]


def _entry_published_utc(entry: dict) -> datetime | None:
    t = entry.get("published_parsed") or entry.get("updated_parsed")
    if not t:
        return None
    return datetime(
        t.tm_year,
        t.tm_mon,
        t.tm_mday,
        t.tm_hour,
        t.tm_min,
        t.tm_sec,
        tzinfo=timezone.utc,
    )


def _published_label_chile(dt: datetime) -> str:
    local = dt.astimezone(_NEWS_TZ)
    return (
        f"{local.day} {_MESES_ES[local.month - 1]} {local.year}, "
        f"{local.hour:02d}:{local.minute:02d} · hora Chile"
    )


def _fetch_news_items():
    """RSS orientados a economía, finanzas, internacional, geopolítica y política; orden por fecha; sin duplicar enlaces."""
    now = time.time()
    if _news_cache["items"] and (now - _news_cache["t"]) < _NEWS_TTL:
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
                    collected.append(
                        {
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
                        }
                    )
            except Exception:
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
    except Exception:
        pass
    _news_cache["t"] = now
    _news_cache["items"] = items
    return items


def _fetch_trading_rows():
    now = time.time()
    if _trading_cache["rows"] and (now - _trading_cache["t"]) < 60:
        return _trading_cache["rows"]
    rows = []
    try:
        import yfinance as yf

        symbols = ["SPY", "QQQ", "AAPL", "MSFT", "NVDA", "BTC-USD", "EURUSD=X"]
        for sym in symbols:
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
            rows.append(
                {
                    "symbol": sym,
                    "price": last,
                    "chg_pct": chg,
                    "price_fmt": pf,
                    "chg_fmt": f"{chg:+.2f}%",
                }
            )
    except Exception:
        rows = [
            {
                "symbol": "—",
                "price": 0,
                "chg_pct": 0.0,
                "price_fmt": "—",
                "chg_fmt": "—",
                "error": True,
            },
        ]
    _trading_cache["t"] = now
    _trading_cache["rows"] = rows
    return rows


@app.route("/")
def index():
    return redirect(url_for("tu_espacio"))


@app.route("/tu-espacio")
def tu_espacio():
    return render_template(
        "tu_espacio.html",
        access_cards=_access_cards(),
        active_nav="home",
    )


@app.route("/<slug>")
def modulo(slug):
    mod = next((m for m in MODULES if m["slug"] == slug), None)
    if not mod:
        abort(404)
    extra = {}
    if slug == "noticias":
        if request.args.get("refresh"):
            _news_cache["t"] = 0.0
        extra["news_items"] = _fetch_news_items()
    return render_template(f"modulos/{slug}.html", mod=mod, active_nav=slug, **extra)


@app.route("/api/trading")
def api_trading():
    if request.args.get("refresh"):
        _trading_cache["t"] = 0.0
    return jsonify({"rows": _fetch_trading_rows()})


@app.route("/api/news")
def api_news():
    if request.args.get("refresh"):
        _news_cache["t"] = 0.0
    payload = {
        "items": _fetch_news_items(),
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ttl_seconds": int(_NEWS_TTL),
    }
    return jsonify(payload)


# ——— API calendario ———


@app.route("/api/calendar/events", methods=["GET"])
def api_calendar_list():
    from_q = request.args.get("from", "").strip()
    to_q = request.args.get("to", "").strip()
    with get_db() as conn:
        if from_q and to_q:
            cur = conn.execute(
                "SELECT * FROM events WHERE start_iso >= ? AND start_iso <= ? ORDER BY start_iso",
                (from_q, to_q),
            )
        else:
            cur = conn.execute("SELECT * FROM events ORDER BY start_iso LIMIT 500")
        rows = cur.fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/calendar/events", methods=["POST"])
def api_calendar_create():
    data = request.get_json(force=True, silent=True) or {}
    title = (data.get("title") or "").strip()
    start_iso = (data.get("start_iso") or "").strip()
    if not title or not start_iso:
        return jsonify({"error": "title y start_iso requeridos"}), 400
    end_iso = (data.get("end_iso") or "").strip() or None
    all_day = 1 if data.get("all_day", True) else 0
    color = (data.get("color") or "teal").strip()[:20]
    notes = (data.get("notes") or "").strip()
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO events (title, start_iso, end_iso, all_day, color, notes) VALUES (?,?,?,?,?,?)",
            (title, start_iso, end_iso, all_day, color, notes),
        )
        eid = cur.lastrowid
        row = conn.execute("SELECT * FROM events WHERE id = ?", (eid,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@app.route("/api/calendar/events/<int:eid>", methods=["PUT"])
def api_calendar_update(eid):
    data = request.get_json(force=True, silent=True) or {}
    fields = []
    vals = []
    for key in ("title", "start_iso", "end_iso", "color", "notes"):
        if key in data:
            fields.append(f"{key} = ?")
            vals.append(data[key])
    if "all_day" in data:
        fields.append("all_day = ?")
        vals.append(1 if data["all_day"] else 0)
    if not fields:
        return jsonify({"error": "sin cambios"}), 400
    vals.append(eid)
    with get_db() as conn:
        conn.execute(f"UPDATE events SET {', '.join(fields)} WHERE id = ?", vals)
        row = conn.execute("SELECT * FROM events WHERE id = ?", (eid,)).fetchone()
    if not row:
        return jsonify({"error": "no encontrado"}), 404
    return jsonify(row_to_dict(row))


@app.route("/api/calendar/events/<int:eid>", methods=["DELETE"])
def api_calendar_delete(eid):
    with get_db() as conn:
        conn.execute("DELETE FROM events WHERE id = ?", (eid,))
    return jsonify({"ok": True})


# ——— API contactos ———


@app.route("/api/contacts", methods=["GET"])
def api_contacts_list():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM contacts ORDER BY name COLLATE NOCASE").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/contacts", methods=["POST"])
def api_contacts_create():
    data = request.get_json(force=True, silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "nombre requerido"}), 400
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    company = (data.get("company") or "").strip()
    notes = (data.get("notes") or "").strip()
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO contacts (name, email, phone, company, notes) VALUES (?,?,?,?,?)",
            (name, email, phone, company, notes),
        )
        cid = cur.lastrowid
        row = conn.execute("SELECT * FROM contacts WHERE id = ?", (cid,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@app.route("/api/contacts/<int:cid>", methods=["PUT"])
def api_contacts_update(cid):
    data = request.get_json(force=True, silent=True) or {}
    fields = []
    vals = []
    for key in ("name", "email", "phone", "company", "notes"):
        if key in data:
            fields.append(f"{key} = ?")
            vals.append(data[key])
    if not fields:
        return jsonify({"error": "sin cambios"}), 400
    vals.append(cid)
    with get_db() as conn:
        conn.execute(f"UPDATE contacts SET {', '.join(fields)} WHERE id = ?", vals)
        row = conn.execute("SELECT * FROM contacts WHERE id = ?", (cid,)).fetchone()
    if not row:
        return jsonify({"error": "no encontrado"}), 404
    return jsonify(row_to_dict(row))


@app.route("/api/contacts/<int:cid>", methods=["DELETE"])
def api_contacts_delete(cid):
    with get_db() as conn:
        conn.execute("DELETE FROM contacts WHERE id = ?", (cid,))
    return jsonify({"ok": True})


# ——— API universidad ———


@app.route("/api/assignments", methods=["GET"])
def api_assignments_list():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM assignments ORDER BY due_iso").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/assignments", methods=["POST"])
def api_assignments_create():
    data = request.get_json(force=True, silent=True) or {}
    course = (data.get("course") or "").strip()
    title = (data.get("title") or "").strip()
    due_iso = (data.get("due_iso") or "").strip()
    if not course or not title or not due_iso:
        return jsonify({"error": "curso, título y fecha requeridos"}), 400
    status = (data.get("status") or "pendiente").strip()
    weight = int(data.get("weight") or 0)
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO assignments (course, title, due_iso, status, weight) VALUES (?,?,?,?,?)",
            (course, title, due_iso, status, weight),
        )
        aid = cur.lastrowid
        row = conn.execute("SELECT * FROM assignments WHERE id = ?", (aid,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@app.route("/api/assignments/<int:aid>", methods=["PUT"])
def api_assignments_update(aid):
    data = request.get_json(force=True, silent=True) or {}
    fields = []
    vals = []
    for key in ("course", "title", "due_iso", "status", "weight"):
        if key in data:
            fields.append(f"{key} = ?")
            vals.append(data[key] if key != "weight" else int(data[key] or 0))
    if not fields:
        return jsonify({"error": "sin cambios"}), 400
    vals.append(aid)
    with get_db() as conn:
        conn.execute(f"UPDATE assignments SET {', '.join(fields)} WHERE id = ?", vals)
        row = conn.execute("SELECT * FROM assignments WHERE id = ?", (aid,)).fetchone()
    if not row:
        return jsonify({"error": "no encontrado"}), 404
    return jsonify(row_to_dict(row))


@app.route("/api/assignments/<int:aid>", methods=["DELETE"])
def api_assignments_delete(aid):
    with get_db() as conn:
        conn.execute("DELETE FROM assignments WHERE id = ?", (aid,))
    return jsonify({"ok": True})


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    app.run(host=host, port=port, debug=_flask_debug())
