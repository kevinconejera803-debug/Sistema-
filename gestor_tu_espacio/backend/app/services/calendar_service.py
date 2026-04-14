"""Helpers de calendario y resumenes locales del asistente."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.models import Event

_DAYS_ES = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None

    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def get_day_name(date_str: str) -> str:
    """Convierte una fecha ISO a nombre de dia en espanol."""
    parsed = _parse_iso(date_str)
    if parsed is None:
        return ""
    return _DAYS_ES[parsed.weekday()]


def _serialize_filtered_events(*, start: datetime, end: datetime, limit: int | None = None) -> list[dict]:
    rows = Event.query.order_by(Event.start_iso).all()
    items: list[dict] = []

    for row in rows:
        event_dt = _parse_iso(row.start_iso)
        if event_dt is None:
            continue
        if event_dt < start or event_dt > end:
            continue

        items.append(row.to_dict())
        if limit is not None and len(items) >= limit:
            break

    return items


def get_upcoming_events(days: int = 7, limit: int = 20) -> list[dict]:
    """Obtiene eventos proximos ordenados cronologicamente."""
    now = datetime.now(timezone.utc)
    end = now + timedelta(days=days)
    return _serialize_filtered_events(start=now, end=end, limit=limit)


def get_today_events() -> list[dict]:
    """Obtiene eventos del dia actual."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    return _serialize_filtered_events(start=today_start, end=today_end)


def check_upcoming_24h() -> list[dict]:
    """Detecta eventos dentro de las proximas 24 horas."""
    now = datetime.now(timezone.utc)
    end = now + timedelta(hours=24)
    return _serialize_filtered_events(start=now, end=end)


def format_events_as_text(events: list[dict]) -> str:
    """Formatea eventos como texto legible."""
    if not events:
        return "No hay eventos proximos programados."

    lines: list[str] = []
    current_date = ""

    for event in events:
        start_iso = event.get("start_iso", "")
        event_date = start_iso[:10]

        if event_date != current_date:
            current_date = event_date
            day_name = get_day_name(start_iso or event_date)
            label = f"{day_name} ({event_date})" if day_name else event_date
            lines.append(label)

        title = event.get("title", "Sin titulo")
        time_label = start_iso[11:16] if len(start_iso) >= 16 else "--:--"
        lines.append(f"- {time_label}: {title}")

    return "\n".join(lines)


def format_urgent_notifications(events: list[dict]) -> str:
    """Formatea notificaciones de eventos cercanos."""
    if not events:
        return "No hay eventos urgentes."

    lines: list[str] = []
    now = datetime.now(timezone.utc)

    for event in events[:5]:
        parsed = _parse_iso(event.get("start_iso"))
        if parsed is None or parsed <= now:
            continue

        delta = parsed - now
        total_minutes = int(delta.total_seconds() // 60)
        title = event.get("title", "Sin titulo")

        if total_minutes < 60:
            lines.append(f"En {total_minutes} min: {title}")
            continue

        total_hours = int(delta.total_seconds() // 3600)
        if total_hours < 24:
            lines.append(f"En {total_hours} h: {title}")
            continue

        lines.append(f"{get_day_name(event.get('start_iso', ''))}: {title}")

    return "\n".join(lines) if lines else "No hay eventos urgentes."


def get_user_context() -> str:
    """Entrega un resumen corto del calendario del usuario."""
    return format_events_as_text(get_upcoming_events(days=7, limit=6))
