"""
Blueprint core: panel principal, módulos y redirecciones.
"""
from __future__ import annotations

import os
from datetime import datetime

from flask import Blueprint, abort, redirect, render_template, request, url_for

from app.config import logger
from app.services.news_service import fetch_news, invalidate_news_cache

core_bp = Blueprint("core", __name__)

_MONTHS_ES = ("ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC")
_SLUG_REMOVED_CALC = "calculadora"

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
        "slug": "investigacion",
        "title": "INVESTIGACIÓN",
        "desc": "Fuentes académicas y análisis",
        "icon": "🔎",
        "theme": "teal",
        "lead": "Asistente profesional de investigación: Google Scholar y fuentes verificables en tiempo real.",
    },
    {
        "slug": "asistente",
        "title": "ASISTENTE IA",
        "desc": "Chat con inteligencia",
        "icon": "🤖",
        "theme": "purple",
        "lead": "Chat inteligente con contexto de tu calendario y tareas.",
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


def _modules_ui():
    """Menú y tarjetas: excluye el módulo retirado (slug calculadora)."""
    return [m for m in MODULES if m.get("slug") != _SLUG_REMOVED_CALC]


def _month_badge():
    """Badge con mes y año actual."""
    now = datetime.now()
    return f"{_MONTHS_ES[now.month - 1]} - {now.year}"


@core_bp.context_processor
def _ctx():
    """Variables globales para templates."""
    return {
        "month_badge": _month_badge(),
        "university_intranet_url": (os.environ.get("TU_ESPACIO_INTRANET_URL") or "").strip(),
        "university_aula_url": (os.environ.get("TU_ESPACIO_AULA_URL") or "").strip(),
    }


@core_bp.route("/")
def index():
    """Nueva landing page con estilo moderno."""
    return render_template("index.html")


@core_bp.route("/tu-espacio")
def tu_espacio():
    """Panel principal con tarjetas de módulos."""
    access_cards = [
        {
            "title": m["title"],
            "desc": m["desc"],
            "icon": m["icon"],
            "theme": m["theme"],
            "href": url_for("core.modulo", slug=m["slug"]),
        }
        for m in _modules_ui()
    ]
    return render_template(
        "tu_espacio.html",
        access_cards=access_cards,
        active_nav="home",
    )


@core_bp.route("/trading-lab")
def trading_lab_redirect():
    """Antigua ruta del módulo de cotizaciones → Mercados."""
    logger.info("Redirigiendo /trading-lab a /mercados")
    return redirect(url_for("core.modulo", slug="mercados"), code=301)


@core_bp.route("/<slug>")
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
            invalidate_news_cache()
        extra["news_items"] = fetch_news()

    template_path = f"modulos/{slug}.html"
    return render_template(template_path, mod=mod, active_nav=slug, **extra)
