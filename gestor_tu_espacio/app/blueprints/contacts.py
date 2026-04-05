"""
Blueprint contactos: CRUD de contactos.
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.config import logger
from app.database import db, Contact
from app.utils import (
    validate_contact_data, validate_partial_contact_data,
    log_endpoint,
)

contacts_bp = Blueprint("contacts", __name__, url_prefix="/api/contacts")


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


@contacts_bp.route("", methods=["GET"])
@log_endpoint
def api_contacts_list():
    """GET: Obtiene todos los contactos (con paginación)."""
    limit, offset = _parse_pagination()
    query = Contact.query.order_by(Contact.name.collate("NOCASE")).limit(limit).offset(offset)
    return jsonify([c.to_dict() for c in query.all()])


@contacts_bp.route("", methods=["POST"])
@log_endpoint
def api_contacts_create():
    """POST: Crea nuevo contacto con validación."""
    data = request.get_json(force=True, silent=True) or {}
    valid, cleaned, error = validate_contact_data(data)
    if not valid:
        logger.warning(f"Contacto inválido: {error}")
        return jsonify({"error": error}), 400

    contact = Contact(
        name=cleaned["name"],
        email=cleaned["email"],
        phone=cleaned["phone"],
        company=cleaned["company"],
        notes=cleaned["notes"],
    )
    db.session.add(contact)
    db.session.commit()
    logger.info(f"Contacto creado: {contact.id}")
    return jsonify(contact.to_dict()), 201


@contacts_bp.route("/<int:cid>", methods=["PUT"])
@log_endpoint
def api_contacts_update(cid):
    """PUT: Actualiza contacto con validación."""
    data = request.get_json(force=True, silent=True) or {}
    valid, cleaned, error = validate_partial_contact_data(data)
    if not valid:
        logger.warning(f"Update contacto inválido: {error}")
        return jsonify({"error": error}), 400

    contact = db.session.get(Contact, cid)
    if not contact:
        return jsonify({"error": "no encontrado"}), 404

    valid_fields = {"name", "email", "phone", "company", "notes"}
    applied = False
    for field in valid_fields:
        if field in cleaned:
            setattr(contact, field, cleaned[field])
            applied = True

    if not applied:
        return jsonify({"error": "sin cambios"}), 400

    db.session.commit()
    logger.info(f"Contacto {cid} actualizado")
    return jsonify(contact.to_dict())


@contacts_bp.route("/<int:cid>", methods=["DELETE"])
@log_endpoint
def api_contacts_delete(cid):
    """DELETE: Elimina contacto."""
    contact = db.session.get(Contact, cid)
    if not contact:
        return jsonify({"error": "no encontrado"}), 404

    db.session.delete(contact)
    db.session.commit()
    logger.info(f"Contacto {cid} eliminado")
    return jsonify({"ok": True})
