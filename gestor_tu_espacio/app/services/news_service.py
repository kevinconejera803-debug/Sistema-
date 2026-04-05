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
    """Obtiene noticias con cache."""
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

    cache.set("news", items, NEWS_TTL)
    return items


def invalidate_news_cache():
    cache.invalidate("news")
