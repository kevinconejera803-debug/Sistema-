# Guía — Tu espacio (`gestor_tu_espacio`)

Todo lo de esta guía aplica **solo a esta carpeta**. Puerto típico: **5000**. Base de datos: **`tu_espacio.db`**. Incluye calendario, **Trading Lab**, tareas, hábitos, etc.

---

## 1. Requisitos

- **Python 3.10+**

Comprobar versión (PowerShell):

```powershell
python --version
```

---

## 2. Crear el entorno virtual (solo la primera vez)

Ejecuta desde **esta carpeta** (`gestor_tu_espacio`).

### PowerShell

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio"
python -m venv .venv
```

### CMD

```cmd
cd /d C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio
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
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio"
.\.venv\Scripts\Activate.ps1
```

Debes ver el prefijo `(.venv)`.

### CMD

```cmd
cd /d C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio
.venv\Scripts\activate.bat
```

### Git Bash

```bash
cd "/c/Users/kevin/.cursor/Kevin/Ejercicios practicos/gestor_tu_espacio"
source .venv/Scripts/activate
```

### Salir del venv

```powershell
deactivate
```

---

## 4. Instalar dependencias

Con el venv **activado**:

### PowerShell

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

`requirements.txt` puede incluir paquetes extra (por ejemplo **yfinance**) para Trading Lab; **solo se instalan en este venv**, no en Historia.

---

## 5. Ejecutar la aplicación Flask

### PowerShell (típico)

```powershell
python app.py
```

### PowerShell (puerto explícito)

```powershell
$env:FLASK_PORT = "5000"
python app.py
```

### CMD

```cmd
set FLASK_PORT=5000
python app.py
```

Navegador: **http://127.0.0.1:5000/**

---

## 6. Enlace a la app Historia (otro proceso)

Si tienes **Historia** corriendo en el puerto **5001**, puedes definir la URL base para enlaces del menú (nombre exacto según tu `app.py`; suele ser `HISTORIA_APP_URL`):

### PowerShell (solo esta sesión)

```powershell
$env:HISTORIA_APP_URL = "http://127.0.0.1:5001"
python app.py
```

### Archivo `.env` (texto)

```ini
HISTORIA_APP_URL=http://127.0.0.1:5001
FLASK_PORT=5000
```

---

## 7. Estructura relevante del proyecto (esta app)

| Ruta | Uso |
|------|-----|
| `app.py` | Entrada Flask: Tu espacio, calendario, trading, etc. |
| `database.py` | SQLite (`tu_espacio.db`) |
| `trading_lab/` | Módulo Trading Lab |
| `templates/` | HTML Jinja |
| `static/` | CSS, JS |
| `requirements.txt` | Dependencias pip de **Tu espacio** |

---

## 8. Base de datos

- Archivo: **`tu_espacio.db`** (en esta carpeta).
- **Backup:** cierra la app y copia el archivo.
- No comparte archivo con `gestor_historia`.

---

## 9. Dos apps a la vez (Tu espacio + Historia)

1. **Terminal A** — activa venv de **esta** carpeta → `python app.py` (puerto 5000).
2. **Terminal B** — activa venv de `gestor_historia` → `python app.py` (puerto 5001).

No actives los dos venv en la misma terminal; usa una ventana por proyecto.

---

## 10. Problemas frecuentes (Tu espacio)

| Problema | Acción |
|----------|--------|
| Trading Lab sin datos / errores de red | Revisa firewall y que `yfinance` esté instalado en **este** venv. |
| Puerto 5000 ocupado | `$env:FLASK_PORT = "5002"` (o el que quieras). |
| Enlaces a Historia rotos | Arranca Historia y revisa `HISTORIA_APP_URL`. |

---

## 11. Limpieza de plantillas obsoletas

Con `app.py` y `templates/` en esta carpeta:

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio"
python scripts/limpiar_templates_muertos.py
```

Tras revisar:

```powershell
python scripts/limpiar_templates_muertos.py --apply
```

Ver [../ESTRUCTURA.md](../ESTRUCTURA.md).

---

## 12. Más ayuda en el repo

- Resumen: [README.md](README.md)
- Historia (otra app): [../gestor_historia/GUIA.md](../gestor_historia/GUIA.md)
- Git en la raíz del repo: [../GUIA_DESARROLLO.md](../GUIA_DESARROLLO.md)

