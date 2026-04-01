# Historia / desarrollo — aplicación independiente

Simulador del núcleo (Nexo, Quests, NEXUS CORE, Estado, Inventario, Asistente, Tienda). **No** incluye Trading Lab ni calendario de productividad.

## Documentación en esta carpeta

| Archivo | Contenido |
|---------|-----------|
| **[GUIA.md](GUIA.md)** | Tutorial completo: venv, PowerShell / CMD / Bash, `pip`, `FLASK_PORT`, base de datos, estructura del proyecto |
| Este `README.md` | Resumen corto |

## Resumen (detalle en GUIA.md)

**Crear venv (primera vez)** — PowerShell:

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_historia"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Activar venv** — PowerShell:

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_historia"
.\.venv\Scripts\Activate.ps1
```

**Ejecutar** — PowerShell:

```powershell
$env:FLASK_PORT = "5001"
python app.py
```

- Base de datos: **`historia.db`** (solo esta app).  
- Código principal: **`app.py`**.

## Otra app del repo

Tu espacio (productividad + Trading Lab): [../gestor_tu_espacio/GUIA.md](../gestor_tu_espacio/GUIA.md)

Git y repo: [../GUIA_DESARROLLO.md](../GUIA_DESARROLLO.md)
