"""
Blueprint noticias: API de noticias RSS.
"""
from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from app.config import logger, NEWS_TTL
from app.services.news_service import fetch_news, invalidate_news_cache
from app.utils import log_endpoint

news_bp = Blueprint("news", __name__, url_prefix="/api")


@news_bp.route("/news")
@log_endpoint
def api_news():
    """API: Noticias RSS."""
    if request.args.get("refresh"):
        invalidate_news_cache()
    payload = {
        "items": fetch_news(),
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ttl_seconds": int(NEWS_TTL),
    }
    return jsonify(payload)
