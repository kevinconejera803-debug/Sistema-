"""Rutas API para noticias."""

from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from app.config import NEWS_TTL
from app.extensions import limiter
from app.services.news_service import fetch_news, invalidate_news_cache, summarize_news_items
from app.utils import log_endpoint

news_bp = Blueprint("news", __name__, url_prefix="/api")


@news_bp.route("/news")
@limiter.limit("10 per minute")
@log_endpoint
def api_news():
    if request.args.get("refresh"):
        invalidate_news_cache()
    return jsonify({
        "items": fetch_news(),
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ttl_seconds": int(NEWS_TTL),
    })


@news_bp.route("/news/summary")
@limiter.limit("5 per minute")
@log_endpoint
def api_news_summary():
    return jsonify({"summary": summarize_news_items(fetch_news())})
