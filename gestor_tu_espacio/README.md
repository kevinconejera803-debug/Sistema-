# Tu espacio (`gestor_tu_espacio`)

Panel principal del repositorio (SYSTEM INTERFACE). Puerto típico **5000**, base **`tu_espacio.db`**.

**Instalación y Git (raíz del repo):** [README del repositorio](../README.md#install)

## Arranque rápido

```powershell
cd gestor_tu_espacio
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Navegador: **http://127.0.0.1:5000/tu-espacio** (la raíz `/` redirige allí).

### Puerto y enlace a Historia

```powershell
$env:FLASK_PORT = "5000"
# Si Historia corre en otro host/puerto:
$env:HISTORIA_APP_URL = "http://127.0.0.1:5001"
```

## Estructura

| Ruta | Uso |
|------|-----|
| `app.py` | Flask |
| `database.py` | SQLite |
| `templates/` · `static/` | Front (incl. fondo matrix en `static/js/matrix_bg.js`) |
| `scripts/` | Utilidades y scripts de repo (`scripts/repo/` para GitHub) |
| `requirements.txt` | Dependencias |

## Scripts de Git (subir a GitHub)

Desde la raíz del repositorio, los `.ps1` están en **`gestor_tu_espacio/scripts/repo/`** (operan sobre el `.git` de la raíz):

- `push_con_token.ps1` — push con PAT
- `sync_github.ps1` — `git push` al `origin` configurado
- `setup_github.ps1` — creación de repo con `gh`

Hook opcional (auto-push tras cada commit): **`gestor_tu_espacio/scripts/install-git-hooks.ps1`**

## Limpieza de plantillas

```powershell
cd gestor_tu_espacio
python scripts/limpiar_templates_muertos.py
```

Detalle: [README raíz — Mantenimiento](../README.md#maint).

## Otra app

**Historia:** [../gestor_historia/README.md](../gestor_historia/README.md)
