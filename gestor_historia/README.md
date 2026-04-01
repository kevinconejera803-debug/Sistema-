# Historia / desarrollo — aplicación independiente

Simulador del núcleo (hub de módulos narrativos: Nexo, Quests, NEXUS CORE, Estado, Inventario, Asistente, Tienda). **No** incluye Trading Lab ni calendario de productividad.

## Entorno virtual (primera vez)

```powershell
cd "ruta\a\Ejercicios practicos\gestor_historia"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Cómo entrar al venv (cada sesión)

```powershell
cd "ruta\a\Ejercicios practicos\gestor_historia"
.\.venv\Scripts\Activate.ps1
```

Debes ver el prefijo `(.venv)` en la terminal. Para salir: `deactivate`.

## Ejecutar

```powershell
python app.py
```

Puerto por defecto habitual: **5001** (variable `FLASK_PORT`). Navegador: `http://127.0.0.1:5001/`.

## Base de datos

Archivo **`historia.db`** en esta carpeta (no se comparte con Tu espacio).

## Guía general y tutoriales

Instrucciones detalladas (dos terminales, Git, solución de problemas): **[../GUIA_DESARROLLO.md](../GUIA_DESARROLLO.md)**.

El código principal está en **`app.py`** de esta carpeta.
