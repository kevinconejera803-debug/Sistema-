# Guía de desarrollo — entornos virtuales y uso diario

Esta guía asume **Windows** y **PowerShell**. Si usas CMD o Git Bash, los equivalentes van al final.

---

## 1. Por qué dos carpetas y dos venv

- **`gestor_tu_espacio`**: productividad (calendario, trading, tareas…).
- **`gestor_historia`**: solo el simulador narrativo (Nexo, misiones, tienda del juego, etc.).

Cada app tiene su `requirements.txt` y su base de datos (por ejemplo `tu_espacio.db` y `historia.db`). **No mezcles** un solo venv para las dos: si instalas todo en un solo entorno, vuelves al problema del monolito (más pesado y más conflictos).

---

## 2. Crear el entorno virtual la primera vez

Haz esto **dentro de cada carpeta de proyecto** (`gestor_tu_espacio` y luego `gestor_historia`).

### PowerShell (recomendado)

```powershell
cd "C:\ruta\a\Ejercicios practicos\gestor_tu_espacio"
python -m venv .venv
```

Repite cambiando la carpeta por `gestor_historia`.

### Comprobar la versión de Python

```powershell
python --version
```

Conviene **Python 3.10+** (3.11 o 3.12 está bien).

### Si `Activate.ps1` da error de ejecución

En PowerShell **como administrador** (solo una vez):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 3. Entrar al entorno virtual (activar el venv)

Debes estar en la carpeta del proyecto correspondiente.

### PowerShell

**Tu espacio:**

```powershell
cd "C:\ruta\a\Ejercicios practicos\gestor_tu_espacio"
.\.venv\Scripts\Activate.ps1
```

Verás el prefijo `(.venv)` en la línea de comandos.

**Historia:**

```powershell
cd "C:\ruta\a\Ejercicios practicos\gestor_historia"
.\.venv\Scripts\Activate.ps1
```

### CMD (símbolo del sistema)

```cmd
cd /d C:\ruta\a\Ejercicios practicos\gestor_tu_espacio
.venv\Scripts\activate.bat
```

### Salir del venv (cualquier shell)

```powershell
deactivate
```

---

## 4. Instalar dependencias (con el venv activado)

Con **`(.venv)`** visible:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Hazlo **en Tu espacio** y **por separado en Historia** (cada uno con su venv activado en su carpeta).

---

## 5. Arrancar cada aplicación Flask

### Tu espacio — puerto 5000

Con venv activado en `gestor_tu_espacio`:

```powershell
python app.py
```

Por defecto suele usar `http://127.0.0.1:5000/`. Otro puerto:

```powershell
$env:FLASK_PORT = "5000"
python app.py
```

### Historia — puerto 5001

Con venv activado en `gestor_historia`:

```powershell
$env:FLASK_PORT = "5001"
python app.py
```

Si no defines nada, muchos proyectos usan 5001 en Historia para no chocar con Tu espacio.

### Dos apps a la vez

Abre **dos ventanas de terminal**:

1. Terminal A: activa venv de **Tu espacio** → `python app.py`.
2. Terminal B: activa venv de **Historia** → `python app.py`.

En el navegador: pestaña `localhost:5000` y pestaña `localhost:5001`.

---

## 6. Enlaces entre apps (opcional)

Si Tu espacio abre Historia en otra pestaña o enlace, suele usarse la URL base de Historia:

```powershell
# Solo en la terminal donde corres gestor_tu_espacio
$env:HISTORIA_APP_URL = "http://127.0.0.1:5001"
python app.py
```

Ajusta el README de `gestor_tu_espacio` si tu variable tiene otro nombre.

---

## 7. Base de datos y datos locales

- Cada app crea o usa su **`.db`** en su propia carpeta.
- No subas a Git los `.db` ni `uploads/` (ya están en `.gitignore` de la raíz).
- **Copia de seguridad:** cierra la app y copia el archivo `.db`.

---

## 8. Git en este directorio

Desde `Ejercicios practicos` (raíz):

```powershell
cd "C:\ruta\a\Ejercicios practicos"
git status
git add .
git commit -m "Describe el cambio en una frase"
```

Configurar tu nombre y correo (solo una vez en tu PC):

```powershell
git config --global user.name "Tu nombre"
git config --global user.email "tu@email.com"
```

O solo para este repositorio:

```powershell
git config user.name "Tu nombre"
git config user.email "tu@email.com"
```

---

## 9. Problemas frecuentes

| Síntoma | Qué probar |
|--------|------------|
| `pip` instala en otro Python | Confirma que ves `(.venv)` y que `where python` apunta a `.venv\Scripts\python.exe`. |
| Puerto en uso | Cambia `FLASK_PORT` o cierra la otra terminal que tenga Flask. |
| No carga un módulo | `pip install -r requirements.txt` en **esa** carpeta con el venv activado. |
| Error al activar `.ps1` | Política de ejecución (sección 2) o usa `activate.bat` en CMD. |

---

## 10. Referencia rápida CMD / Git Bash

**CMD — activar:**

```cmd
.venv\Scripts\activate.bat
```

**Git Bash:**

```bash
source .venv/Scripts/activate
```

---

## 11. Dónde está el código

- Lógica principal de cada app: **`app.py`** dentro de su carpeta.
- Plantillas: `templates/`. Estáticos: `static/`.
- Tests o scripts auxiliares: según cada proyecto (ver README de cada carpeta).

Para detalles solo de **Tu espacio** o solo de **Historia**, abre también:

- [`gestor_tu_espacio/README.md`](gestor_tu_espacio/README.md)
- [`gestor_historia/README.md`](gestor_historia/README.md)
