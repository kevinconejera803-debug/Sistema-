"""
Utilidades para validación, BD y APIs resilientes.
"""
from datetime import datetime
from functools import wraps
import time
from typing import Any, Callable, Optional, Tuple

from app.config import (
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


def _validate_optional_string(value: Any, field_name: str, max_len: int) -> Tuple[bool, Optional[str], Optional[str]]:
    """Valida un campo de texto opcional y preserva el mensaje de error correcto."""
    is_valid, cleaned_or_error = validate_string(value, max_len, allow_empty=True)
    if not is_valid:
        return False, None, f"{field_name} {cleaned_or_error}"
    return True, cleaned_or_error, None


def _validate_iso_range(start_iso: str, end_iso: str, start_field: str, end_field: str) -> Tuple[bool, Optional[str]]:
    """Comprueba que el rango ISO tenga orden cronológico válido."""
    try:
        start_dt = datetime.fromisoformat(start_iso.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_iso.replace('Z', '+00:00'))
        if end_dt < start_dt:
            return False, f"{end_field} no puede ser anterior a {start_field}"
    except (ValueError, TypeError):
        return False, f"{start_field} y {end_field} deben ser fechas ISO válidas"

    return True, None


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
    if end_iso:
        range_valid, range_error = _validate_iso_range(start_iso, end_iso, "start_iso", "end_iso")
        if not range_valid:
            return False, None, range_error
    
    color = (data.get("color") or "teal").strip().lower()
    if color not in VALID_EVENT_COLORS:
        return False, None, f"color debe ser: {', '.join(VALID_EVENT_COLORS)}"
    
    notes_valid, notes_clean, notes_error = _validate_optional_string(
        data.get("notes", ""), "notes", MAX_NOTES_LENGTH
    )
    if not notes_valid:
        return False, None, notes_error
    
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
    
    email_valid, email_clean, email_error = _validate_optional_string(
        data.get("email", ""), "email", MAX_STRING_LENGTH
    )
    if not email_valid:
        return False, None, email_error

    phone_valid, phone_clean, phone_error = _validate_optional_string(
        data.get("phone", ""), "phone", MAX_STRING_LENGTH
    )
    if not phone_valid:
        return False, None, phone_error

    company_valid, company_clean, company_error = _validate_optional_string(
        data.get("company", ""), "company", MAX_STRING_LENGTH
    )
    if not company_valid:
        return False, None, company_error

    notes_valid, notes_clean, notes_error = _validate_optional_string(
        data.get("notes", ""), "notes", MAX_NOTES_LENGTH
    )
    if not notes_valid:
        return False, None, notes_error
    
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
    
    notes_valid, notes_clean, notes_error = _validate_optional_string(
        data.get("notes", ""), "notes", MAX_NOTES_LENGTH
    )
    if not notes_valid:
        return False, None, notes_error
    
    return True, {
        "course": course_clean,
        "title": title_clean,
        "due_iso": due_iso,
        "status": status,
        "weight": weight,
        "notes": notes_clean,
    }, None


def validate_partial_event_data(data: dict) -> Tuple[bool, Optional[dict], Optional[str]]:
    """Valida actualización parcial de evento."""
    cleaned: dict = {}

    if "title" in data:
        title_valid, title_clean = validate_string(data.get("title", ""), MAX_STRING_LENGTH, allow_empty=False)
        if not title_valid:
            return False, None, f"title {title_clean}"
        cleaned["title"] = title_clean

    if "start_iso" in data:
        start_iso = (data.get("start_iso") or "").strip()
        if not validate_iso_date(start_iso):
            return False, None, "start_iso debe ser fecha ISO válida (ej: 2026-04-01T14:30:00)"
        cleaned["start_iso"] = start_iso

    if "end_iso" in data:
        end_iso = (data.get("end_iso") or "").strip()
        if end_iso and not validate_iso_date(end_iso):
            return False, None, "end_iso debe ser fecha ISO válida"
        cleaned["end_iso"] = end_iso or None

    if "start_iso" in cleaned and cleaned.get("end_iso"):
        range_valid, range_error = _validate_iso_range(
            cleaned["start_iso"], cleaned["end_iso"], "start_iso", "end_iso"
        )
        if not range_valid:
            return False, None, range_error

    if "color" in data:
        color = (data.get("color") or "").strip().lower()
        if color not in VALID_EVENT_COLORS:
            return False, None, f"color debe ser: {', '.join(VALID_EVENT_COLORS)}"
        cleaned["color"] = color

    if "all_day" in data:
        cleaned["all_day"] = 1 if data.get("all_day") else 0

    if "notes" in data:
        notes_valid, notes_clean, notes_error = _validate_optional_string(
            data.get("notes", ""), "notes", MAX_NOTES_LENGTH
        )
        if not notes_valid:
            return False, None, notes_error
        cleaned["notes"] = notes_clean

    return True, cleaned, None


def validate_partial_contact_data(data: dict) -> Tuple[bool, Optional[dict], Optional[str]]:
    """Valida actualización parcial de contacto."""
    cleaned: dict = {}

    if "name" in data:
        name_valid, name_clean = validate_string(data.get("name", ""), MAX_STRING_LENGTH, allow_empty=False)
        if not name_valid:
            return False, None, f"name {name_clean}"
        cleaned["name"] = name_clean

    for field in ("email", "phone", "company"):
        if field in data:
            field_valid, field_clean, field_error = _validate_optional_string(
                data.get(field, ""), field, MAX_STRING_LENGTH
            )
            if not field_valid:
                return False, None, field_error
            cleaned[field] = field_clean

    if "notes" in data:
        notes_valid, notes_clean, notes_error = _validate_optional_string(
            data.get("notes", ""), "notes", MAX_NOTES_LENGTH
        )
        if not notes_valid:
            return False, None, notes_error
        cleaned["notes"] = notes_clean

    return True, cleaned, None


def validate_partial_assignment_data(data: dict) -> Tuple[bool, Optional[dict], Optional[str]]:
    """Valida actualización parcial de tarea/entrega."""
    cleaned: dict = {}

    for field in ("course", "title"):
        if field in data:
            field_valid, field_clean = validate_string(data.get(field, ""), MAX_STRING_LENGTH, allow_empty=False)
            if not field_valid:
                return False, None, f"{field} {field_clean}"
            cleaned[field] = field_clean

    if "due_iso" in data:
        due_iso = (data.get("due_iso") or "").strip()
        if not validate_iso_date(due_iso):
            return False, None, "due_iso debe ser fecha ISO válida"
        cleaned["due_iso"] = due_iso

    if "status" in data:
        status = (data.get("status") or "").strip().lower()
        if status not in VALID_ASSIGNMENT_STATUS:
            return False, None, f"status debe ser: {', '.join(VALID_ASSIGNMENT_STATUS)}"
        cleaned["status"] = status

    if "weight" in data:
        try:
            weight = int(data.get("weight", 0))
            if weight < MIN_WEIGHT or weight > MAX_WEIGHT:
                return False, None, f"weight debe estar entre {MIN_WEIGHT} y {MAX_WEIGHT}"
        except (ValueError, TypeError):
            return False, None, "weight debe ser número"
        cleaned["weight"] = weight

    if "notes" in data:
        notes_valid, notes_clean, notes_error = _validate_optional_string(
            data.get("notes", ""), "notes", MAX_NOTES_LENGTH
        )
        if not notes_valid:
            return False, None, notes_error
        cleaned["notes"] = notes_clean

    return True, cleaned, None




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
