# Tu espacio (`gestor_tu_espacio`)

Panel principal del repositorio (SYSTEM INTERFACE). Puerto típico **5000**, base **`tu_espacio.db`**.

**Instalación general y Git:** [README del repositorio](../README.md#install)

---

## Cómo entrar

Sustituye la ruta si tu carpeta del repo está en otro sitio.

### Primera vez (crear entorno e instalar)

Copia y pega en **PowerShell** (una sola vez por máquina):

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd "$REPO\gestor_tu_espacio"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
deactivate
```

Si `Activate.ps1` está bloqueado:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Cada vez que quieras usar Tu espacio

Copia y pega en **PowerShell** (terminal 1):

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd "$REPO\gestor_tu_espacio"
.\.venv\Scripts\Activate.ps1
python app.py
```

Opcional — otro puerto antes de `python app.py`:

```powershell
$env:FLASK_PORT = "5000"
```

### Abrir en el navegador

Pega esta URL (o ábrela al ver el mensaje de Flask en la consola):

**http://127.0.0.1:5000/tu-espacio**

La raíz **http://127.0.0.1:5000/** redirige a `/tu-espacio`. Para parar el servidor: **Ctrl+C** en esa terminal.

### Módulos (misma interfaz SYSTEM INTERFACE)

Cada apartado tiene su ruta; también están en el menú lateral y en las tarjetas del panel:

| Sección | URL (puerto 5000) |
|---------|-------------------|
| Calendario | `/calendario` |
| Universidad | `/universidad` |
| Trading Lab | `/trading-lab` |
| Ciberseguridad | `/ciberseguridad` |
| Herramientas | `/herramientas` |
| Contactos | `/contactos` |
| Noticias | `/noticias` |
| Buscar | `/buscar` |
| Calculadora | `/calculadora` |

Ejemplo: **http://127.0.0.1:5000/noticias**

**Qué hace cada módulo (funcional):**

- **Calendario** — Vista mensual interactiva, eventos en SQLite (`tu_espacio.db`), alta y borrado por día.
- **Universidad** — Entregas con curso, fecha límite, peso % y estado (pendiente / entregado).
- **Trading Lab** — Cotizaciones con **yfinance** (caché ~60 s); la tabla se carga por **`GET /api/trading`** (skeleton y botón Actualizar).
- **Ciberseguridad** — Checklist por categorías; progreso en **localStorage**.
- **Herramientas** — QR (servicio público de imagen), copiar y descargar texto.
- **Contactos** — CRM ligero en SQLite.
- **Noticias** — RSS (**feedparser**: Xataka, El País).
- **Buscar** — Cruza eventos, contactos y entregas vía `/api/search`.
- **Calculadora** — Operaciones encadenadas con historial local en pantalla.

---

No hay URLs ni dependencias hacia **gestor_historia** en el código: cada app se ejecuta por separado.

## Estructura

| Ruta | Uso |
|------|-----|
| `app.py` | Flask |
| `database.py` | SQLite |
| `templates/` (`base.html`, `tu_espacio.html`, `modulos/*.html`) · `static/` | Front + `css/modules.css`, JS por módulo |
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
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio"
.\.venv\Scripts\Activate.ps1
python scripts/limpiar_templates_muertos.py
```

Detalle: [README raíz — Mantenimiento](../README.md#maint).

## Otra app

**Historia:** [../gestor_historia/README.md](../gestor_historia/README.md)
