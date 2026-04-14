"""Health checks y metricas basicas."""

from __future__ import annotations

from flask import Blueprint, jsonify

from app.config import APP_VERSION, MODULES, SERVICE_NAME
from app.extensions import limiter
from app.services.system_service import get_database_stats

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.route("/health")
@limiter.limit("30 per minute")
def api_health():
    return jsonify({
        "status": "ok",
        "version": APP_VERSION,
        "modules": MODULES,
        "service": SERVICE_NAME,
    })


@health_bp.route("/stats")
@limiter.limit("30 per minute")
def api_stats():
    return jsonify(get_database_stats())
