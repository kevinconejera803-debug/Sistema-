"""Validaciones atomicas reutilizables."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from app.config import MAX_STRING_LENGTH, VALID_EVENT_COLORS

HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_iso_date(value: str | None) -> bool:
    """Valida una cadena ISO 8601 compatible con datetime/date."""
    if not isinstance(value, str) or not value.strip():
        return False

    try:
        datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
        return True
    except (TypeError, ValueError):
        return False


def validate_string(value: Any, max_len: int = MAX_STRING_LENGTH, allow_empty: bool = False) -> tuple[bool, str]:
    """Valida y normaliza cadenas simples."""
    if not isinstance(value, str):
        return False, "debe ser texto"

    cleaned = value.strip()
    if not allow_empty and not cleaned:
        return False, "no puede estar vacio"

    if len(cleaned) > max_len:
        return False, f"maximo {max_len} caracteres"

    return True, cleaned


def validate_optional_string(
    value: Any,
    field_name: str,
    max_len: int,
) -> tuple[bool, str | None, str | None]:
    """Valida un texto opcional y mantiene un mensaje amigable."""
    valid, cleaned_or_error = validate_string(value or "", max_len=max_len, allow_empty=True)
    if not valid:
        return False, None, f"{field_name} {cleaned_or_error}"
    return True, cleaned_or_error, None


def validate_email(value: str) -> bool:
    """Valida email simple si viene informado."""
    if not value:
        return True
    return bool(EMAIL_RE.match(value))


def validate_color(value: str) -> bool:
    """Acepta colores nombrados del sistema o hexadecimales."""
    normalized = (value or "").strip().lower()
    return normalized in VALID_EVENT_COLORS or bool(HEX_COLOR_RE.match(normalized))


def validate_iso_range(
    start_iso: str,
    end_iso: str,
    start_field: str,
    end_field: str,
) -> tuple[bool, str | None]:
    """Valida el orden cronologico de un rango ISO."""
    try:
        start_dt = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(end_iso.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return False, f"{start_field} y {end_field} deben ser fechas ISO validas"

    if end_dt < start_dt:
        return False, f"{end_field} no puede ser anterior a {start_field}"

    return True, None
