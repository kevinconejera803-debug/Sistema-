# Historia (`gestor_historia`)

Aplicación Flask independiente. Puerto típico **5001**, base **`historia.db`** cuando la uses en `database.py`.

**Repo, instalación y Git:** [README del repositorio](../README.md#repo) · [Entornos virtuales](../README.md#venv) · [Git](../README.md#git)

---

## Cómo entrar

Sustituye **`$REPO`** si tu carpeta del proyecto está en otro sitio.

### Entrar al entorno virtual (Historia)

Es el **`.venv` dentro de `gestor_historia`** (no el de Tu espacio). Tras activar verás **`(.venv)`**.

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd "$REPO\gestor_historia"
.\.venv\Scripts\Activate.ps1
```

### Primera vez (crear `.venv` e instalar)

Copia y pega en **PowerShell** (una sola vez por máquina):

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd "$REPO\gestor_historia"
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

### Arrancar la app (con el venv ya activo)

Usa **otra terminal** si ya tienes Tu espacio en marcha (cada app = su propio venv).

```powershell
$env:FLASK_PORT = "5001"
python app.py
```

O desde cero en un solo bloque:

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd "$REPO\gestor_historia"
.\.venv\Scripts\Activate.ps1
$env:FLASK_PORT = "5001"
python app.py
```

Si aún no creaste el `.venv`, ejecuta antes **Primera vez**.

### Abrir en el navegador

Pega esta URL:

**http://127.0.0.1:5001/**

Para parar el servidor: **Ctrl+C** en esa terminal.

---

No hay URLs ni dependencias hacia **gestor_tu_espacio** en el código: cada app es independiente.

## Estructura

| Ruta | Uso |
|------|-----|
| `app.py` | Flask, rutas |
| `database.py` | SQLite (cuando lo conectes) |
| `templates/historia.html` | Página principal |
| `static/css/historia.css` | Estilos |
| `scripts/` | Utilidades (p. ej. limpiar plantillas) |

## Limpieza de plantillas

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_historia"
.\.venv\Scripts\Activate.ps1
python scripts/limpiar_templates_muertos.py
```

Detalle: [README raíz — Mantenimiento](../README.md#maint).

## Otra app

**Tu espacio:** [../gestor_tu_espacio/README.md](../gestor_tu_espacio/README.md)
