# Tu espacio (`gestor_tu_espacio`)

Productividad, calendario, **Trading Lab**, tareas y hábitos. Puerto típico **5000**, base **`tu_espacio.db`**.

**Venv, instalación y Git:** [README del repositorio](../README.md#install) · [Entornos virtuales](../README.md#venv)

## Arranque rápido

```powershell
cd gestor_tu_espacio
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Navegador: **http://127.0.0.1:5000/tu-espacio** (o la raíz `/`, redirige allí).

### Puerto

```powershell
$env:FLASK_PORT = "5000"
python app.py
```

## Estructura relevante

| Ruta | Uso |
|------|-----|
| `app.py` | Flask |
| `database.py` | SQLite |
| `trading_lab/` | Trading Lab |
| `templates/` · `static/` | Front (incl. fondo matrix RGB en `static/js/matrix_bg.js`) |
| `requirements.txt` | Dependencias (**yfinance**, etc.) |

## Problemas frecuentes

| Síntoma | Qué hacer |
|---------|-----------|
| Trading Lab sin datos | Firewall; comprobar `yfinance` en **este** venv |
| Puerto 5000 ocupado | `$env:FLASK_PORT = "5002"` |

## Limpieza de plantillas

```powershell
cd gestor_tu_espacio
python scripts/limpiar_templates_muertos.py
```

Detalle: [README raíz — Mantenimiento](../README.md#maint).
