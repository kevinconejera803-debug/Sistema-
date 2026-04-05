"""
Blueprint universidad: CRUD de tareas/entregas.
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.config import logger
from app.database import db, Assignment
from app.utils import (
    validate_assignment_data, validate_partial_assignment_data,
    log_endpoint,
)

university_bp = Blueprint("university", __name__, url_prefix="/api")


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


@university_bp.route("/assignments", methods=["GET"])
@log_endpoint
def api_assignments_list():
    """GET: Obtiene todas las tareas (con paginación)."""
    limit, offset = _parse_pagination()
    query = Assignment.query.order_by(Assignment.due_iso).limit(limit).offset(offset)
    return jsonify([a.to_dict() for a in query.all()])


@university_bp.route("/assignments", methods=["POST"])
@log_endpoint
def api_assignments_create():
    """POST: Crea nueva tarea con validación."""
    data = request.get_json(force=True, silent=True) or {}
    valid, cleaned, error = validate_assignment_data(data)
    if not valid:
        logger.warning(f"Tarea inválida: {error}")
        return jsonify({"error": error}), 400

    assignment = Assignment(
        course=cleaned["course"],
        title=cleaned["title"],
        due_iso=cleaned["due_iso"],
        status=cleaned["status"],
        weight=cleaned["weight"],
        notes=cleaned.get("notes", ""),
    )
    db.session.add(assignment)
    db.session.commit()
    logger.info(f"Tarea creada: {assignment.id}")
    return jsonify(assignment.to_dict()), 201


@university_bp.route("/assignments/<int:aid>", methods=["PUT"])
@log_endpoint
def api_assignments_update(aid):
    """PUT: Actualiza tarea con validación."""
    data = request.get_json(force=True, silent=True) or {}
    valid, cleaned, error = validate_partial_assignment_data(data)
    if not valid:
        logger.warning(f"Update tarea inválido: {error}")
        return jsonify({"error": error}), 400

    assignment = db.session.get(Assignment, aid)
    if not assignment:
        return jsonify({"error": "no encontrado"}), 404

    valid_fields = {"course", "title", "due_iso", "status", "weight", "notes"}
    applied = False
    for field in valid_fields:
        if field in cleaned:
            setattr(assignment, field, cleaned[field])
            applied = True

    if not applied:
        return jsonify({"error": "sin cambios"}), 400

    db.session.commit()
    logger.info(f"Tarea {aid} actualizada")
    return jsonify(assignment.to_dict())


@university_bp.route("/assignments/<int:aid>", methods=["DELETE"])
@log_endpoint
def api_assignments_delete(aid):
    """DELETE: Elimina tarea."""
    assignment = db.session.get(Assignment, aid)
    if not assignment:
        return jsonify({"error": "no encontrado"}), 404

    db.session.delete(assignment)
    db.session.commit()
    logger.info(f"Tarea {aid} eliminada")
    return jsonify({"ok": True})
