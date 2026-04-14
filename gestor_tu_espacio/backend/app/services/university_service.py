"""Helpers universitarios y sugerencias locales."""

from __future__ import annotations

from datetime import datetime, timezone

from app.config import COMPLETED_ASSIGNMENT_STATUSES
from app.database import Assignment


def _parse_due_iso(value: str | None) -> datetime | None:
    if not value:
        return None

    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def get_upcoming_assignments(limit: int = 10) -> list[dict]:
    """Obtiene tareas proximas no finalizadas."""
    now = datetime.now(timezone.utc)
    rows = Assignment.query.order_by(Assignment.due_iso).all()

    assignments: list[dict] = []
    for row in rows:
        if row.status in COMPLETED_ASSIGNMENT_STATUSES:
            continue

        due_dt = _parse_due_iso(row.due_iso)
        if due_dt is None or due_dt < now:
            continue

        assignments.append(row.to_dict())
        if len(assignments) >= limit:
            break

    return assignments


def format_assignments_as_text(assignments: list[dict]) -> str:
    """Formatea tareas como lista legible para UI y respuestas."""
    if not assignments:
        return "No hay tareas pendientes."

    lines = []
    for assignment in assignments:
        due_iso = assignment.get("due_iso", "")
        due_label = due_iso[:16].replace("T", " ") if due_iso else "sin fecha"
        weight = assignment.get("weight", 0)
        lines.append(
            f"- {assignment.get('title', 'Sin titulo')} ({assignment.get('course', 'Sin curso')}) | "
            f"vence {due_label} | peso {weight}%"
        )

    return "\n".join(lines)


def build_task_suggestions(assignments: list[dict] | None = None) -> str:
    """Genera una sugerencia simple de priorizacion sin usar modelos."""
    assignments = assignments if assignments is not None else get_upcoming_assignments(limit=5)
    if not assignments:
        return "No hay tareas pendientes."

    ordered = sorted(assignments, key=lambda assignment: assignment.get("due_iso", ""))
    next_assignment = ordered[0]
    next_due = next_assignment.get("due_iso", "")[:16].replace("T", " ")

    if len(ordered) == 1:
        return (
            f"Tu proxima tarea es {next_assignment['title']} de {next_assignment['course']} "
            f"(vence {next_due}). Reserva hoy un bloque de trabajo y deja lista una primera version."
        )

    second_assignment = ordered[1]
    return (
        f"Prioriza primero {next_assignment['title']} de {next_assignment['course']} "
        f"(vence {next_due}). Luego avanza en {second_assignment['title']} para no acumular entregas."
    )
