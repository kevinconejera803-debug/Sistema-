# Tu espacio — aplicación independiente

Consola personal: dashboard, calendario, **Trading Lab**, tareas, hábitos, universidad, correo, etc. **Sin** cargar el código pesado del simulador de Historia en el mismo proceso.

## Requisitos

- Python 3.10+

## Entorno virtual (primera vez)

```powershell
cd "ruta\a\Ejercicios practicos\gestor_tu_espacio"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Cómo entrar al venv (cada sesión)

```powershell
cd "ruta\a\Ejercicios practicos\gestor_tu_espacio"
.\.venv\Scripts\Activate.ps1
```

Debes ver el prefijo `(.venv)`. Para salir: `deactivate`.

## Ejecutar

```powershell
python app.py
```

Puerto típico: **5000** (`FLASK_PORT`). Navegador: `http://127.0.0.1:5000/`.

## Base de datos

**`tu_espacio.db`** en esta carpeta (no comparte archivo con Historia).

## Enlace a la app Historia (opcional)

Si Historia corre en otro puerto (por ejemplo 5001):

```powershell
$env:HISTORIA_APP_URL = "http://127.0.0.1:5001"
python app.py
```

## Guía general y tutoriales

Pasos detallados (activar venv, dos apps a la vez, Git): **[../GUIA_DESARROLLO.md](../GUIA_DESARROLLO.md)**.

El código principal está en **`app.py`** de esta carpeta.
