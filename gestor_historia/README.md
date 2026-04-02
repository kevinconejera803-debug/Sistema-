# Historia (`gestor_historia`)

Simulador (Nexo, misiones, NEXUS CORE, tienda, etc.). Puerto típico **5001**, base **`historia.db`**.

**Venv, instalación y Git:** [README del repositorio](../README.md#install) · [Entornos virtuales](../README.md#venv)

## Arranque rápido

```powershell
cd gestor_historia
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:FLASK_PORT = "5001"
python app.py
```

Navegador: **http://127.0.0.1:5001/**

### Variables opcionales (`.env` o sesión)

```ini
FLASK_PORT=5001
FLASK_HOST=0.0.0.0
```

## Estructura relevante

| Ruta | Uso |
|------|-----|
| `app.py` | Flask |
| `database.py` | SQLite |
| `templates/` · `static/` | Front |
| `nucleo_game.py`, `nexus_core.py`, `game_shop.py`, … | Lógica del juego |

## Problemas frecuentes

| Síntoma | Qué hacer |
|---------|-----------|
| Puerto ocupado | Cambiar `FLASK_PORT` o cerrar la otra app |
| Módulo no encontrado | Activar **este** venv y `pip install -r requirements.txt` |
| `python` incorrecto | `.\.venv\Scripts\python.exe app.py` |

## Limpieza de plantillas

```powershell
cd gestor_historia
python scripts/limpiar_templates_muertos.py
```

Detalle: [README raíz — Mantenimiento](../README.md#maint).

## Otra app

**Tu espacio:** [../gestor_tu_espacio/README.md](../gestor_tu_espacio/README.md)
