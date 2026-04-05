"""
Blueprint calendario: CRUD de eventos.
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.config import logger
from app.database import db, Event
from app.utils import (
    validate_event_data, validate_partial_event_data,
    validate_iso_date, log_endpoint,
)

calendar_bp = Blueprint("calendar", __name__, url_prefix="/api/calendar")


def _parse_pagination() -> tuple[int, int]:
    """Devuelve (limit, offset) con límites seguros."""
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(200, max(1, int(request.args.get("limit", 50))))
    except ValueError:
        page = 1
        limit = 50
    offset = (page - 1) * limit
    return limit, offset


@calendar_bp.route("/events", methods=["GET"])
@log_endpoint
def api_calendar_list():
    """GET: Obtiene eventos entre fechas (con paginación)."""
    from_q = request.args.get("from", "").strip()
    to_q = request.args.get("to", "").strip()
    limit, offset = _parse_pagination()

    query = Event.query
    if from_q and to_q:
        if not validate_iso_date(from_q) or not validate_iso_date(to_q):
            return jsonify({"error": "from y to deben ser fechas ISO válidas"}), 400
        query = query.filter(Event.start_iso >= from_q, Event.start_iso <= to_q)

    query = query.order_by(Event.start_iso).limit(limit).offset(offset)
    return jsonify([e.to_dict() for e in query.all()])


@calendar_bp.route("/events", methods=["POST"])
@log_endpoint
def api_calendar_create():
    """POST: Crea nuevo evento con validación."""
    data = request.get_json(force=True, silent=True) or {}
    valid, cleaned, error = validate_event_data(data)
    if not valid:
        logger.warning(f"Evento inválido: {error}")
        return jsonify({"error": error}), 400

    event = Event(**cleaned)
    db.session.add(event)
    db.session.commit()
    logger.info(f"Evento creado: {event.id}")
    return jsonify(event.to_dict()), 201


@calendar_bp.route("/events/<int:eid>", methods=["PUT"])
@log_endpoint
def api_calendar_update(eid):
    """PUT: Actualiza evento con validación."""
    data = request.get_json(force=True, silent=True) or {}
    valid, cleaned, error = validate_partial_event_data(data)
    if not valid:
        return jsonify({"error": error}), 400

    if not cleaned:
        return jsonify({"error": "sin cambios"}), 400

    event = db.session.get(Event, eid)
    if not event:
        return jsonify({"error": "no encontrado"}), 404

    for k, v in cleaned.items():
        setattr(event, k, v)

    db.session.commit()
    return jsonify(event.to_dict())


@calendar_bp.route("/events/<int:eid>", methods=["DELETE"])
@log_endpoint
def api_calendar_delete(eid):
    """DELETE: Elimina evento."""
    event = db.session.get(Event, eid)
    if not event:
        return jsonify({"error": "no encontrado"}), 404
    db.session.delete(event)
    db.session.commit()
    return jsonify({"ok": True})
