"""
Blueprint mercados: API de cotizaciones.
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app import limiter
from app.services.markets_service import fetch_markets, invalidate_markets_cache
from app.utils import log_endpoint

markets_bp = Blueprint("markets", __name__, url_prefix="/api")


@markets_bp.route("/mercados")
@markets_bp.route("/trading")
@limiter.limit("10 per minute")
@log_endpoint
def api_mercados():
    """API: Cotizaciones de mercados."""
    if request.args.get("refresh"):
        invalidate_markets_cache()
    return jsonify({"rows": fetch_markets()})
