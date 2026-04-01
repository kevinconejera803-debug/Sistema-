# Tu espacio — aplicación independiente

Dashboard, calendario, **Trading Lab**, tareas, hábitos, universidad, correo, etc. **Sin** el simulador de Historia en el mismo proceso.

## Documentación en esta carpeta

| Archivo | Contenido |
|---------|-----------|
| **[GUIA.md](GUIA.md)** | Tutorial completo: venv, PowerShell / CMD / Bash, `pip`, `FLASK_PORT`, `HISTORIA_APP_URL`, Trading Lab, base de datos |
| Este `README.md` | Resumen corto |

## Requisitos

- Python 3.10+

## Resumen (detalle en GUIA.md)

**Crear venv (primera vez)** — PowerShell:

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Activar venv** — PowerShell:

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio"
.\.venv\Scripts\Activate.ps1
```

**Ejecutar** — PowerShell:

```powershell
python app.py
```

**Historia en otro puerto (opcional)** — PowerShell:

```powershell
$env:HISTORIA_APP_URL = "http://127.0.0.1:5001"
python app.py
```

- Base de datos: **`tu_espacio.db`**.  
- Código principal: **`app.py`**.

## Otra app del repo

Historia (simulador): [../gestor_historia/GUIA.md](../gestor_historia/GUIA.md)

Git y repo: [../GUIA_DESARROLLO.md](../GUIA_DESARROLLO.md)
