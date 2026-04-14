"""Casos de uso para eventos del calendario."""

from __future__ import annotations

from app.errors import ApiError
from app.models import Event
from app.services.crud_service import create_row, delete_row, get_or_404, list_rows, update_row
from app.validation import validate_event_data, validate_iso_date, validate_partial_event_data
from app.validation.common import validate_iso_range


def list_events(*, from_iso: str = "", to_iso: str = "", limit: int = 50, offset: int = 0) -> list[dict]:
    query = Event.query

    if from_iso or to_iso:
        if not (validate_iso_date(from_iso) and validate_iso_date(to_iso)):
            raise ApiError("from y to deben ser fechas ISO validas", status_code=400)
        query = query.filter(Event.start_iso >= from_iso, Event.start_iso <= to_iso)

    return list_rows(query.order_by(Event.start_iso), limit=limit, offset=offset)


def create_event(payload: dict) -> dict:
    valid, cleaned, error = validate_event_data(payload)
    if not valid:
        raise ApiError(error or "payload invalido", status_code=400)

    return create_row(Event, cleaned)


def update_event(event_id: int, payload: dict) -> dict:
    event = get_or_404(Event, event_id)

    valid, cleaned, error = validate_partial_event_data(payload)
    if not valid:
        raise ApiError(error or "payload invalido", status_code=400)
    if not cleaned:
        raise ApiError("sin cambios", status_code=400)

    candidate_start = cleaned.get("start_iso", event.start_iso)
    candidate_end = cleaned.get("end_iso", event.end_iso)
    if candidate_start and candidate_end:
        range_valid, range_error = validate_iso_range(candidate_start, candidate_end, "start_iso", "end_iso")
        if not range_valid:
            raise ApiError(range_error or "rango invalido", status_code=400)

    return update_row(event, cleaned)


def delete_event(event_id: int) -> dict:
    return delete_row(get_or_404(Event, event_id))
