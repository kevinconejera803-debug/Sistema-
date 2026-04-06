"""
Servicio de noticias RSS con cache.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from app import cache
from app.config import logger, NEWS_TTL

_MONTHS_ES = ("ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic")
_NEWS_TZ = ZoneInfo("America/Santiago")
_REGION_LABELS = {
    "economia": "Economía & finanzas",
    "internacional": "Internacional & geopolítica",
    "politica": "Política",
}

_FEEDS = [
    ("http://feeds.bbci.co.uk/news/business/rss.xml", "BBC · Business", "economia"),
    ("http://feeds.bbci.co.uk/news/world/rss.xml", "BBC · World", "internacional"),
    ("https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml", "NYT · Economy", "economia"),
    ("https://www.theguardian.com/business/rss", "Guardian · Business", "economia"),
    ("https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia", "El País · Economía", "economia"),
]


def _parse_time(entry):
    t = entry.get("published_parsed") or entry.get("updated_parsed")
    if not t:
        return None
    return datetime(t.tm_year, t.tm_mon, t.tm_mday, t.tm_hour, t.tm_min, t.tm_sec, tzinfo=timezone.utc)


def fetch_news():
    """Obtiene noticias con cache y fallback."""
    cached = cache.get("news")
    if cached:
        return cached

    items = []
    try:
        import feedparser
        for url, source, region in _FEEDS:
            try:
                for e in feedparser.parse(url).entries[:5]:
                    title = (e.get("title") or "").strip()
                    if not title:
                        continue
                    summary = (e.get("summary") or "")[:200]
                    dt = _parse_time(e)
                    items.append({
                        "title": title,
                        "link": e.get("link", "#"),
                        "source": source,
                        "region": region,
                        "region_label": _REGION_LABELS.get(region, region),
                        "summary": re.sub(r"<[^>]+>", "", summary),
                        "published": e.get("published", ""),
                    })
            except Exception as ex:
                logger.warning(f"Feed error: {ex}")
    except Exception as e:
        logger.error(f"News error: {e}")
        cached_fallback = cache.get("news_fallback")
        if cached_fallback:
            return cached_fallback

    if items:
        cache.set("news", items, NEWS_TTL)
        cache.set("news_fallback", items, NEWS_TTL * 24)
    return items


def invalidate_news_cache():
    cache.invalidate("news")


def summarize_news_items(items: list[dict], max_items: int = 5) -> str:
    """Genera resumen de noticias usando IA."""
    if not items:
        return "No hay noticias disponibles."
    
    headlines = [f"- {item['title']}" for item in items[:max_items]]
    headlines_text = "\n".join(headlines)
    
    prompt = f"""Resume brevemente estas noticias en 2-3 oraciones, highlighting los temas más importantes:

{headlines_text}

Resumen:"""
    return prompt


async def generate_news_summary(ai_manager) -> str:
    """Genera resumen de noticias actuales usando IA."""
    from app.services.news_service import fetch_news
    
    items = fetch_news()
    if not items:
        return "No hay noticias disponibles."
    
    prompt = summarize_news_items(items)
    
    try:
        summary = await ai_manager.generate(prompt)
        return summary if isinstance(summary, str) else str(summary)
    except Exception as e:
        logger.error(f"Error generando resumen: {e}")
        return "No se pudo generar el resumen."
