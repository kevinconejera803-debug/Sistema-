"""Validadores de payloads HTTP."""

from __future__ import annotations

from app.config import (
    MAX_NOTES_LENGTH,
    MAX_STRING_LENGTH,
    MAX_WEIGHT,
    MIN_WEIGHT,
    VALID_ASSIGNMENT_STATUS,
)
from app.validation.common import (
    validate_color,
    validate_email,
    validate_iso_date,
    validate_iso_range,
    validate_optional_string,
    validate_string,
)


def _normalize_assignment_status(raw_status: str) -> str:
    normalized = (raw_status or "pendiente").strip().lower()
    if normalized == "completada":
        return "completado"
    return normalized


def validate_event_data(data: dict) -> tuple[bool, dict | None, str | None]:
    title_valid, title_clean = validate_string(data.get("title", ""), MAX_STRING_LENGTH, allow_empty=False)
    if not title_valid:
        return False, None, f"title {title_clean}"

    start_iso = (data.get("start_iso") or "").strip()
    if not validate_iso_date(start_iso):
        return False, None, "start_iso debe ser fecha ISO valida (ej: 2026-04-01T14:30:00)"

    end_iso = (data.get("end_iso") or "").strip()
    if end_iso and not validate_iso_date(end_iso):
        return False, None, "end_iso debe ser fecha ISO valida"
    if end_iso:
        range_valid, range_error = validate_iso_range(start_iso, end_iso, "start_iso", "end_iso")
        if not range_valid:
            return False, None, range_error

    color = (data.get("color") or "teal").strip().lower()
    if not validate_color(color):
        return False, None, "color debe ser un nombre valido o hexadecimal (#RRGGBB)"

    notes_valid, notes_clean, notes_error = validate_optional_string(
        data.get("notes", ""),
        "notes",
        MAX_NOTES_LENGTH,
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


def validate_contact_data(data: dict) -> tuple[bool, dict | None, str | None]:
    name_valid, name_clean = validate_string(data.get("name", ""), MAX_STRING_LENGTH, allow_empty=False)
    if not name_valid:
        return False, None, f"name {name_clean}"

    email_valid, email_clean, email_error = validate_optional_string(
        data.get("email", ""),
        "email",
        MAX_STRING_LENGTH,
    )
    if not email_valid:
        return False, None, email_error
    if not validate_email(email_clean or ""):
        return False, None, "email debe tener un formato valido"

    phone_valid, phone_clean, phone_error = validate_optional_string(
        data.get("phone", ""),
        "phone",
        MAX_STRING_LENGTH,
    )
    if not phone_valid:
        return False, None, phone_error

    company_valid, company_clean, company_error = validate_optional_string(
        data.get("company", ""),
        "company",
        MAX_STRING_LENGTH,
    )
    if not company_valid:
        return False, None, company_error

    notes_valid, notes_clean, notes_error = validate_optional_string(
        data.get("notes", ""),
        "notes",
        MAX_NOTES_LENGTH,
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


def validate_assignment_data(data: dict) -> tuple[bool, dict | None, str | None]:
    course_valid, course_clean = validate_string(data.get("course", ""), MAX_STRING_LENGTH, allow_empty=False)
    if not course_valid:
        return False, None, f"course {course_clean}"

    title_valid, title_clean = validate_string(data.get("title", ""), MAX_STRING_LENGTH, allow_empty=False)
    if not title_valid:
        return False, None, f"title {title_clean}"

    due_iso = (data.get("due_iso") or "").strip()
    if not validate_iso_date(due_iso):
        return False, None, "due_iso debe ser fecha ISO valida"

    status = _normalize_assignment_status(data.get("status", "pendiente"))
    if status not in VALID_ASSIGNMENT_STATUS:
        return False, None, f"status debe ser: {', '.join(sorted(VALID_ASSIGNMENT_STATUS))}"

    try:
        weight = int(data.get("weight", 0))
    except (TypeError, ValueError):
        return False, None, "weight debe ser numero"

    if weight < MIN_WEIGHT or weight > MAX_WEIGHT:
        return False, None, f"weight debe estar entre {MIN_WEIGHT} y {MAX_WEIGHT}"

    notes_valid, notes_clean, notes_error = validate_optional_string(
        data.get("notes", ""),
        "notes",
        MAX_NOTES_LENGTH,
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


def validate_partial_event_data(data: dict) -> tuple[bool, dict | None, str | None]:
    cleaned: dict = {}

    if "title" in data:
        valid, cleaned_title = validate_string(data.get("title", ""), MAX_STRING_LENGTH, allow_empty=False)
        if not valid:
            return False, None, f"title {cleaned_title}"
        cleaned["title"] = cleaned_title

    if "start_iso" in data:
        start_iso = (data.get("start_iso") or "").strip()
        if not validate_iso_date(start_iso):
            return False, None, "start_iso debe ser fecha ISO valida (ej: 2026-04-01T14:30:00)"
        cleaned["start_iso"] = start_iso

    if "end_iso" in data:
        end_iso = (data.get("end_iso") or "").strip()
        if end_iso and not validate_iso_date(end_iso):
            return False, None, "end_iso debe ser fecha ISO valida"
        cleaned["end_iso"] = end_iso or None

    start_iso = cleaned.get("start_iso")
    end_iso = cleaned.get("end_iso")
    if start_iso and end_iso:
        range_valid, range_error = validate_iso_range(start_iso, end_iso, "start_iso", "end_iso")
        if not range_valid:
            return False, None, range_error

    if "color" in data:
        color = (data.get("color") or "").strip().lower()
        if not validate_color(color):
            return False, None, "color debe ser un nombre valido o hexadecimal (#RRGGBB)"
        cleaned["color"] = color

    if "all_day" in data:
        cleaned["all_day"] = 1 if data.get("all_day") else 0

    if "notes" in data:
        notes_valid, notes_clean, notes_error = validate_optional_string(
            data.get("notes", ""),
            "notes",
            MAX_NOTES_LENGTH,
        )
        if not notes_valid:
            return False, None, notes_error
        cleaned["notes"] = notes_clean

    return True, cleaned, None


def validate_partial_contact_data(data: dict) -> tuple[bool, dict | None, str | None]:
    cleaned: dict = {}

    if "name" in data:
        name_valid, name_clean = validate_string(data.get("name", ""), MAX_STRING_LENGTH, allow_empty=False)
        if not name_valid:
            return False, None, f"name {name_clean}"
        cleaned["name"] = name_clean

    for field in ("email", "phone", "company"):
        if field in data:
            field_valid, field_clean, field_error = validate_optional_string(
                data.get(field, ""),
                field,
                MAX_STRING_LENGTH,
            )
            if not field_valid:
                return False, None, field_error
            if field == "email" and not validate_email(field_clean or ""):
                return False, None, "email debe tener un formato valido"
            cleaned[field] = field_clean

    if "notes" in data:
        notes_valid, notes_clean, notes_error = validate_optional_string(
            data.get("notes", ""),
            "notes",
            MAX_NOTES_LENGTH,
        )
        if not notes_valid:
            return False, None, notes_error
        cleaned["notes"] = notes_clean

    return True, cleaned, None


def validate_partial_assignment_data(data: dict) -> tuple[bool, dict | None, str | None]:
    cleaned: dict = {}

    for field in ("course", "title"):
        if field in data:
            valid, cleaned_value = validate_string(data.get(field, ""), MAX_STRING_LENGTH, allow_empty=False)
            if not valid:
                return False, None, f"{field} {cleaned_value}"
            cleaned[field] = cleaned_value

    if "due_iso" in data:
        due_iso = (data.get("due_iso") or "").strip()
        if not validate_iso_date(due_iso):
            return False, None, "due_iso debe ser fecha ISO valida"
        cleaned["due_iso"] = due_iso

    if "status" in data:
        status = _normalize_assignment_status(data.get("status", "pendiente"))
        if status not in VALID_ASSIGNMENT_STATUS:
            return False, None, f"status debe ser: {', '.join(sorted(VALID_ASSIGNMENT_STATUS))}"
        cleaned["status"] = status

    if "weight" in data:
        try:
            weight = int(data.get("weight", 0))
        except (TypeError, ValueError):
            return False, None, "weight debe ser numero"

        if weight < MIN_WEIGHT or weight > MAX_WEIGHT:
            return False, None, f"weight debe estar entre {MIN_WEIGHT} y {MAX_WEIGHT}"
        cleaned["weight"] = weight

    if "notes" in data:
        notes_valid, notes_clean, notes_error = validate_optional_string(
            data.get("notes", ""),
            "notes",
            MAX_NOTES_LENGTH,
        )
        if not notes_valid:
            return False, None, notes_error
        cleaned["notes"] = notes_clean

    return True, cleaned, None
