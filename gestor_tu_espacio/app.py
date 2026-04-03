"""
Tu espacio — Flask: SYSTEM INTERFACE / dashboard y módulos navegables.
"""
import os
from datetime import datetime

from flask import Flask, abort, redirect, render_template, url_for

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

# Cada entrada = una ruta /<slug> con la misma interfaz SYSTEM INTERFACE
MODULES = [
    {
        "slug": "calendario",
        "title": "CALENDARIO",
        "desc": "Día - semana - mes",
        "icon": "🕐",
        "theme": "teal",
        "lead": "Agenda unificada: revisa el día, la semana o el mes y enlaza recordatorios.",
    },
    {
        "slug": "universidad",
        "title": "UNIVERSIDAD",
        "desc": "Aula y entregas",
        "icon": "🎓",
        "theme": "purple",
        "lead": "Seguimiento de asignaturas, entregas y material del aula en un solo panel.",
    },
    {
        "slug": "trading-lab",
        "title": "TRADING LAB",
        "desc": "Mercados",
        "icon": "📈",
        "theme": "yellow",
        "lead": "Laboratorio de mercados: cotizaciones, listas y espacio para tus indicadores.",
    },
    {
        "slug": "ciberseguridad",
        "title": "CIBERSEGURIDAD",
        "desc": "Shadow Network",
        "icon": "🛡",
        "theme": "teal",
        "lead": "Mapa de superficie de ataque, notas de hardening y checklist de buenas prácticas.",
    },
    {
        "slug": "herramientas",
        "title": "HERRAMIENTAS",
        "desc": "PDF - exportar - QR",
        "icon": "🧰",
        "theme": "red",
        "lead": "Utilidades rápidas: documentos, exportaciones y códigos QR desde un mismo sitio.",
    },
    {
        "slug": "contactos",
        "title": "CONTACTOS",
        "desc": "Tarjetas y agenda",
        "icon": "✉",
        "theme": "purple",
        "lead": "Agenda de personas, tarjetas de contacto y seguimiento de conversaciones.",
    },
    {
        "slug": "noticias",
        "title": "NOTICIAS",
        "desc": "Fuentes y feeds",
        "icon": "📰",
        "theme": "blue",
        "lead": "Fuentes configurables y lectura de titulares en modo concentración.",
    },
    {
        "slug": "buscar",
        "title": "BUSCAR",
        "desc": "Búsqueda global",
        "icon": "🔍",
        "theme": "green",
        "lead": "Busca en calendario, archivos y notas cuando conectes índices.",
    },
    {
        "slug": "calculadora",
        "title": "CALCULADORA",
        "desc": "Paso a paso",
        "icon": "🔢",
        "theme": "orange",
        "lead": "Cálculos con historial y desglose paso a paso para repasar operaciones.",
    },
]


def _month_badge():
    now = datetime.now()
    return f"{_MONTHS_ES[now.month - 1]} - {now.year}"


@app.context_processor
def _ctx():
    return {"month_badge": _month_badge(), "nav_modules": MODULES}


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
    return render_template("seccion.html", mod=mod, active_nav=slug)


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    app.run(host=host, port=port, debug=True)
