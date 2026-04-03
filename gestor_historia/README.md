# Historia (`gestor_historia`)

Segunda aplicación Flask del repositorio (junto a **gestor_tu_espacio**). Puerto típico **5001**, base **`historia.db`** cuando la uses en `database.py`.

**Instalación y Git (raíz del repo):** [README del repositorio](../README.md#install)

## Arranque rápido

```powershell
cd gestor_historia
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:FLASK_PORT = "5001"
python app.py
```

Navegador: **http://127.0.0.1:5001/**

No hay URLs ni dependencias hacia **gestor_tu_espacio** en el código: cada app es independiente.

### Estructura

| Ruta | Uso |
|------|-----|
| `app.py` | Flask, rutas |
| `database.py` | SQLite (cuando lo conectes) |
| `templates/historia.html` | Página principal |
| `static/css/historia.css` | Estilos |
| `scripts/` | Utilidades (p. ej. limpiar plantillas) |

## Limpieza de plantillas

```powershell
cd gestor_historia
python scripts/limpiar_templates_muertos.py
```

Detalle: [README raíz — Mantenimiento](../README.md#maint).

## Otra app

**Tu espacio:** [../gestor_tu_espacio/README.md](../gestor_tu_espacio/README.md)
