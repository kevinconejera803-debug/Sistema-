"""Helpers CRUD compartidos para los servicios del dominio."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Generic, TypeVar

from app.errors import ApiError
from app.extensions import db

ModelType = TypeVar("ModelType")


@dataclass
class Result(Generic[ModelType]):
    """Result pattern for operations."""
    success: bool
    data: ModelType | None = None
    error: str | None = None

    @staticmethod
    def ok(data: ModelType) -> "Result[ModelType]":
        return Result(success=True, data=data)

    @staticmethod
    def fail(error: str) -> "Result[ModelType]":
        return Result(success=False, error=error)


def list_rows(query, *, limit: int, offset: int) -> list[dict[str, Any]]:
    """Serializa una consulta paginada usando ``to_dict``."""
    rows = query.limit(limit).offset(offset).all()
    return [row.to_dict() for row in rows]


def get_or_404(model_cls, entity_id: int, *, message: str = "no encontrado") -> Result:
    """Obtiene una entidad o levanta un 404 consistente."""
    entity = db.session.get(model_cls, entity_id)
    if entity is None:
        return Result.fail(message)
    return Result.ok(entity)


def create_row(model_cls, payload: dict[str, Any]) -> Result:
    """Crea una entidad y la devuelve serializada."""
    try:
        entity = model_cls(**payload)
        db.session.add(entity)
        db.session.commit()
        return Result.ok(entity.to_dict())
    except Exception as e:
        db.session.rollback()
        return Result.fail(str(e))


def update_row(entity, payload: dict[str, Any]) -> Result:
    """Aplica cambios simples sobre una entidad existente."""
    try:
        for key, value in payload.items():
            setattr(entity, key, value)
        db.session.commit()
        return Result.ok(entity.to_dict())
    except Exception as e:
        db.session.rollback()
        return Result.fail(str(e))


def delete_row(entity) -> Result:
    """Elimina una entidad y entrega una respuesta consistente."""
    try:
        db.session.delete(entity)
        db.session.commit()
        return Result.ok({"ok": True})
    except Exception as e:
        db.session.rollback()
        return Result.fail(str(e))