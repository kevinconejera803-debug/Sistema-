"""
Blueprint noticias: API de noticias RSS.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from app import limiter
from app.config import logger, NEWS_TTL
from app.services.news_service import fetch_news, invalidate_news_cache
from app.ai.core.manager import get_ai_manager
from app.utils import log_endpoint

news_bp = Blueprint("news", __name__, url_prefix="/api")


@news_bp.route("/news")
@limiter.limit("10 per minute")
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


@news_bp.route("/news/summary")
@limiter.limit("5 per minute")
@log_endpoint
def api_news_summary():
    """Resumen de noticias generado por IA."""
    from app.services.news_service import generate_news_summary
    
    ai_manager = get_ai_manager()
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            summary = loop.run_until_complete(generate_news_summary(ai_manager))
        finally:
            loop.close()
        
        return jsonify({
            "summary": summary,
            "provider": ai_manager.provider_name,
        })
    except Exception as e:
        logger.error(f"Error en summary: {e}")
        return jsonify({"error": str(e)}), 500
