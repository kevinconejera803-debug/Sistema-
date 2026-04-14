"""Rutas HTTP del modulo de contactos."""

from __future__ import annotations

from flask import Blueprint, jsonify

from app.http import get_json_payload, parse_pagination_args
from app.services.contact_service import create_contact, delete_contact, list_contacts, update_contact
from app.utils import log_endpoint

contacts_bp = Blueprint("contacts", __name__, url_prefix="/api/contacts")


@contacts_bp.route("", methods=["GET"])
@log_endpoint
def api_contacts_list():
    """Obtiene contactos con paginacion."""
    limit, offset = parse_pagination_args()
    return jsonify(list_contacts(limit=limit, offset=offset))


@contacts_bp.route("", methods=["POST"])
@log_endpoint
def api_contacts_create():
    """Crea un contacto."""
    return jsonify(create_contact(get_json_payload())), 201


@contacts_bp.route("/<int:contact_id>", methods=["PUT"])
@log_endpoint
def api_contacts_update(contact_id: int):
    """Actualiza parcialmente un contacto."""
    return jsonify(update_contact(contact_id, get_json_payload()))


@contacts_bp.route("/<int:contact_id>", methods=["DELETE"])
@log_endpoint
def api_contacts_delete(contact_id: int):
    """Elimina un contacto."""
    return jsonify(delete_contact(contact_id))
