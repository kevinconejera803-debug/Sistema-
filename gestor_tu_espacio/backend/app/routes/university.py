"""Rutas HTTP del modulo universitario."""

from __future__ import annotations

from flask import Blueprint, jsonify

from app.http import get_json_payload, parse_pagination_args
from app.services.assignment_service import (
    create_assignment,
    delete_assignment,
    list_assignments,
    update_assignment,
)
from app.services.university_service import build_task_suggestions
from app.utils import log_endpoint

university_bp = Blueprint("university", __name__, url_prefix="/api")


@university_bp.route("/assignments", methods=["GET"])
@log_endpoint
def api_assignments_list():
    """Obtiene tareas universitarias con paginacion."""
    limit, offset = parse_pagination_args()
    return jsonify(list_assignments(limit=limit, offset=offset))


@university_bp.route("/assignments", methods=["POST"])
@log_endpoint
def api_assignments_create():
    """Crea una nueva tarea."""
    return jsonify(create_assignment(get_json_payload())), 201


@university_bp.route("/assignments/<int:assignment_id>", methods=["PUT"])
@log_endpoint
def api_assignments_update(assignment_id: int):
    """Actualiza parcialmente una tarea."""
    return jsonify(update_assignment(assignment_id, get_json_payload()))


@university_bp.route("/assignments/<int:assignment_id>", methods=["DELETE"])
@log_endpoint
def api_assignments_delete(assignment_id: int):
    """Elimina una tarea."""
    return jsonify(delete_assignment(assignment_id))


@university_bp.route("/assignments/suggestions", methods=["GET"])
@log_endpoint
def api_assignments_suggestions():
    """Sugerencias locales de planificacion."""
    return jsonify({"suggestions": build_task_suggestions()})
