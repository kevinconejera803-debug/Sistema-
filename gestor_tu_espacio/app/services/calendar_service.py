"""
Servicio de calendario con contexto para IA.
"""
from datetime import datetime, timedelta, timezone
from app.database import db, Event
from app.config import logger


def get_upcoming_events(days: int = 7, limit: int = 20) -> list[dict]:
    """Obtiene eventos próximos."""
    now = datetime.now(timezone.utc)
    end = now + timedelta(days=days)
    
    events = (
        Event.query
        .filter(Event.start_iso >= now.isoformat())
        .filter(Event.start_iso <= end.isoformat())
        .order_by(Event.start_iso)
        .limit(limit)
        .all()
    )
    return [e.to_dict() for e in events]


def format_events_as_text(events: list[dict]) -> str:
    """Formatea eventos como texto legible."""
    if not events:
        return "No hay eventos próximos programados."
    
    lines = []
    current_date = ""
    
    for event in events:
        start = event.get("start_iso", "")[:10]
        if start != current_date:
            current_date = start
            day_name = get_day_name(start)
            lines.append(f"\n{day_name} ({start}):")
        
        title = event.get("title", "Sin título")
        time = event.get("start_iso", "")[11:16]
        lines.append(f"  - {time}: {title}")
    
    return "\n".join(lines)


def get_day_name(date_str: str) -> str:
    """Convierte fecha a nombre del día."""
    try:
        dt = datetime.fromisoformat(date_str)
        days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        return days[dt.weekday()]
    except:
        return ""


def get_today_events() -> list[dict]:
    """Obtiene eventos de hoy."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    events = (
        Event.query
        .filter(Event.start_iso >= today_start.isoformat())
        .filter(Event.start_iso < today_end.isoformat())
        .order_by(Event.start_iso)
        .all()
    )
    return [e.to_dict() for e in events]


def check_upcoming_24h() -> list[dict]:
    """Detecta eventos en próximas 24 horas."""
    now = datetime.now(timezone.utc)
    end = now + timedelta(hours=24)
    
    events = (
        Event.query
        .filter(Event.start_iso >= now.isoformat())
        .filter(Event.start_iso <= end.isoformat())
        .order_by(Event.start_iso)
        .all()
    )
    return [e.to_dict() for e in events]


def format_urgent_notifications(events: list[dict]) -> str:
    """Formatea notificaciones para eventos próximos."""
    if not events:
        return ""
    
    lines = []
    for event in events[:5]:
        start = event.get("start_iso", "")
        title = event.get("title", "Sin título")
        
        try:
            dt = datetime.fromisoformat(start)
            now = datetime.now(timezone.utc)
            
            if dt <= now:
                continue
            
            diff = dt - now
            hours = int(diff.total_seconds() / 3600)
            
            if hours < 1:
                minutes = int(diff.total_seconds() / 60)
                lines.append(f"⚠️ En {minutes}min: {title}")
            elif hours < 24:
                lines.append(f"⏰ En {hours}h: {title}")
            else:
                day_name = get_day_name(start[:10])
                lines.append(f"📅 {day_name}: {title}")
        except:
            pass
    
    return "\n".join(lines) if lines else "No hay eventos urgentes."


def get_user_context() -> str:
    """Genera contexto completo del usuario para IA."""
    events = get_upcoming_events(days=7)
    events_text = format_events_as_text(events)
    
    return f"""=== CONTEXTO DEL USUARIO ===
{events_text}

=== FIN DEL CONTEXTO ==="""