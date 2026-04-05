"""
Tests básicos para Tu espacio app.
Ejecutar: pytest test_app.py -v
"""
import pytest
import app as app_module
from app.utils import (
    validate_event_data, validate_contact_data, validate_assignment_data,
    validate_iso_date
)

flask_app = app_module.app


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Cliente de test para Flask con BD aislada y sin datos demo."""
    monkeypatch.setenv("TU_ESPACIO_DB_PATH", str(tmp_path / "test_tu_espacio.db"))
    monkeypatch.setenv("TU_ESPACIO_SEED_DEMO", "0")

    app_module._app_ready = False
        
    flask_app.config["TESTING"] = True
    app_module.ensure_app_ready()

    with flask_app.test_client() as client:
        yield client

    app_module._app_ready = False


class TestValidaciones:
    """Tests de validación de datos."""
    
    def test_validate_iso_date_valid(self):
        """Valida fecha ISO correcta."""
        assert validate_iso_date("2026-04-01T14:30:00") is True
        assert validate_iso_date("2026-04-01T14:30:00+00:00") is True
        assert validate_iso_date("2026-04-01T14:30:00Z") is True
    
    def test_validate_iso_date_invalid(self):
        """Rechaza fechas ISO inválidas."""
        assert validate_iso_date("2026-13-01T14:30:00") is False
        assert validate_iso_date("not-a-date") is False
        assert validate_iso_date("") is False
        assert validate_iso_date(None) is False
    
    def test_validate_event_data_valid(self):
        """Valida datos de evento correcto."""
        data = {
            "title": "Reunión",
            "start_iso": "2026-04-05T10:00:00",
            "color": "teal",
            "all_day": False,
            "notes": "Importante"
        }
        valid, cleaned, error = validate_event_data(data)
        assert valid is True
        assert cleaned["title"] == "Reunión"
        assert error is None
    
    def test_validate_event_data_missing_title(self):
        """Rechaza evento sin título."""
        data = {
            "start_iso": "2026-04-05T10:00:00",
        }
        valid, cleaned, error = validate_event_data(data)
        assert valid is False
        assert error is not None
    
    def test_validate_event_data_invalid_color(self):
        """Rechaza color inválido."""
        data = {
            "title": "Test",
            "start_iso": "2026-04-05T10:00:00",
            "color": "neon-pink",
        }
        valid, cleaned, error = validate_event_data(data)
        assert valid is False
        assert "color" in error
    
    def test_validate_contact_data_valid(self):
        """Valida datos de contacto correcto."""
        data = {
            "name": "Juan Pérez",
            "email": "juan@ejemplo.com",
            "phone": "+34 600 000 000",
            "company": "Empresa",
        }
        valid, cleaned, error = validate_contact_data(data)
        assert valid is True
        assert cleaned["name"] == "Juan Pérez"
        assert error is None
    
    def test_validate_assignment_data_valid(self):
        """Valida datos de tarea correcto."""
        data = {
            "course": "Math 101",
            "title": "Examen",
            "due_iso": "2026-05-01T23:59:00",
            "status": "pendiente",
            "weight": 30,
        }
        valid, cleaned, error = validate_assignment_data(data)
        assert valid is True
        assert cleaned["weight"] == 30
        assert error is None
    
    def test_validate_assignment_weight_out_of_range(self):
        """Rechaza peso fuera de rango."""
        data = {
            "course": "Math 101",
            "title": "Examen",
            "due_iso": "2026-05-01T23:59:00",
            "weight": 150,  # > 100
        }
        valid, cleaned, error = validate_assignment_data(data)
        assert valid is False
        assert "weight" in error


class TestEndpointsCalendar:
    """Tests de endpoints de calendario."""
    
    def test_calendar_list_get(self, client):
        """GET /api/calendar/events retorna lista."""
        response = client.get("/api/calendar/events")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_calendar_create_post_valid(self, client):
        """POST /api/calendar/events crea evento."""
        payload = {
            "title": "Test evento",
            "start_iso": "2026-04-10T15:00:00",
            "color": "purple",
        }
        response = client.post("/api/calendar/events", json=payload)
        assert response.status_code == 201
        data = response.get_json()
        assert data["title"] == "Test evento"
        assert data["id"] is not None
    
    def test_calendar_create_post_invalid(self, client):
        """POST con datos inválidos retorna 400."""
        payload = {
            "title": "Test",
            # start_iso faltante
        }
        response = client.post("/api/calendar/events", json=payload)
        assert response.status_code == 400
        assert "error" in response.get_json()

    def test_calendar_update_put_partial(self, client):
        """PUT parcial actualiza solo los campos enviados."""
        created = client.post("/api/calendar/events", json={
            "title": "Evento base",
            "start_iso": "2026-04-10T15:00:00",
            "color": "teal",
        })
        event_id = created.get_json()["id"]

        response = client.put(f"/api/calendar/events/{event_id}", json={
            "notes": "Notas editadas",
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data["title"] == "Evento base"
        assert data["notes"] == "Notas editadas"

    def test_calendar_delete_missing_returns_404(self, client):
        """DELETE sobre evento inexistente retorna 404."""
        response = client.delete("/api/calendar/events/999999")
        assert response.status_code == 404
        assert "error" in response.get_json()
    
    def test_calendar_delete_success(self, client):
        """DELETE elimina evento existente."""
        # Crear evento
        created = client.post("/api/calendar/events", json={
            "title": "Evento a eliminar",
            "start_iso": "2026-04-10T15:00:00",
        })
        event_id = created.get_json()["id"]
        
        # Eliminar
        response = client.delete(f"/api/calendar/events/{event_id}")
        assert response.status_code == 200
        assert response.get_json()["ok"] is True
        
        # Verificar que no existe en la lista
        list_response = client.get("/api/calendar/events")
        events = list_response.get_json()
        event_ids = [e["id"] for e in events]
        assert event_id not in event_ids


class TestEndpointsContacts:
    """Tests de endpoints de contactos."""
    
    def test_contacts_list_get(self, client):
        """GET /api/contacts retorna lista."""
        response = client.get("/api/contacts")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_contacts_create_post_valid(self, client):
        """POST /api/contacts crea contacto."""
        payload = {
            "name": "Test Contact",
            "email": "test@ejemplo.com",
        }
        response = client.post("/api/contacts", json=payload)
        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "Test Contact"

    def test_contacts_update_put_partial(self, client):
        """PUT parcial actualiza contacto sin exigir payload completo."""
        created = client.post("/api/contacts", json={
            "name": "Test Contact",
            "email": "test@ejemplo.com",
        })
        contact_id = created.get_json()["id"]

        response = client.put(f"/api/contacts/{contact_id}", json={
            "company": "Nueva empresa",
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data["name"] == "Test Contact"
        assert data["company"] == "Nueva empresa"
    
    def test_contacts_delete_success(self, client):
        """DELETE elimina contacto existente."""
        created = client.post("/api/contacts", json={"name": "Eliminarme"})
        contact_id = created.get_json()["id"]
        
        response = client.delete(f"/api/contacts/{contact_id}")
        assert response.status_code == 200
        assert response.get_json()["ok"] is True
    
    def test_contacts_delete_missing_returns_404(self, client):
        """DELETE sobre contacto inexistente retorna 404."""
        response = client.delete("/api/contacts/999999")
        assert response.status_code == 404


class TestEndpointsAssignments:
    """Tests de endpoints de tareas."""
    
    def test_assignments_list_get(self, client):
        """GET /api/assignments retorna lista."""
        response = client.get("/api/assignments")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_assignments_create_post_valid(self, client):
        """POST /api/assignments crea tarea."""
        payload = {
            "course": "CS 101",
            "title": "Proyecto final",
            "due_iso": "2026-05-15T23:59:00",
            "weight": 40,
        }
        response = client.post("/api/assignments", json=payload)
        assert response.status_code == 201
        data = response.get_json()
        assert data["course"] == "CS 101"

    def test_assignments_update_put_partial(self, client):
        """PUT parcial actualiza tarea sin requerir todos los campos."""
        created = client.post("/api/assignments", json={
            "course": "CS 101",
            "title": "Proyecto final",
            "due_iso": "2026-05-15T23:59:00",
            "weight": 40,
        })
        assignment_id = created.get_json()["id"]

        response = client.put(f"/api/assignments/{assignment_id}", json={
            "status": "entregado",
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data["title"] == "Proyecto final"
        assert data["status"] == "entregado"
    
    def test_assignments_delete_success(self, client):
        """DELETE elimina tarea existente."""
        created = client.post("/api/assignments", json={
            "course": "Math", "title": "Tarea", "due_iso": "2026-05-01"
        })
        assignment_id = created.get_json()["id"]
        
        response = client.delete(f"/api/assignments/{assignment_id}")
        assert response.status_code == 200
        assert response.get_json()["ok"] is True
    
    def test_assignments_delete_missing_returns_404(self, client):
        """DELETE sobre tarea inexistente retorna 404."""
        response = client.delete("/api/assignments/999999")
        assert response.status_code == 404


class TestPagination:
    """Tests de paginación."""
    
    def test_calendar_list_pagination(self, client):
        """GET /api/calendar/events con parámetros de paginación."""
        response = client.get("/api/calendar/events?page=1&limit=10")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_contacts_list_pagination(self, client):
        """GET /api/contacts con paginación."""
        response = client.get("/api/contacts?page=1&limit=5")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)


class TestRoutes:
    """Tests de rutas principales."""
    
    def test_index_redirect(self, client):
        """GET / redirige a /tu-espacio."""
        response = client.get("/", follow_redirects=False)
        assert response.status_code in [301, 302]
        assert "/tu-espacio" in response.location
    
    def test_tu_espacio(self, client):
        """GET /tu-espacio retorna página."""
        response = client.get("/tu-espacio")
        assert response.status_code == 200
        assert b"tu_espacio.html" in response.data or b"CALENDARIO" in response.data
    
    def test_trading_lab_redirect(self, client):
        """GET /trading-lab redirige a /mercados."""
        response = client.get("/trading-lab", follow_redirects=False)
        assert response.status_code == 301
        assert "/mercados" in response.location
    
    def test_api_news(self, client, monkeypatch):
        """GET /api/news retorna noticias."""
        import app.services.news_service as news_service
        monkeypatch.setattr(news_service, "fetch_news", lambda: [
            {
                "title": "Titular de prueba",
                "link": "https://example.com/news",
                "source": "Fuente demo",
                "region": "economia",
                "region_label": "Economía & finanzas",
                "summary": "Resumen",
                "published": "",
                "published_iso": "",
                "published_label": "",
            }
        ])
        response = client.get("/api/news")
        assert response.status_code == 200
        data = response.get_json()
        assert "items" in data
        assert "fetched_at" in data
        assert "ttl_seconds" in data
    
    def test_api_mercados(self, client, monkeypatch):
        """GET /api/mercados retorna cotizaciones."""
        import app.services.markets_service as markets_service
        monkeypatch.setattr(markets_service, "fetch_markets", lambda: [
            {"symbol": "NVDA", "price": 100.0, "chg_pct": 1.2}
        ])
        response = client.get("/api/mercados")
        assert response.status_code == 200
        data = response.get_json()
        assert "rows" in data
        assert isinstance(data["rows"], list)


class TestHealth:
    """Tests de health check."""
    
    def test_health_check(self, client):
        """GET /api/health retorna status ok."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "ok"
        assert data["version"] == "1.0.0"
        assert data["modules"] == 8
    
    def test_stats(self, client):
        """GET /api/stats retorna estadísticas."""
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.get_json()
        assert "events" in data
        assert "contacts" in data
        assert "assignments" in data
        assert "total" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
