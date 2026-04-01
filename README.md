# Ejercicios prácticos — apps Flask separadas

Este directorio agrupa **dos aplicaciones independientes**. Cada una tiene su **propio entorno virtual (venv)** y su **base de datos**; no compiten por el mismo Python ni por el mismo SQLite.

| Carpeta | Puerto típico | Qué es |
|---------|---------------|--------|
| [`gestor_tu_espacio/`](gestor_tu_espacio/) | **5000** | Tu espacio, calendario, **Trading Lab**, tareas, hábitos, etc. |
| [`gestor_historia/`](gestor_historia/) | **5001** | Simulador del núcleo (Historia / desarrollo, Nexo, tienda narrativa, etc.) |

## Guía principal (léela primero)

**[GUIA_DESARROLLO.md](GUIA_DESARROLLO.md)** — cómo entrar a cada venv, instalar dependencias, arrancar cada app, puertos, variables de entorno y flujo con Git.

## Arranque rápido (PowerShell)

**Tu espacio** (desde la carpeta del proyecto):

```powershell
cd ruta\a\Ejercicios practicos\gestor_tu_espacio
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Abre `http://127.0.0.1:5000/`.

**Historia** (en **otra terminal**, para no mezclar venvs):

```powershell
cd ruta\a\Ejercicios practicos\gestor_historia
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Abre `http://127.0.0.1:5001/` (o el puerto que indique la consola).

## Monolito antiguo

La carpeta `gestor_tareas` ya no se usa. Si aún aparece (por ejemplo solo con un `venv` bloqueado), cierra procesos Python y bórrala o ejecuta `eliminar_gestor_tareas_restante.ps1`.

## Repositorio Git

La raíz de este árbol tiene su propio `.gitignore` (no sube `venv/`, `.venv/`, `*.db`, `uploads/`, etc.). Los commits conviene hacerlos desde esta carpeta para versionar ambas apps juntas.
