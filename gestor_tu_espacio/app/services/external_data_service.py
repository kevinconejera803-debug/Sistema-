"""
Servicio de datos externos para IA.
Obtiene información real de internet y la formatea para el asistente.
"""
import requests
from typing import Optional
from app.config import logger


# Categorías para detectar tipo de pregunta
TOPIC_KEYWORDS = {
    "news": ["noticia", "qué pasó", "actualidad", "última", "nuevo", "happening"],
    "economics": ["economía", "mercado", "bolsa", "acción", "acciones", "dólar", "peso", "bitcoin", "cripto"],
    "politics": ["gobierno", "política", "elecciones", "presidente", "congreso", "trump", "bukele"],
    "conflict": ["guerra", "conflicto", "ucrania", "gaza", "israel", "palestina", "militar"],
    "technology": ["ia", "inteligencia artificial", "openai", "google", "microsoft", "tech"],
}


def classify_question(question: str) -> str:
    """Clasifica el tipo de pregunta."""
    q = question.lower()
    
    for topic, keywords in TOPIC_KEYWORDS.items():
        for kw in keywords:
            if kw in q:
                return topic
    
    return "general"


def fetch_external_data(question: str) -> tuple[list[dict], str]:
    """
    Obtiene datos externos según el tipo de pregunta.
    Retorna: (datos, tipo)
    """
    topic = classify_question(question)
    
    if topic == "news":
        return get_news_data(), "noticias"
    elif topic == "economics":
        return get_market_data(), "economía"
    elif topic == "politics":
        return get_news_data(), "noticias"
    elif topic == "conflict":
        return get_news_data(), "noticias"
    elif topic == "technology":
        return get_news_data(), "noticias"
    
    return [], "none"


def get_news_data() -> list[dict]:
    """Obtiene noticias recientes formateadas."""
    try:
        from app.services.news_service import fetch_news
        news = fetch_news()
        
        formatted = []
        for item in news[:5]:
            formatted.append({
                "title": item.get("title", "")[:100],
                "summary": item.get("summary", "")[:150],
                "source": item.get("source", ""),
                "url": item.get("link", ""),
                "published": item.get("published", "")[:16]
            })
        return formatted
    except Exception as e:
        logger.error(f"Error fetching news: {e}")
        return []


def get_market_data() -> list[dict]:
    """Obtiene datos de mercados."""
    try:
        from app.services.markets_service import fetch_markets
        markets = fetch_markets()
        
        formatted = []
        for m in markets[:6]:
            formatted.append({
                "symbol": m.get("symbol", ""),
                "price": m.get("price_fmt", ""),
                "change": m.get("chg_fmt", "")
            })
        return formatted
    except Exception as e:
        logger.error(f"Error fetching markets: {e}")
        return []


def format_external_data(external_data: list[dict], data_type: str) -> str:
    """Formatea datos externos para el prompt."""
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
    elif data_type == "economía":
        for item in external_data:
            symbol = item.get("symbol", "")
            price = item.get("price", "")
            change = item.get("change", "")
            if symbol:
                lines.append(f"- {symbol}: {price} ({change})")
    
    return "\n".join(lines) if lines else "No hay datos disponibles."


def get_sources_list(external_data: list[dict]) -> str:
    """Genera lista de fuentes/enlaces."""
    sources = []
    
    for item in external_data:
        url = item.get("url", "")
        title = item.get("title", "")[:60]
        source = item.get("source", "")
        
        if url and url != "#" and title:
            sources.append(f"- {title}... ({source})")
    
    if sources:
        return "\n".join(sources[:3])
    return ""