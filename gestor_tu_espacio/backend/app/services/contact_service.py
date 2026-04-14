"""Casos de uso para contactos."""

from __future__ import annotations

from app.errors import ApiError
from app.models import Contact
from app.services.crud_service import create_row, delete_row, get_or_404, list_rows, update_row
from app.validation import validate_contact_data, validate_partial_contact_data


def list_contacts(*, limit: int = 50, offset: int = 0) -> list[dict]:
    query = Contact.query.order_by(Contact.name.collate("NOCASE"))
    return list_rows(query, limit=limit, offset=offset)


def create_contact(payload: dict) -> dict:
    valid, cleaned, error = validate_contact_data(payload)
    if not valid:
        raise ApiError(error or "payload invalido", status_code=400)

    return create_row(Contact, cleaned)


def update_contact(contact_id: int, payload: dict) -> dict:
    contact = get_or_404(Contact, contact_id)

    valid, cleaned, error = validate_partial_contact_data(payload)
    if not valid:
        raise ApiError(error or "payload invalido", status_code=400)
    if not cleaned:
        raise ApiError("sin cambios", status_code=400)

    return update_row(contact, cleaned)


def delete_contact(contact_id: int) -> dict:
    return delete_row(get_or_404(Contact, contact_id))
