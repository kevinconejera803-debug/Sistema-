"""Helpers CRUD compartidos para los servicios del dominio."""

from __future__ import annotations

from typing import Any

from app.errors import ApiError
from app.extensions import db


def list_rows(query, *, limit: int, offset: int) -> list[dict[str, Any]]:
    """Serializa una consulta paginada usando ``to_dict``."""
    rows = query.limit(limit).offset(offset).all()
    return [row.to_dict() for row in rows]


def get_or_404(model_cls, entity_id: int, *, message: str = "no encontrado"):
    """Obtiene una entidad o levanta un 404 consistente."""
    entity = db.session.get(model_cls, entity_id)
    if entity is None:
        raise ApiError(message, status_code=404)
    return entity


def create_row(model_cls, payload: dict[str, Any]) -> dict[str, Any]:
    """Crea una entidad y la devuelve serializada."""
    entity = model_cls(**payload)
    db.session.add(entity)
    db.session.commit()
    return entity.to_dict()


def update_row(entity, payload: dict[str, Any]) -> dict[str, Any]:
    """Aplica cambios simples sobre una entidad existente."""
    for key, value in payload.items():
        setattr(entity, key, value)

    db.session.commit()
    return entity.to_dict()


def delete_row(entity) -> dict[str, bool]:
    """Elimina una entidad y entrega una respuesta consistente."""
    db.session.delete(entity)
    db.session.commit()
    return {"ok": True}
