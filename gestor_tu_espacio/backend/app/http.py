"""Helpers HTTP para las rutas."""

from __future__ import annotations

from flask import request

from app.config import DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT
from app.errors import ApiError


def parse_pagination_args(args=None) -> tuple[int, int]:
    """Normaliza paginacion como (limit, offset)."""
    source = args or request.args
    try:
        page = max(1, int(source.get("page", 1)))
        limit = min(MAX_PAGE_LIMIT, max(1, int(source.get("limit", DEFAULT_PAGE_LIMIT))))
    except (TypeError, ValueError):
        page = 1
        limit = DEFAULT_PAGE_LIMIT
    return limit, (page - 1) * limit


def get_json_payload() -> dict:
    """Lee el cuerpo JSON y exige que sea un objeto."""
    payload = request.get_json(force=True, silent=True) or {}
    if not isinstance(payload, dict):
        raise ApiError("el cuerpo JSON debe ser un objeto", status_code=400)
    return payload
