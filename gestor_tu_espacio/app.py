"""
Tu espacio — Flask: SYSTEM INTERFACE, módulos funcionales y APIs.
"""
from __future__ import annotations

import os
import re
import time
from datetime import datetime

from flask import Flask, abort, jsonify, redirect, render_template, request, url_for

from database import get_db, init_db, row_to_dict

app = Flask(__name__)

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
_NEWS_TTL = 300.0
_news_cache: dict = {"t": 0.0, "items": []}

MODULES = [
    {
        "slug": "calendario",
        "title": "CALENDARIO",
        "desc": "Día - semana - mes",
        "icon": "🕐",
        "theme": "teal",
        "lead": "Horario profesional: mes, semana y día en hora local (24 h); SQLite con índices.",
    },
    {
        "slug": "universidad",
        "title": "UNIVERSIDAD",
        "desc": "Aula y entregas",
        "icon": "🎓",
        "theme": "purple",
        "lead": "Accesos rápidos al campus, entregas con filtros y estadísticas en tiempo real.",
    },
    {
        "slug": "trading-lab",
        "title": "TRADING LAB",
        "desc": "Mercados",
        "icon": "📈",
        "theme": "yellow",
        "lead": "Cotizaciones en vivo (yfinance) con variación y símbolos clave.",
    },
    {
        "slug": "ciberseguridad",
        "title": "CIBERSEGURIDAD",
        "desc": "Shadow Network",
        "icon": "🛡",
        "theme": "teal",
        "lead": "Checklist de hardening y postura; el progreso se guarda solo en tu navegador (localStorage).",
    },
    {
        "slug": "herramientas",
        "title": "HERRAMIENTAS",
        "desc": "PDF - exportar - QR",
        "icon": "🧰",
        "theme": "red",
        "lead": "Generador QR, exportación de texto y utilidades rápidas.",
    },
    {
        "slug": "contactos",
        "title": "CONTACTOS",
        "desc": "Tarjetas y agenda",
        "icon": "✉",
        "theme": "purple",
        "lead": "CRM ligero: alta, edición y búsqueda en base de datos local.",
    },
    {
        "slug": "noticias",
        "title": "NOTICIAS",
        "desc": "Fuentes y feeds",
        "icon": "📰",
        "theme": "blue",
        "lead": "Titulares RSS en tiempo real desde fuentes tecnología y generalista.",
    },
    {
        "slug": "buscar",
        "title": "BUSCAR",
        "desc": "Búsqueda global",
        "icon": "🔍",
        "theme": "green",
        "lead": "Índice sobre eventos, contactos y entregas almacenados en Tu espacio.",
    },
    {
        "slug": "calculadora",
        "title": "CALCULADORA",
        "desc": "Paso a paso",
        "icon": "🔢",
        "theme": "orange",
        "lead": "Calculadora científica con historial de operaciones y memoria.",
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


def _fetch_news_items():
    now = time.time()
    if _news_cache["items"] and (now - _news_cache["t"]) < _NEWS_TTL:
        return _news_cache["items"]
    items = []
    try:
        import feedparser

        feeds = [
            ("https://www.xataka.com/xml/rss/all.xml", "Xataka"),
            ("https://feeds.elpais.com/mrss-s/pages/ep/portada.xml", "El País"),
        ]
        for url, source in feeds:
            parsed = feedparser.parse(url)
            for e in getattr(parsed, "entries", [])[:10]:
                title = e.get("title", "").strip()
                link = e.get("link", "#")
                summary = e.get("summary", "") or e.get("description", "") or ""
                if summary:
                    summary = re.sub(r"<[^>]+>", " ", summary)
                    summary = re.sub(r"\s+", " ", summary).strip()
                    if len(summary) > 300:
                        summary = summary[:300] + "…"
                items.append(
                    {
                        "title": title,
                        "link": link,
                        "source": source,
                        "summary": summary,
                        "published": e.get("published", e.get("updated", "")),
                    }
                )
    except Exception:
        pass
    items = items[:36]
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
    return jsonify({"items": _fetch_news_items()})


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


# ——— Búsqueda ———


@app.route("/api/search", methods=["GET"])
def api_search():
    q = (request.args.get("q") or "").strip().lower()
    if len(q) < 2:
        return jsonify({"events": [], "contacts": [], "assignments": []})
    like = f"%{q}%"
    out = {"events": [], "contacts": [], "assignments": []}
    with get_db() as conn:
        for r in conn.execute(
            "SELECT * FROM events WHERE lower(title) LIKE ? OR lower(notes) LIKE ? LIMIT 20",
            (like, like),
        ).fetchall():
            out["events"].append(row_to_dict(r))
        for r in conn.execute(
            "SELECT * FROM contacts WHERE lower(name) LIKE ? OR lower(email) LIKE ? OR lower(company) LIKE ? LIMIT 20",
            (like, like, like),
        ).fetchall():
            out["contacts"].append(row_to_dict(r))
        for r in conn.execute(
            "SELECT * FROM assignments WHERE lower(title) LIKE ? OR lower(course) LIKE ? LIMIT 20",
            (like, like),
        ).fetchall():
            out["assignments"].append(row_to_dict(r))
    return jsonify(out)


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    app.run(host=host, port=port, debug=True)
