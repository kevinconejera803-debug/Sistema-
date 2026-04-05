# Tu espacio (`gestor_tu_espacio`)

Panel principal del repositorio (SYSTEM INTERFACE). Puerto típico **5000**, base **`tu_espacio.db`**.

---

## Cómo entrar

### Entrar al entorno virtual

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd "$REPO\gestor_tu_espacio"
.\.venv\Scripts\Activate.ps1
```

### Primera vez (crear `.venv` e instalar)

```powershell
$REPO = "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos"
cd "$REPO\gestor_tu_espacio"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Arrancar la app

```powershell
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio"
.\.venv\Scripts\Activate.ps1
python run.py
```

O con variables de entorno:

```powershell
$env:FLASK_PORT = "5000"
$env:FLASK_DEBUG = "1"
python run.py
```

### Abrir en el navegador

**http://127.0.0.1:5000/tu-espacio**

La raíz **http://127.0.0.1:5000/** redirige a `/tu-espacio`. Para parar: **Ctrl+C**.

---

## Módulos

| Sección | URL |
|---------|-----|
| Panel principal | `/tu-espacio` |
| Calendario | `/calendario` |
| Universidad | `/universidad` |
| Contactos | `/contactos` |
| Mercados | `/mercados` |
| Noticias | `/noticias` |
| Investigación | `/investigacion` |
| Ciberseguridad | `/ciberseguridad` |

---

## Estructura

```
gestor_tu_espacio/
├── app/
│   ├── __init__.py       (Flask app + cache)
│   ├── config.py         (logging, constantes)
│   ├── database.py       (SQLAlchemy models)
│   ├── utils.py          (validaciones)
│   ├── blueprints/       (rutas API)
│   │   ├── calendar.py
│   │   ├── contacts.py
│   │   ├── core.py
│   │   ├── markets.py
│   │   ├── news.py
│   │   ├── research.py
│   │   └── university.py
│   ├── services/         (lógica externa)
│   │   ├── news_service.py
│   │   └── markets_service.py
│   ├── templates/
│   └── static/
├── run.py                (entry point)
├── tests/
│   └── test_app.py
├── requirements.txt
└── tu_espacio.db
```

---

## Tests

```powershell
.\.venv\Scripts\Activate.ps1
python -m pytest tests/test_app.py -v
```

---

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/calendar/events` | Lista eventos |
| POST | `/api/calendar/events` | Crea evento |
| GET | `/api/contacts` | Lista contactos |
| POST | `/api/contacts` | Crea contacto |
| GET | `/api/assignments` | Lista tareas |
| POST | `/api/assignments` | Crea tarea |
| GET | `/api/news` | Noticias RSS |
| GET | `/api/mercados` | Cotizaciones markets |

---

*Guía actualizada: abril 2026.*
