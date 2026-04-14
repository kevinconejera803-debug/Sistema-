"""Casos de uso para tareas universitarias."""

from __future__ import annotations

from app.errors import ApiError
from app.models import Assignment
from app.services.crud_service import create_row, delete_row, get_or_404, list_rows, update_row
from app.validation import validate_assignment_data, validate_partial_assignment_data


def _normalize_payload(payload: dict) -> dict:
    normalized = dict(payload)
    if "completed" in normalized and "status" not in normalized:
        normalized["status"] = "completado" if normalized["completed"] else "pendiente"
    return normalized


def list_assignments(*, limit: int = 50, offset: int = 0) -> list[dict]:
    query = Assignment.query.order_by(Assignment.due_iso)
    return list_rows(query, limit=limit, offset=offset)


def create_assignment(payload: dict) -> dict:
    valid, cleaned, error = validate_assignment_data(_normalize_payload(payload))
    if not valid:
        raise ApiError(error or "payload invalido", status_code=400)

    return create_row(Assignment, cleaned)


def update_assignment(assignment_id: int, payload: dict) -> dict:
    assignment = get_or_404(Assignment, assignment_id)

    valid, cleaned, error = validate_partial_assignment_data(_normalize_payload(payload))
    if not valid:
        raise ApiError(error or "payload invalido", status_code=400)
    if not cleaned:
        raise ApiError("sin cambios", status_code=400)

    return update_row(assignment, cleaned)


def delete_assignment(assignment_id: int) -> dict:
    return delete_row(get_or_404(Assignment, assignment_id, message="no encontrada"))
