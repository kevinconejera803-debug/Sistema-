"""Rutas del asistente y utilidades locales."""

from __future__ import annotations

from flask import Blueprint, jsonify

from app.http import get_json_payload
from app.services.assistant_service import answer_question
from app.services.calendar_service import check_upcoming_24h, format_urgent_notifications
from app.services.proactive_service import generate_proactive_insights
from app.utils import log_endpoint

research_bp = Blueprint("research", __name__, url_prefix="/api")

_AI_REMOVED_MESSAGE = {
    "error": "La capa de proveedores de IA fue retirada del proyecto.",
    "suggestion": "Usa /api/research/ask para obtener respuestas locales del sistema.",
}


@research_bp.route("/ai/ask", methods=["GET"])
@log_endpoint
def api_ai_chat_removed():
    return jsonify(_AI_REMOVED_MESSAGE), 410


@research_bp.route("/ai/status", methods=["GET"])
@log_endpoint
def api_ai_status_removed():
    return jsonify(_AI_REMOVED_MESSAGE), 410


@research_bp.route("/ai/providers", methods=["GET"])
@log_endpoint
def api_ai_providers_removed():
    return jsonify(_AI_REMOVED_MESSAGE), 410


@research_bp.route("/ai/switch", methods=["POST"])
@log_endpoint
def api_ai_switch_removed():
    return jsonify(_AI_REMOVED_MESSAGE), 410


@research_bp.route("/research")
@log_endpoint
def api_research_deprecated():
    return jsonify({
        "error": "Este endpoint esta deprecado. Usa /api/research/ask para interactuar con el asistente local.",
        "suggestion": "POST /api/research/ask",
    }), 410


@research_bp.route("/research/ask", methods=["POST"])
@log_endpoint
def api_research_ask():
    payload = get_json_payload()
    question = str(payload.get("question", "")).strip()

    if not question:
        return jsonify({"error": "Debes proporcionar una pregunta."}), 400

    result = answer_question(question)
    return jsonify({
        "question": question,
        **result,
    })


@research_bp.route("/research/suggestions", methods=["GET"])
@log_endpoint
def api_research_suggestions():
    insights = generate_proactive_insights()
    return jsonify({"suggestions": "\n".join(insights)})


@research_bp.route("/research/notifications", methods=["GET"])
@log_endpoint
def api_research_notifications():
    events = check_upcoming_24h()
    notifications = format_urgent_notifications(events)

    return jsonify({
        "notifications": notifications,
        "count": len(events),
    })


@research_bp.route("/assistant/insights", methods=["GET"])
@log_endpoint
def api_assistant_insights():
    return jsonify({
        "status": "ok",
        "insights": generate_proactive_insights(),
        "provider": "system",
    })
