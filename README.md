# Ejercicios prácticos

Dos aplicaciones Flask **independientes**: cada una con su **`.venv`**, **`requirements.txt`** y base de datos propia.

| Carpeta | Puerto | URL local |
|---------|--------|-----------|
| [`gestor_tu_espacio/`](gestor_tu_espacio/) | **5000** | http://127.0.0.1:5000 |
| [`gestor_historia/`](gestor_historia/) | **5001** | http://127.0.0.1:5001 |

En la raíz solo están este archivo, **`.gitignore`** y las carpetas **`gestor_tu_espacio/`** y **`gestor_historia/`**. Scripts de Git y utilidades del repo viven dentro de **`gestor_tu_espacio/scripts/`** (no hay otra app ni carpetas sueltas en la raíz).

---

## Contenido

1. [Instalación completa](#install) — desde cero  
2. [Entornos virtuales](#venv) — crear, activar, Cursor, sin `activate`  
3. [Arrancar las dos apps](#run)  
4. [Estructura del repositorio](#tree)  
5. [Mantenimiento](#maint) — plantillas, `sw.js`, monolito antiguo  
6. [Git](#git)  
7. [Si nada funciona (Windows)](#fix)  

Documentación por app: [gestor_tu_espacio/README.md](gestor_tu_espacio/README.md) · [gestor_historia/README.md](gestor_historia/README.md)

---

<a id="install"></a>

## Instalación completa

**Requisito:** Python **3.10+** (`python --version`).

Desde la **raíz del repositorio** (donde está este `README.md`):

```powershell
# Tu espacio
cd gestor_tu_espacio
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
deactivate
cd ..

# Historia
cd gestor_historia
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

En macOS/Linux sustituye la activación por `source .venv/bin/activate` (ver [Entornos virtuales](#venv)).

---

<a id="venv"></a>

## Entornos virtuales

Cada app usa la carpeta **`.venv`** dentro de su directorio. **No mezcles** dependencias entre apps.

Cuando el venv está activo, el prompt muestra **`(.venv)`**.

### Crear `.venv` (una vez por app)

```powershell
cd gestor_tu_espacio   # o gestor_historia
python -m venv .venv
```

Si PowerShell bloquea `Activate.ps1`:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Activar (cada sesión)

| Shell | Tu espacio | Historia |
|-------|------------|----------|
| **PowerShell** | `cd gestor_tu_espacio` → `.\.venv\Scripts\Activate.ps1` | `cd gestor_historia` → `.\.venv\Scripts\Activate.ps1` |
| **CMD** | `cd gestor_tu_espacio` → `.venv\Scripts\activate.bat` | igual con `gestor_historia` |
| **Git Bash** | `cd gestor_tu_espacio` → `source .venv/Scripts/activate` | igual |
| **macOS/Linux** | `source .venv/bin/activate` dentro de la carpeta de la app | igual |

**Salir:** `deactivate`

### Sin activar (rutas explícitas, PowerShell desde la raíz)

```powershell
.\gestor_tu_espacio\.venv\Scripts\pip.exe install -r gestor_tu_espacio\requirements.txt
.\gestor_tu_espacio\.venv\Scripts\python.exe gestor_tu_espacio\app.py
```

En Bash: `gestor_historia/.venv/bin/python`, etc.

### Cursor / VS Code

`Ctrl+Shift+P` → **Python: Select Interpreter** → elige `.venv\Scripts\python.exe` de la app que estés editando. Para las dos apps a la vez, **dos terminales**; un venv por terminal.

### Comprobar el Python correcto

```powershell
where.exe python
python -c "import sys; print(sys.executable)"
```

La ruta debe incluir **`gestor_tu_espacio\.venv`** o **`gestor_historia\.venv`**.

---

<a id="run"></a>

## Arrancar las dos apps

Dos terminales en la raíz del repo:

**Terminal A — Tu espacio**

```powershell
cd gestor_tu_espacio
.\.venv\Scripts\Activate.ps1
python app.py
```

**Terminal B — Historia**

```powershell
cd gestor_historia
.\.venv\Scripts\Activate.ps1
$env:FLASK_PORT = "5001"   # si tu app no fija el puerto sola
python app.py
```

Variables útiles (Tu espacio): `FLASK_PORT`, `FLASK_HOST`. Detalle: [gestor_tu_espacio/README.md](gestor_tu_espacio/README.md), [gestor_historia/README.md](gestor_historia/README.md).

---

<a id="tree"></a>

## Estructura del repositorio

```
Ejercicios practicos/
├── .gitignore
├── README.md                 # Este archivo
├── gestor_tu_espacio/       # App «Tu espacio» (puerto 5000)
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   ├── templates/
│   ├── static/
│   └── scripts/
│       ├── limpiar_templates_muertos.py
│       ├── eliminar_gestor_tareas_restante.ps1
│       ├── install-git-hooks.ps1
│       ├── git-hooks/
│       └── repo/             # push_con_token, sync_github, setup_github
└── gestor_historia/          # App «Historia» (puerto 5001)
    ├── app.py
    ├── database.py
    ├── requirements.txt
    ├── templates/
    ├── static/
    └── scripts/
        └── limpiar_templates_muertos.py
```

**Reglas:** sin código compartido entre carpetas; **un venv por app**; bases de datos **`tu_espacio.db`** / **`historia.db`** solo en su carpeta.

---

<a id="maint"></a>

## Mantenimiento

### Plantillas HTML sin usar

Desde la carpeta de la app (`cd gestor_tu_espacio` o `cd gestor_historia`):

```powershell
python scripts/limpiar_templates_muertos.py
python scripts/limpiar_templates_muertos.py --apply
```

Haz commit o copia de seguridad antes de `--apply`.

### Service worker

Si quitas CSS o plantillas, actualiza la lista `STATIC_ASSETS` en `static/sw.js`.

### Monolito `gestor_tareas`

Si quedara esa carpeta y no puedes borrarla a mano, cierra procesos Python y ejecuta:

```powershell
cd gestor_tu_espacio\scripts
.\eliminar_gestor_tareas_restante.ps1
```

---

<a id="fix"></a>

## Si nada funciona (Windows)

### 1) Comprueba Python en PowerShell

```powershell
python --version
```

Si dice que **no reconoce** `python`, o **`py`** muestra un error de archivo no encontrado, la instalación de Python está **rota o incompleta**.

**Qué hacer:** descarga el instalador desde [https://www.python.org/downloads/](https://www.python.org/downloads/) (elige **3.12** o **3.13**, estable). Durante la instalación marca **“Add python.exe to PATH”** y usa **“Install Now”**. Cierra y vuelve a abrir PowerShell.

Comprueba de nuevo:

```powershell
python --version
```

### 2) Crear venv e instalar (Tu espacio)

Sustituye la ruta si tu repo está en otro sitio:

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd $REPO\gestor_tu_espacio
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

Abre **http://127.0.0.1:5000** . Para parar: `Ctrl+C`.

### 3) Si `Activate.ps1` está deshabilitado

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 4) Historia (otra terminal)

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd $REPO\gestor_historia
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

Abre **http://127.0.0.1:5001** .

---

<a id="git"></a>

## Git

```powershell
cd "ruta\a\Ejercicios practicos"
git status
git add .
git commit -m "Describe el cambio"
```

Identidad (este repo o global):

```powershell
git config user.name "Tu nombre"
git config user.email "tu@email.com"
```

Lo ignorado por defecto: `.venv/`, `*.db`, `uploads/`, `.env`, etc. (ver `.gitignore`).

**Comprobar Python/Git en tu PC:** `.\gestor_tu_espacio\scripts\repo\verificar_entorno.ps1` (desde la raíz del repo). **Qué el asistente no puede hacer por sí solo** (tokens, instalar Node, `/workspace`): [gestor_tu_espacio/PERMISOS_Y_LIMITES_ASISTENTE.md](gestor_tu_espacio/PERMISOS_Y_LIMITES_ASISTENTE.md).

### Subir a GitHub

Los scripts `.ps1` están en **`gestor_tu_espacio/scripts/repo/`** y usan la raíz del repositorio como directorio de trabajo (donde está el `.git`).

**Subir sin ventanas de login (recomendado, una vez):** crea un [Personal Access Token](https://github.com/settings/tokens) con permiso **repo**, luego:

```powershell
cd "ruta\a\Ejercicios practicos\gestor_tu_espacio\scripts\repo"
$env:GITHUB_TOKEN = "ghp_pega_aqui_el_token"
.\push_con_token.ps1
```

El remoto configurado por defecto es `kevinconejera803-debug/Sistema-` (ajusta el script si el repo tiene otro nombre).

**Actualizar un repo (URL genérica):**

```powershell
cd "ruta\a\Ejercicios practicos\gestor_tu_espacio\scripts\repo"
.\sync_github.ps1 https://github.com/TU_USUARIO/TU_REPO.git
```

Si `origin` ya existe: `.\sync_github.ps1` (solo `git push`).

**Opción automática** (repo nuevo con GitHub CLI `gh`):

```powershell
cd "ruta\a\Ejercicios practicos\gestor_tu_espacio\scripts\repo"
gh auth login
.\setup_github.ps1
```

Crea el repo público `ejercicios-practicos`, añade `origin` y hace `push`. Para otro nombre: `$env:GITHUB_REPO_NAME = "mi-nombre"; .\setup_github.ps1`

**Hook opcional** (intentar `git push` tras cada `git commit`), desde la raíz del repo:

```powershell
cd "ruta\a\Ejercicios practicos"
.\gestor_tu_espacio\scripts\install-git-hooks.ps1
```

**Opción manual:** crea un repositorio **vacío** en GitHub y enlázalo:

```powershell
cd "ruta\a\Ejercicios practicos"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### Error `CONNECT tunnel failed, response 403` (Cursor `/workspace`, Linux, CI)

Suele ser un **proxy** del entorno que intercepta `https://github.com` y devuelve 403 al método **CONNECT**. El repo incluye:

1. **`.vscode/settings.json`** — `http.noProxy` para GitHub y `proxySupport: fallback` (Cursor/VS Code).
2. **Scripts** (una vez por máquina o sesión antes de `git push`):
   - **Linux / `/workspace/Sistema-`:**  
     `source gestor_tu_espacio/scripts/repo/setup_git_cloud.sh`  
     luego `git push -u origin work`  
     o en un solo paso:  
     `chmod +x gestor_tu_espacio/scripts/repo/push_with_cloud_fix.sh`  
     `./gestor_tu_espacio/scripts/repo/push_with_cloud_fix.sh work`
   - **Windows (PowerShell):**  
     `. .\gestor_tu_espacio\scripts\repo\setup_git_cloud.ps1`  
     luego `git push -u origin work`

3. Si el push sigue sin credenciales: **`export GITHUB_TOKEN=ghp_...`** y `./gestor_tu_espacio/scripts/repo/push_con_token.sh` (Linux) o el `push_con_token.ps1` de siempre.

Vuelve a instalar el hook si lo usas: `.\gestor_tu_espacio\scripts\install-git-hooks.ps1` (el `post-commit` ya exporta `NO_PROXY` para GitHub).
