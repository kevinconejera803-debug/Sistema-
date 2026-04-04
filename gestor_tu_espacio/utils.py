"""
Utilidades para validación, BD y APIs resilientes.
"""
from datetime import datetime
from functools import wraps
import time
from typing import Any, Callable, Optional, Tuple

from config import (
    logger, MAX_STRING_LENGTH, MAX_NOTES_LENGTH, VALID_EVENT_COLORS,
    VALID_ASSIGNMENT_STATUS, MAX_WEIGHT, MIN_WEIGHT, API_TIMEOUT, MAX_RETRIES
)


def validate_iso_date(value: str) -> bool:
    """Valida que una cadena sea fecha ISO 8601 válida."""
    if not isinstance(value, str):
        return False
    try:
        datetime.fromisoformat(value.replace('Z', '+00:00'))
        return True
    except (ValueError, TypeError):
        return False


def validate_string(value: Any, max_len: int, allow_empty: bool = False) -> Tuple[bool, Optional[str]]:
    """Valida string: tipo, longitud, no nulo."""
    if not isinstance(value, str):
        return False, "debe ser texto"
    
    value = value.strip()
    if not allow_empty and not value:
        return False, "no puede estar vacío"
    
    if len(value) > max_len:
        return False, f"máximo {max_len} caracteres"
    
    return True, value


def validate_event_data(data: dict) -> Tuple[bool, Optional[dict], Optional[str]]:
    """Valida datos de evento. Retorna (válido, datos_limpios, error)."""
    title_valid, title_clean = validate_string(data.get("title", ""), MAX_STRING_LENGTH, allow_empty=False)
    if not title_valid:
        return False, None, f"title {title_clean}"
    
    start_iso = (data.get("start_iso") or "").strip()
    if not validate_iso_date(start_iso):
        return False, None, "start_iso debe ser fecha ISO válida (ej: 2026-04-01T14:30:00)"
    
    end_iso = (data.get("end_iso") or "").strip()
    if end_iso and not validate_iso_date(end_iso):
        return False, None, "end_iso debe ser fecha ISO válida"
    
    color = (data.get("color") or "teal").strip().lower()
    if color not in VALID_EVENT_COLORS:
        return False, None, f"color debe ser: {', '.join(VALID_EVENT_COLORS)}"
    
    _, notes_clean = validate_string(data.get("notes", ""), MAX_NOTES_LENGTH, allow_empty=True)
    
    return True, {
        "title": title_clean,
        "start_iso": start_iso,
        "end_iso": end_iso or None,
        "all_day": 1 if data.get("all_day", True) else 0,
        "color": color,
        "notes": notes_clean,
    }, None


def validate_contact_data(data: dict) -> Tuple[bool, Optional[dict], Optional[str]]:
    """Valida datos de contacto."""
    name_valid, name_clean = validate_string(data.get("name", ""), MAX_STRING_LENGTH, allow_empty=False)
    if not name_valid:
        return False, None, f"name {name_clean}"
    
    _, email_clean = validate_string(data.get("email", ""), MAX_STRING_LENGTH, allow_empty=True)
    _, phone_clean = validate_string(data.get("phone", ""), MAX_STRING_LENGTH, allow_empty=True)
    _, company_clean = validate_string(data.get("company", ""), MAX_STRING_LENGTH, allow_empty=True)
    _, notes_clean = validate_string(data.get("notes", ""), MAX_NOTES_LENGTH, allow_empty=True)
    
    return True, {
        "name": name_clean,
        "email": email_clean,
        "phone": phone_clean,
        "company": company_clean,
        "notes": notes_clean,
    }, None


def validate_assignment_data(data: dict) -> Tuple[bool, Optional[dict], Optional[str]]:
    """Valida datos de tarea/entrega."""
    course_valid, course_clean = validate_string(data.get("course", ""), MAX_STRING_LENGTH, allow_empty=False)
    if not course_valid:
        return False, None, f"course {course_clean}"
    
    title_valid, title_clean = validate_string(data.get("title", ""), MAX_STRING_LENGTH, allow_empty=False)
    if not title_valid:
        return False, None, f"title {title_clean}"
    
    due_iso = (data.get("due_iso") or "").strip()
    if not validate_iso_date(due_iso):
        return False, None, "due_iso debe ser fecha ISO válida"
    
    status = (data.get("status") or "pendiente").strip().lower()
    if status not in VALID_ASSIGNMENT_STATUS:
        return False, None, f"status debe ser: {', '.join(VALID_ASSIGNMENT_STATUS)}"
    
    try:
        weight = int(data.get("weight", 0))
        if weight < MIN_WEIGHT or weight > MAX_WEIGHT:
            return False, None, f"weight debe estar entre {MIN_WEIGHT} y {MAX_WEIGHT}"
    except (ValueError, TypeError):
        return False, None, "weight debe ser número"
    
    _, notes_clean = validate_string(data.get("notes", ""), MAX_NOTES_LENGTH, allow_empty=True)
    
    return True, {
        "course": course_clean,
        "title": title_clean,
        "due_iso": due_iso,
        "status": status,
        "weight": weight,
        "notes": notes_clean,
    }, None


def build_safe_update(table: str, data_dict: dict, id_value: Any, valid_fields: set) -> Tuple[Optional[str], Optional[list]]:
    """
    Construye SQL UPDATE seguro. Retorna (SQL, valores) o (None, None) si sin cambios.
    Ejemplo:
        sql, vals = build_safe_update("events", {"title": "Nuevo"}, 5, {"title", "notes"})
        conn.execute(sql, vals) if sql else None
    """
    fields = [f for f in data_dict if f in valid_fields and f in data_dict]
    if not fields:
        return None, None
    
    vals = [data_dict[f] for f in fields]
    vals.append(id_value)
    
    placeholders = ", ".join(f"{f} = ?" for f in fields)
    sql = f"UPDATE {table} SET {placeholders} WHERE id = ?"
    
    logger.debug(f"UPDATE {table}: campos={fields}")
    return sql, vals


def retry_with_backoff(
    func: Callable, 
    max_attempts: int = MAX_RETRIES,
    backoff_factor: float = 2.0,
    timeout: int = API_TIMEOUT
) -> Any:
    """
    Ejecuta función con reintentos exponenciales.
    Útil para APIs externas que pueden fallar temporalmente.
    """
    last_error = None
    
    for attempt in range(1, max_attempts + 1):
        try:
            return func(timeout=timeout)
        except Exception as e:
            last_error = e
            if attempt < max_attempts:
                wait_time = (backoff_factor ** (attempt - 1))
                logger.warning(
                    f"Intento {attempt}/{max_attempts} falló: {e}. "
                    f"Reintentando en {wait_time}s..."
                )
                time.sleep(wait_time)
            else:
                logger.error(f"Falló después de {max_attempts} intentos: {e}")
    
    logger.error(f"Agotados reintentos para {func.__name__}")
    raise last_error or Exception("Falló después de múltiples intentos")


def log_endpoint(func: Callable) -> Callable:
    """Decorador para loguear acceso a endpoints."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.info(f"Acceso a {func.__name__}")
        try:
            result = func(*args, **kwargs)
            logger.debug(f"{func.__name__} exitoso")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} error: {e}", exc_info=True)
            raise
    return wrapper
