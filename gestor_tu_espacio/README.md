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
| Contactos | `/contactos` |
| Trading Lab | `/trading-lab` |
| Noticias | `/noticias` |
| Ciberseguridad | `/ciberseguridad` |
| Calculadora | `/calculadora` |

En **`/tu-espacio`** las tarjetas de acceso van en **una sola cuadrícula** (todos los módulos visibles a la vez).

Ejemplo: **http://127.0.0.1:5000/noticias**

**Enlaces Universidad (intranet / aula virtual):** antes de `python app.py` puedes definir, por ejemplo:

```powershell
$env:TU_ESPACIO_INTRANET_URL = "https://tu-intranet.ejemplo.edu"
$env:TU_ESPACIO_AULA_URL = "https://tu-campus.ejemplo.edu"
```

Si no las defines, usa el botón **Enlaces** (esquina del bloque de acceso rápido) en Universidad para guardarlas solo en tu navegador.

**Qué hace cada módulo (funcional):**

- **Calendario** — Horario en hora local (24 h): vistas mes, semana y día; eventos en SQLite (`tu_espacio.db`) con índices; alta y borrado por día.
- **Universidad** — Accesos a **intranet** y **aula virtual** (URLs vía `TU_ESPACIO_INTRANET_URL` / `TU_ESPACIO_AULA_URL` o enlaces guardados en el navegador) y tabla de **entregas** (curso, fecha límite, peso %, estado).
- **Trading Lab** — **`GET /api/trading`** (yfinance, caché ~60 s): skeleton, tabla, toasts y botón Actualizar.
- **Ciberseguridad** — Checklist ampliada, donut de % y bloques por tema; progreso en **localStorage**.
- **Contactos** — SQLite con **filtro en vivo**, edición y toasts.
- **Noticias** — RSS (**feedparser**) centrados en **economía, finanzas, internacional, geopolítica y política** (BBC Business/World/Politics, NYT Economy/World/Politics, Guardian Business/World/Politics, El País Economía/Internacional, MarketWatch, CNBC). Cada ítem incluye **`published_iso`** y etiqueta legible en **hora Chile**. Caché ~90&nbsp;s; **`GET /api/news`** con `fetched_at` y `ttl_seconds`; filtros **Economía / Internacional / Política**; auto cada 4&nbsp;min.
- **Calculadora** — **math.js** + **KaTeX** (CDN): vista tipo *Photomath* sin cámara (expresión y solución renderizadas arriba; edición en texto); vista previa al escribir; pestañas **Números y operadores** / **Científico**; **Pasos y método** (guía breve); historial en **modal**; **Calcular** / **Borrar** visibles; opciones extra (abc, **^·n**, cursor) en desplegable; `√`/`∛`, `nthRoot`, `der`, `integral(...)`, `lim`, `sumfrom`; **C** / **CE** / **ans**. Scripts `calculator.js` y `modules.css` con `?v=` en plantillas para invalidar caché.

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
