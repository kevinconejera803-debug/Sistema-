"""Rutas API para mercados."""

from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.extensions import limiter
from app.services.markets_service import analyze_market_data, fetch_markets, invalidate_markets_cache
from app.utils import log_endpoint

markets_bp = Blueprint("markets", __name__, url_prefix="/api")


@markets_bp.route("/mercados")
@markets_bp.route("/trading")
@limiter.limit("12 per minute")
@log_endpoint
def api_mercados():
    if request.args.get("refresh"):
        invalidate_markets_cache()
    return jsonify({"rows": fetch_markets()})


@markets_bp.route("/markets/analysis")
@limiter.limit("5 per minute")
@log_endpoint
def api_markets_analysis():
    return jsonify({"analysis": analyze_market_data(fetch_markets())})
