# Guía — Historia / desarrollo (`gestor_historia`)

Todo lo de esta guía aplica **solo a esta carpeta**. Puerto típico: **5001**. Base de datos: **`historia.db`**.

---

## 1. Requisitos

- **Python 3.10+** (recomendado 3.11 o 3.12).

Comprobar versión (PowerShell):

```powershell
python --version
```

---

## 2. Crear el entorno virtual (solo la primera vez)

Ejecuta desde **esta carpeta** (`gestor_historia`).

### PowerShell

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_historia"
python -m venv .venv
```

### CMD

```cmd
cd /d C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_historia
python -m venv .venv
```

Si `Activate.ps1` falla por política de ejecución (solo una vez, PowerShell):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 3. Activar el entorno virtual (cada vez que abres una terminal)

### PowerShell

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_historia"
.\.venv\Scripts\Activate.ps1
```

Debes ver el prefijo `(.venv)` al inicio de la línea.

### CMD

```cmd
cd /d C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_historia
.venv\Scripts\activate.bat
```

### Git Bash

```bash
cd "/c/Users/kevin/.cursor/Kevin/Ejercicios practicos/gestor_historia"
source .venv/Scripts/activate
```

### Salir del venv

```powershell
deactivate
```

---

## 4. Instalar dependencias

Con el venv **activado** (`(.venv)` visible):

### PowerShell

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Comprobar que `pip` usa el Python del venv:

```powershell
where.exe python
pip --version
```

---

## 5. Ejecutar la aplicación Flask

### PowerShell (puerto por defecto del proyecto, suele ser 5001)

```powershell
python app.py
```

### PowerShell (forzar puerto explícito)

```powershell
$env:FLASK_PORT = "5001"
python app.py
```

### CMD

```cmd
set FLASK_PORT=5001
python app.py
```

Navegador: **http://127.0.0.1:5001/** (o el puerto que muestre la consola).

---

## 6. Variables de entorno útiles (opcional)

Archivo **`.env`** en esta misma carpeta (no lo subas a Git si contiene secretos). Formato típico:

```ini
FLASK_PORT=5001
FLASK_HOST=0.0.0.0
```

Ejemplo solo en la sesión actual (PowerShell):

```powershell
$env:FLASK_PORT = "5001"
$env:FLASK_HOST = "127.0.0.1"
python app.py
```

---

## 7. Estructura relevante del proyecto (esta app)

| Ruta | Uso |
|------|-----|
| `app.py` | Entrada Flask: rutas del simulador |
| `database.py` | SQLite (`historia.db`) |
| `templates/` | HTML Jinja |
| `static/` | CSS, JS, imágenes |
| `requirements.txt` | Dependencias pip |
| `nucleo_game.py`, `nexus_core.py`, `game_shop.py`, … | Lógica del núcleo |

---

## 8. Base de datos

- Archivo: **`historia.db`** (en esta carpeta).
- **Backup:** cierra la app y copia el archivo.
- No comparte archivo con `gestor_tu_espacio`.

---

## 9. Problemas frecuentes (Historia)

| Problema | Acción |
|----------|--------|
| Puerto ocupado | Cambia `FLASK_PORT` o cierra la otra terminal Flask. |
| Módulo no encontrado | Activa este venv y ejecuta `pip install -r requirements.txt` aquí. |
| `python` no es el del venv | Usa `.\.venv\Scripts\python.exe app.py` desde esta carpeta. |

---

## 10. Limpieza de plantillas obsoletas

Si hubo copias desde el monolito, puede quedar HTML sin usar. Con `app.py` y `templates/` en esta carpeta:

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_historia"
python scripts/limpiar_templates_muertos.py
```

Revisa la lista; para borrar (tras commit/copia de seguridad):

```powershell
python scripts/limpiar_templates_muertos.py --apply
```

Detalle: [../ESTRUCTURA.md](../ESTRUCTURA.md).

---

## 11. Más ayuda en el repo

- Resumen: [README.md](README.md)
- Tu espacio (otra app): [../gestor_tu_espacio/GUIA.md](../gestor_tu_espacio/GUIA.md)
- Git y trabajo con las dos apps: [../GUIA_DESARROLLO.md](../GUIA_DESARROLLO.md)
