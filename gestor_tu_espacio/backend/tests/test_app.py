"""Tests basicos del backend Tu Espacio."""

from __future__ import annotations

from pathlib import Path

import pytest

from app import create_app
from app.extensions import db
from app.utils import (
    validate_assignment_data,
    validate_contact_data,
    validate_event_data,
    validate_iso_date,
)


@pytest.fixture
def flask_app(tmp_path: Path):
    database_uri = f"sqlite:///{tmp_path / 'test_tu_espacio.db'}"
    app = create_app(
        testing=True,
        config_overrides={
            "SQLALCHEMY_DATABASE_URI": database_uri,
            "SEED_DEMO": False,
        },
    )

    with app.app_context():
        db.drop_all()
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(flask_app):
    with flask_app.test_client() as test_client:
        yield test_client


class TestValidaciones:
    def test_validate_iso_date_valid(self):
        assert validate_iso_date("2026-04-01T14:30:00") is True
        assert validate_iso_date("2026-04-01T14:30:00+00:00") is True
        assert validate_iso_date("2026-04-01T14:30:00Z") is True

    def test_validate_iso_date_invalid(self):
        assert validate_iso_date("2026-13-01T14:30:00") is False
        assert validate_iso_date("not-a-date") is False
        assert validate_iso_date("") is False
        assert validate_iso_date(None) is False

    def test_validate_event_data_valid(self):
        valid, cleaned, error = validate_event_data(
            {
                "title": "Reunion",
                "start_iso": "2026-04-05T10:00:00",
                "color": "teal",
                "all_day": False,
                "notes": "Importante",
            }
        )
        assert valid is True
        assert cleaned["title"] == "Reunion"
        assert error is None

    def test_validate_event_data_missing_title(self):
        valid, _, error = validate_event_data({"start_iso": "2026-04-05T10:00:00"})
        assert valid is False
        assert error is not None

    def test_validate_event_data_invalid_color(self):
        valid, _, error = validate_event_data(
            {
                "title": "Test",
                "start_iso": "2026-04-05T10:00:00",
                "color": "neon-pink",
            }
        )
        assert valid is False
        assert "color" in error

    def test_validate_contact_data_valid(self):
        valid, cleaned, error = validate_contact_data(
            {
                "name": "Juan Perez",
                "email": "juan@ejemplo.com",
                "phone": "+34 600 000 000",
                "company": "Empresa",
            }
        )
        assert valid is True
        assert cleaned["name"] == "Juan Perez"
        assert error is None

    def test_validate_assignment_data_valid(self):
        valid, cleaned, error = validate_assignment_data(
            {
                "course": "Math 101",
                "title": "Examen",
                "due_iso": "2026-05-01T23:59:00",
                "status": "pendiente",
                "weight": 30,
            }
        )
        assert valid is True
        assert cleaned["weight"] == 30
        assert error is None

    def test_validate_assignment_weight_out_of_range(self):
        valid, _, error = validate_assignment_data(
            {
                "course": "Math 101",
                "title": "Examen",
                "due_iso": "2026-05-01T23:59:00",
                "weight": 150,
            }
        )
        assert valid is False
        assert "weight" in error


class TestEndpointsCalendar:
    def test_calendar_list_get(self, client):
        response = client.get("/api/calendar/events")
        assert response.status_code == 200
        assert isinstance(response.get_json(), list)

    def test_calendar_create_post_valid(self, client):
        response = client.post(
            "/api/calendar/events",
            json={
                "title": "Test evento",
                "start_iso": "2026-04-10T15:00:00",
                "color": "purple",
            },
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["title"] == "Test evento"
        assert data["id"] is not None

    def test_calendar_create_post_invalid(self, client):
        response = client.post("/api/calendar/events", json={"title": "Test"})
        assert response.status_code == 400
        assert "error" in response.get_json()

    def test_calendar_update_put_partial(self, client):
        created = client.post(
            "/api/calendar/events",
            json={
                "title": "Evento base",
                "start_iso": "2026-04-10T15:00:00",
                "color": "teal",
            },
        )
        event_id = created.get_json()["id"]

        response = client.put(f"/api/calendar/events/{event_id}", json={"notes": "Notas editadas"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["title"] == "Evento base"
        assert data["notes"] == "Notas editadas"

    def test_calendar_delete_missing_returns_404(self, client):
        response = client.delete("/api/calendar/events/999999")
        assert response.status_code == 404
        assert "error" in response.get_json()

    def test_calendar_delete_success(self, client):
        created = client.post(
            "/api/calendar/events",
            json={
                "title": "Evento a eliminar",
                "start_iso": "2026-04-10T15:00:00",
            },
        )
        event_id = created.get_json()["id"]

        response = client.delete(f"/api/calendar/events/{event_id}")
        assert response.status_code == 200
        assert response.get_json()["ok"] is True

        events = client.get("/api/calendar/events").get_json()
        assert event_id not in [event["id"] for event in events]


class TestEndpointsContacts:
    def test_contacts_list_get(self, client):
        response = client.get("/api/contacts")
        assert response.status_code == 200
        assert isinstance(response.get_json(), list)

    def test_contacts_create_post_valid(self, client):
        response = client.post("/api/contacts", json={"name": "Test Contact", "email": "test@ejemplo.com"})
        assert response.status_code == 201
        assert response.get_json()["name"] == "Test Contact"

    def test_contacts_update_put_partial(self, client):
        created = client.post("/api/contacts", json={"name": "Test Contact", "email": "test@ejemplo.com"})
        contact_id = created.get_json()["id"]

        response = client.put(f"/api/contacts/{contact_id}", json={"company": "Nueva empresa"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Test Contact"
        assert data["company"] == "Nueva empresa"

    def test_contacts_delete_success(self, client):
        created = client.post("/api/contacts", json={"name": "Eliminarme"})
        contact_id = created.get_json()["id"]

        response = client.delete(f"/api/contacts/{contact_id}")
        assert response.status_code == 200
        assert response.get_json()["ok"] is True

    def test_contacts_delete_missing_returns_404(self, client):
        response = client.delete("/api/contacts/999999")
        assert response.status_code == 404


class TestEndpointsAssignments:
    def test_assignments_list_get(self, client):
        response = client.get("/api/assignments")
        assert response.status_code == 200
        assert isinstance(response.get_json(), list)

    def test_assignments_create_post_valid(self, client):
        response = client.post(
            "/api/assignments",
            json={
                "course": "CS 101",
                "title": "Proyecto final",
                "due_iso": "2026-05-15T23:59:00",
                "weight": 40,
            },
        )
        assert response.status_code == 201
        assert response.get_json()["course"] == "CS 101"

    def test_assignments_update_put_partial(self, client):
        created = client.post(
            "/api/assignments",
            json={
                "course": "CS 101",
                "title": "Proyecto final",
                "due_iso": "2026-05-15T23:59:00",
                "weight": 40,
            },
        )
        assignment_id = created.get_json()["id"]

        response = client.put(f"/api/assignments/{assignment_id}", json={"status": "entregado"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["title"] == "Proyecto final"
        assert data["status"] == "entregado"

    def test_assignments_delete_success(self, client):
        created = client.post(
            "/api/assignments",
            json={"course": "Math", "title": "Tarea", "due_iso": "2026-05-01"},
        )
        assignment_id = created.get_json()["id"]

        response = client.delete(f"/api/assignments/{assignment_id}")
        assert response.status_code == 200
        assert response.get_json()["ok"] is True

    def test_assignments_delete_missing_returns_404(self, client):
        response = client.delete("/api/assignments/999999")
        assert response.status_code == 404


class TestPagination:
    def test_calendar_list_pagination(self, client):
        response = client.get("/api/calendar/events?page=1&limit=10")
        assert response.status_code == 200
        assert isinstance(response.get_json(), list)

    def test_contacts_list_pagination(self, client):
        response = client.get("/api/contacts?page=1&limit=5")
        assert response.status_code == 200
        assert isinstance(response.get_json(), list)


class TestRoutes:
    def test_index_returns_frontend_shell(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert b"Tu Espacio" in response.data

    def test_frontend_route_serves_spa(self, client):
        response = client.get("/calendario")
        assert response.status_code == 200
        assert b"Tu Espacio" in response.data

    def test_tu_espacio_redirects_to_root(self, client):
        response = client.get("/tu-espacio", follow_redirects=False)
        assert response.status_code == 302
        assert response.location.endswith("/")

    def test_trading_lab_redirect(self, client):
        response = client.get("/trading-lab", follow_redirects=False)
        assert response.status_code == 301
        assert "/mercados" in response.location

    def test_legacy_route_redirects_to_spa_equivalent(self, client):
        response = client.get("/investigacion", follow_redirects=False)
        assert response.status_code == 302
        assert response.location.endswith("/asistente")

    def test_frontend_fallback_without_build(self, client, flask_app, tmp_path: Path):
        flask_app.config["FRONTEND_BUILD_DIR"] = tmp_path / "frontend-missing"
        response = client.get("/")
        assert response.status_code == 200
        assert b"una sola SPA" in response.data

    def test_api_news(self, client, monkeypatch):
        import app.services.news_service as news_service

        monkeypatch.setattr(
            news_service,
            "fetch_news",
            lambda: [
                {
                    "title": "Titular de prueba",
                    "link": "https://example.com/news",
                    "source": "Fuente demo",
                    "region": "economia",
                    "region_label": "Economia & finanzas",
                    "summary": "Resumen",
                    "published": "",
                    "published_iso": "",
                    "published_label": "",
                }
            ],
        )
        response = client.get("/api/news")
        assert response.status_code == 200
        data = response.get_json()
        assert "items" in data
        assert "fetched_at" in data
        assert "ttl_seconds" in data

    def test_api_mercados(self, client, monkeypatch):
        import app.services.markets_service as markets_service

        monkeypatch.setattr(
            markets_service,
            "fetch_markets",
            lambda: [{"symbol": "NVDA", "price": 100.0, "chg_pct": 1.2}],
        )
        response = client.get("/api/mercados")
        assert response.status_code == 200
        data = response.get_json()
        assert "rows" in data
        assert isinstance(data["rows"], list)

    def test_api_ai_ask_removed(self, client):
        response = client.get("/api/ai/ask?q=hola")
        assert response.status_code == 410
        assert "retirada" in response.get_json()["error"]

    def test_api_research_ask_uses_local_assistant(self, client, monkeypatch):
        import app.routes.research as research_routes

        monkeypatch.setattr(
            research_routes,
            "answer_question",
            lambda question: {
                "answer": f"Respuesta local para: {question}",
                "provider": "system",
                "intent": "general",
                "data_type": "none",
                "sources": "",
                "context_used": True,
            },
        )

        response = client.post("/api/research/ask", json={"question": "Que tengo pendiente?"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["provider"] == "system"
        assert "Respuesta local" in data["answer"]

    def test_get_context_by_intent_university_uses_due_dates(self, flask_app):
        from app.models import Assignment
        from app.services.chat_service import get_context_by_intent

        with flask_app.app_context():
            db.session.add(
                Assignment(
                    course="Math",
                    title="Parcial",
                    due_iso="2026-05-10T09:00:00",
                    status="pendiente",
                    weight=30,
                    notes="",
                )
            )
            db.session.commit()

            context = get_context_by_intent("university")
            assert "Parcial" in context
            assert "2026-05-10 09:00" in context


class TestHealth:
    def test_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "ok"
        assert data["version"] == "1.0.0"
        assert data["modules"] == 8
        assert "X-Request-Duration-Ms" in response.headers

    def test_stats(self, client):
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.get_json()
        assert "events" in data
        assert "contacts" in data
        assert "assignments" in data
        assert "total" in data
