"""Servicio de noticias RSS con cache y resumenes locales."""

from __future__ import annotations

import re
from datetime import datetime, timezone

from app.config import NEWS_TTL, logger
from app.extensions import cache

_REGION_LABELS = {
    "economia": "Economia y finanzas",
    "internacional": "Internacional y geopolitica",
    "politica": "Politica",
}

_FEEDS = [
    ("http://feeds.bbci.co.uk/news/business/rss.xml", "BBC Business", "economia"),
    ("http://feeds.bbci.co.uk/news/world/rss.xml", "BBC World", "internacional"),
    ("https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml", "NYT Economy", "economia"),
    ("https://www.theguardian.com/business/rss", "Guardian Business", "economia"),
    ("https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia", "El Pais Economia", "economia"),
]


def _parse_time(entry):
    parsed = entry.get("published_parsed") or entry.get("updated_parsed")
    if not parsed:
        return None
    return datetime(parsed.tm_year, parsed.tm_mon, parsed.tm_mday, parsed.tm_hour, parsed.tm_min, parsed.tm_sec, tzinfo=timezone.utc)


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
                for entry in feedparser.parse(url).entries[:5]:
                    title = (entry.get("title") or "").strip()
                    if not title:
                        continue

                    summary = (entry.get("summary") or "")[:200]
                    published = _parse_time(entry)
                    items.append({
                        "title": title,
                        "link": entry.get("link", "#"),
                        "source": source,
                        "region": region,
                        "region_label": _REGION_LABELS.get(region, region),
                        "summary": re.sub(r"<[^>]+>", "", summary),
                        "published": entry.get("published", ""),
                        "published_iso": published.isoformat() if published else "",
                    })
            except Exception as error:
                logger.warning("Feed error: %s", error)
    except Exception as error:
        logger.error("News error: %s", error)
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
    """Genera un resumen breve y deterministico."""
    if not items:
        return "No hay noticias disponibles."

    selected = items[:max_items]
    headlines = "; ".join(f"{item['title']} ({item['source']})" for item in selected)
    return f"Titulares destacados: {headlines}."
