"""Rutas HTTP del modulo de calendario."""

from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.http import get_json_payload, parse_pagination_args
from app.services.event_service import create_event, delete_event, list_events, update_event
from app.utils import log_endpoint

calendar_bp = Blueprint("calendar", __name__, url_prefix="/api/calendar")


@calendar_bp.route("/events", methods=["GET"])
@log_endpoint
def api_calendar_list():
    """Obtiene eventos filtrados por rango y paginacion."""
    limit, offset = parse_pagination_args()
    payload = list_events(
        from_iso=request.args.get("from", "").strip(),
        to_iso=request.args.get("to", "").strip(),
        limit=limit,
        offset=offset,
    )
    return jsonify(payload)


@calendar_bp.route("/events", methods=["POST"])
@log_endpoint
def api_calendar_create():
    """Crea un evento validado."""
    return jsonify(create_event(get_json_payload())), 201


@calendar_bp.route("/events/<int:event_id>", methods=["PUT"])
@log_endpoint
def api_calendar_update(event_id: int):
    """Actualiza parcialmente un evento."""
    return jsonify(update_event(event_id, get_json_payload()))


@calendar_bp.route("/events/<int:event_id>", methods=["DELETE"])
@log_endpoint
def api_calendar_delete(event_id: int):
    """Elimina un evento."""
    return jsonify(delete_event(event_id))
