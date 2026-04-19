"""Servicio de datos externos para respuestas locales del asistente."""

from __future__ import annotations

import time
from functools import lru_cache
from typing import Any

from app.config import logger

TOPIC_KEYWORDS = {
    "news": ["noticia", "que paso", "actualidad", "ultima", "nuevo", "happening"],
    "economics": ["economia", "mercado", "bolsa", "accion", "acciones", "dolar", "peso", "bitcoin", "cripto"],
    "politics": ["gobierno", "politica", "elecciones", "presidente", "congreso", "trump", "bukele"],
    "conflict": ["guerra", "conflicto", "ucrania", "gaza", "israel", "palestina", "militar"],
    "technology": ["ia", "inteligencia artificial", "openai", "google", "microsoft", "tech"],
}

# Cache TTL: 60 segundos
_CACHE_TTL = 60
_cache_store: dict[str, tuple[float, Any]] = {}


def _get_cached(key: str) -> Any:
    """Obtiene valor del cache si no ha expirado."""
    if key in _cache_store:
        timestamp, value = _cache_store[key]
        if time.time() - timestamp < _CACHE_TTL:
            return value
        del _cache_store[key]
    return None


def _set_cached(key: str, value: Any) -> None:
    """Guarda valor en cache."""
    _cache_store[key] = (time.time(), value)


def classify_question(question: str) -> str:
    """Clasifica el tipo de pregunta."""
    normalized = question.lower()

    for topic, keywords in TOPIC_KEYWORDS.items():
        for keyword in keywords:
            if keyword in normalized:
                return topic

    return "general"


def fetch_external_data(question: str) -> tuple[list[dict], str]:
    """Obtiene datos externos segun el tema principal de la pregunta."""
    topic = classify_question(question)

    if topic == "news":
        return get_news_data(), "noticias"
    if topic == "economics":
        return get_market_data(), "economia"
    if topic in {"politics", "conflict", "technology"}:
        return get_news_data(), "noticias"

    return [], "none"


def get_news_data() -> list[dict]:
    """Obtiene noticias recientes formateadas con cache."""
    cache_key = "news_data"
    
    # Revisar cache primero
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached
    
    try:
        from app.services.news_service import fetch_news

        formatted = []
        for item in fetch_news()[:5]:
            formatted.append({
                "title": item.get("title", "")[:100],
                "summary": item.get("summary", "")[:150],
                "source": item.get("source", ""),
                "url": item.get("link", ""),
                "published": item.get("published", "")[:16],
            })
        
        # Guardar en cache
        _set_cached(cache_key, formatted)
        return formatted
    except Exception as error:
        logger.error("Error fetching news: %s", error)
        return []


def get_market_data() -> list[dict]:
    """Obtiene datos de mercados con cache."""
    cache_key = "market_data"
    
    # Revisar cache primero  
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached
    
    try:
        from app.services.markets_service import fetch_markets

        formatted = []
        for item in fetch_markets()[:6]:
            formatted.append({
                "symbol": item.get("symbol", ""),
                "price": item.get("price", 0),
                "chg_pct": item.get("chg_pct", 0),
                "price_fmt": item.get("price_fmt", ""),
                "chg_fmt": item.get("chg_fmt", ""),
                "change": item.get("chg_fmt", ""),
            })
        
        # Guardar en cache
        _set_cached(cache_key, formatted)
        return formatted
    except Exception as error:
        logger.error("Error fetching markets: %s", error)
        return []


def format_external_data(external_data: list[dict], data_type: str) -> str:
    """Formatea datos externos como texto simple."""
    if not external_data:
        return "No hay datos disponibles."

    lines = []
    if data_type == "noticias":
        for item in external_data:
            title = item.get("title", "")
            source = item.get("source", "")
            url = item.get("url", "")
            if title:
                lines.append(f"- {title} ({source})")
                if url and url != "#":
                    lines.append(f"  Fuente: {url}")
    elif data_type == "economia":
        for item in external_data:
            symbol = item.get("symbol", "")
            price = item.get("price_fmt") or item.get("price", "")
            change = item.get("chg_fmt") or item.get("change", "")
            if symbol:
                lines.append(f"- {symbol}: {price} ({change})")

    return "\n".join(lines) if lines else "No hay datos disponibles."


def get_sources_list(external_data: list[dict]) -> str:
    """Genera una lista breve de fuentes con URL reales."""
    sources = []

    for item in external_data:
        url = item.get("url", "")
        source = item.get("source", "")
        if url and url != "#":
            sources.append(f"- {source}: {url}")

    return "\n".join(sources[:3]) if sources else ""


def clear_cache() -> None:
    """Limpia el cache manualmente."""
    global _cache_store
    _cache_store = {}
    logger.info("External data cache cleared")


def get_cache_stats() -> dict:
    """Obtiene estadísticas del cache."""
    return {
        "keys": list(_cache_store.keys()),
        "ttl_seconds": _CACHE_TTL,
    }