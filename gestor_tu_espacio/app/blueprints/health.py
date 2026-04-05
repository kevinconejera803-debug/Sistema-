"""
Blueprint health: Health check y métricas del sistema.
"""
from flask import Blueprint, jsonify

from app import limiter
from app.database import db

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.route("/health")
@limiter.limit("30 per minute")
def api_health():
    """Health check del sistema."""
    return jsonify({
        "status": "ok",
        "version": "1.0.0",
        "modules": 8,
        "service": "tu_espacio"
    })


@health_bp.route("/stats")
@limiter.limit("30 per minute")
def api_stats():
    """Estadísticas de la base de datos."""
    try:
        event_count = db.session.execute(db.text("SELECT COUNT(*) FROM events")).scalar() or 0
        contact_count = db.session.execute(db.text("SELECT COUNT(*) FROM contacts")).scalar() or 0
        assignment_count = db.session.execute(db.text("SELECT COUNT(*) FROM assignments")).scalar() or 0
        
        return jsonify({
            "events": event_count,
            "contacts": contact_count,
            "assignments": assignment_count,
            "total": event_count + contact_count + assignment_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
