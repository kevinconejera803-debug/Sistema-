"""
SQLite — Tu espacio: eventos (calendario), contactos, entregas (universidad).
"""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from datetime import date, datetime, time, timedelta
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "tu_espacio.db"


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                start_iso TEXT NOT NULL,
                end_iso TEXT,
                all_day INTEGER DEFAULT 1,
                color TEXT DEFAULT 'teal',
                notes TEXT DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT DEFAULT '',
                phone TEXT DEFAULT '',
                company TEXT DEFAULT '',
                notes TEXT DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course TEXT NOT NULL,
                title TEXT NOT NULL,
                due_iso TEXT NOT NULL,
                status TEXT DEFAULT 'pendiente',
                weight INTEGER DEFAULT 0
            );
            """
        )
        _seed_demo(conn)


def _seed_demo(conn: sqlite3.Connection) -> None:
    n = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
    if n > 0:
        return
    today = date.today()
    samples = [
        (
            "Revisión semanal",
            datetime.combine(today, time(9, 0)).isoformat(),
            None,
            1,
            "teal",
            "Bloque de enfoque",
        ),
        (
            "Entrega borrador",
            datetime.combine(today + timedelta(days=3), time(23, 59)).isoformat(),
            None,
            1,
            "yellow",
            "Universidad",
        ),
    ]
    for row in samples:
        conn.execute(
            "INSERT INTO events (title, start_iso, end_iso, all_day, color, notes) VALUES (?,?,?,?,?,?)",
            row,
        )
    if conn.execute("SELECT COUNT(*) FROM contacts").fetchone()[0] == 0:
        conn.execute(
            "INSERT INTO contacts (name, email, phone, company, notes) VALUES (?,?,?,?,?)",
            (
                "María López",
                "maria@ejemplo.com",
                "+34 600 000 000",
                "Consultora",
                "Contacto demo",
            ),
        )
    if conn.execute("SELECT COUNT(*) FROM assignments").fetchone()[0] == 0:
        due_d = today + timedelta(days=7)
        due = datetime.combine(due_d, time(12, 0)).isoformat()
        conn.execute(
            "INSERT INTO assignments (course, title, due_iso, status, weight) VALUES (?,?,?,?,?)",
            ("Data & analítica", "Informe de segmentación", due, "pendiente", 30),
        )


def row_to_dict(row: sqlite3.Row) -> dict:
    return {k: row[k] for k in row.keys()}
