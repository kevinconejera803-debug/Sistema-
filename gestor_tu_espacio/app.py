"""
Tu espacio — Flask: SYSTEM INTERFACE / dashboard principal.
"""
import os
from datetime import datetime

from flask import Flask, redirect, render_template, url_for

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

# Tarjetas de acceso (rutas internas: enlaza cuando existan las vistas)
ACCESS_CARDS = [
    {
        "title": "CALENDARIO",
        "desc": "Día - semana - mes",
        "icon": "🕐",
        "theme": "teal",
        "href": "#",
    },
    {
        "title": "UNIVERSIDAD",
        "desc": "Aula y entregas",
        "icon": "🎓",
        "theme": "purple",
        "href": "#",
    },
    {
        "title": "TRADING LAB",
        "desc": "Mercados",
        "icon": "📈",
        "theme": "yellow",
        "href": "#",
    },
    {
        "title": "CIBERSEGURIDAD",
        "desc": "Shadow Network",
        "icon": "🛡",
        "theme": "teal",
        "href": "#",
    },
    {
        "title": "HERRAMIENTAS",
        "desc": "PDF - exportar - QR",
        "icon": "🧰",
        "theme": "red",
        "href": "#",
    },
    {
        "title": "CONTACTOS",
        "desc": "Tarjetas y agenda",
        "icon": "✉",
        "theme": "purple",
        "href": "#",
    },
    {
        "title": "NOTICIAS",
        "desc": "Fuentes y feeds",
        "icon": "📰",
        "theme": "blue",
        "href": "#",
    },
    {
        "title": "BUSCAR",
        "desc": "Búsqueda global",
        "icon": "🔍",
        "theme": "green",
        "href": "#",
    },
    {
        "title": "CALCULADORA",
        "desc": "Paso a paso",
        "icon": "🔢",
        "theme": "orange",
        "href": "#",
    },
]


def _tu_espacio_context():
    now = datetime.now()
    month_badge = f"{_MONTHS_ES[now.month - 1]} - {now.year}"
    return {
        "access_cards": ACCESS_CARDS,
        "month_badge": month_badge,
    }


@app.route("/")
def index():
    return redirect(url_for("tu_espacio"))


@app.route("/tu-espacio")
def tu_espacio():
    return render_template("tu_espacio.html", **_tu_espacio_context())


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    app.run(host=host, port=port, debug=True)
