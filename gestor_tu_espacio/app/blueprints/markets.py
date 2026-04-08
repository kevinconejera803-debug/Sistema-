"""
Blueprint mercados: API de cotizaciones.
"""
from __future__ import annotations

import asyncio
from flask import Blueprint, jsonify, request

from app import limiter
from app.services.markets_service import fetch_markets, invalidate_markets_cache
from app.ai.core.manager import get_ai_manager
from app.utils import log_endpoint

markets_bp = Blueprint("markets", __name__, url_prefix="/api")


@markets_bp.route("/mercados")
@markets_bp.route("/trading")
@limiter.limit("12 per minute")
@log_endpoint
def api_mercados():
    """API: Cotizaciones de mercados."""
    if request.args.get("refresh"):
        invalidate_markets_cache()
    return jsonify({"rows": fetch_markets()})


@markets_bp.route("/markets/analysis")
@limiter.limit("5 per minute")
@log_endpoint
def api_markets_analysis():
    """Análisis de mercados generado por IA."""
    from app.services.markets_service import generate_market_analysis
    
    ai_manager = get_ai_manager()
    
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            analysis = loop.run_until_complete(generate_market_analysis(ai_manager))
        finally:
            loop.close()
        
        return jsonify({
            "analysis": analysis,
            "provider": ai_manager.provider_name,
        })
    except Exception as e:
        logger.error(f"Error en análisis: {e}")
        return jsonify({"error": str(e)}), 500
