# 🎯 Tu Espacio

**Sistema de gestión personal integral con módulos funcionales, base de conocimiento y APIs REST.**

> Panel principal - Puerto 5000 - Uso local

[![Flask](https://img.shields.io/badge/Flask-3.0-blue?style=flat&logo=flask)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.14-green?style=flat&logo=python)](https://www.python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-orange?style=flat)](https://www.sqlalchemy.org/)
[![Tests](https://img.shields.io/badge/Tests-26%2F26-brightgreen)](tests/test_app.py)

---

## 🚀 Quick Start

```powershell
# Clonar y entrar
cd "C:\Users\kevin\.cursor\Kevin\Ejercicios practicos\gestor_tu_espacio"

# Crear entorno virtual
python -m venv .venv
.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
python run.py
```

**Abrir:** http://127.0.0.1:5000/tu-espacio

---

## 📋 Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| 🎯 Panel Principal | `/tu-espacio` | Acceso a todos los módulos |
| 📅 Calendario | `/calendario` | Eventos con SQLite |
| 🎓 Universidad | `/universidad` | Entregas y portal académico |
| 👥 Contactos | `/contactos` | CRM con filtro en vivo |
| 📊 Mercados | `/mercados` | Cotizaciones (yfinance) |
| 📰 Noticias | `/noticias` | RSS feeds económicos |
| 🔎 Investigación | `/investigacion` | Base de conocimiento 2025-2026 |
| 🛡️ Ciberseguridad | `/cibersecurity` | Checklist de seguridad |

---

## 🔎 Centro de Investigación

El módulo de investigación funciona **sin API externa**, usando una base de conocimiento local actualizada con información real:

### Temas cubiertos:
- 🇨🇱 **Chile** - Gobierno, elecciones 2025, economía, seguridad
- 🇦🇷 **Argentina** - Economía, gobierno Milei
- 🇧🇷 **Brasil** - Lula, economía
- 🇲🇽 **México** - Sheinbaum, nearshoring
- 🇪🇸 **España** - Política, economía
- 🇺🇸 **EE.UU.** - Biden, tecnología, inflación
- ⚔️ **Conflictos** - Ucranía, Gaza
- 🌡️ **Cambio climático** - COP29, metas 2050
- 💻 **Tecnología** - IA 2026, computación cuántica
- 🚀 **Espacio** - Artemis, Starship, Marte
- 🏥 **Salud** - Pandemia, obesidad, IA médica
- 📚 **Educación** - IA en aulas, formación continua
- 💼 **Trabajo** - IA replace, gig economy
- 🎬 **Cultura** - Cine, música, deportes 2026

### Búsqueda web:
Opcionalmente puede usar DuckDuckGo para encontrar fuentes adicionales.

---

## 🏗️ Estructura

```
gestor_tu_espacio/
├── app/
│   ├── __init__.py           # Flask app + cache TTL
│   ├── config.py             # Logging y constantes
│   ├── database.py           # Modelos SQLAlchemy
│   ├── utils.py              # Validaciones
│   ├── blueprints/           # Rutas API modulares
│   │   ├── calendar.py       # CRUD eventos
│   │   ├── contacts.py       # CRUD contactos
│   │   ├── university.py     # CRUD tareas
│   │   ├── news.py           # API noticias
│   │   ├── markets.py        # API mercados
│   │   ├── research.py       # API investigación
│   │   └── core.py           # Rutas principales
│   ├── services/             # Lógica de negocio
│   │   ├── knowledge_service.py  # Base de conocimiento
│   │   ├── search_service.py     # Búsqueda web
│   │   ├── news_service.py   # RSS feeds
│   │   └── markets_service.py# yfinance
│   ├── templates/            # Jinja2 templates
│   └── static/               # CSS + JS
├── run.py                    # Entry point
├── tests/
│   └── test_app.py           # 26 tests
├── requirements.txt
└── tu_espacio.db             # SQLite
```

---

## 🔌 API Endpoints

### Calendario
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/calendar/events` | Listar eventos |
| POST | `/api/calendar/events` | Crear evento |
| PUT | `/api/calendar/events/<id>` | Actualizar evento |
| DELETE | `/api/calendar/events/<id>` | Eliminar evento |

### Contactos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/contacts` | Listar contactos |
| POST | `/api/contacts` | Crear contacto |
| PUT | `/api/contacts/<id>` | Actualizar contacto |
| DELETE | `/api/contacts/<id>` | Eliminar contacto |

### Universidad
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/assignments` | Listar tareas |
| POST | `/api/assignments` | Crear tarea |
| PUT | `/api/assignments/<id>` | Actualizar tarea |
| DELETE | `/api/assignments/<id>` | Eliminar tarea |

### Investigación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ai/ask?q=...` | Pregunta a base de conocimiento |

### Externos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/news` | Noticias RSS (cache 90s) |
| GET | `/api/mercados` | Cotizaciones (cache 60s) |

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `FLASK_PORT` | `5000` | Puerto del servidor |
| `FLASK_DEBUG` | `0` | Modo debug (1/true/yes) |
| `FLASK_HOST` | `0.0.0.0` | Host binding |
| `TU_ESPACIO_DB_PATH` | `tu_espacio.db` | Ruta de la BD |
| `TU_ESPACIO_SEED_DEMO` | `1` | Cargar datos demo |
| `TU_ESPACIO_INTRANET_URL` | - | URL intranet |
| `TU_ESPACIO_AULA_URL` | - | URL aula virtual |

### Ejemplo .env

```bash
FLASK_DEBUG=1
FLASK_PORT=5000
TU_ESPACIO_SEED_DEMO=1
```

---

## 🧪 Tests

```powershell
.venv\Scripts\Activate.ps1
python -m pytest tests/test_app.py -v
```

**Resultado:** 26 tests passing

---

## 📦 Dependencias

- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **Flask-Migrate** - Migraciones
- **Flask-SQLAlchemy** - Integración Flask
- **python-dotenv** - Variables de entorno
- **feedparser** - RSS parsing
- **yfinance** - Datos financieros
- **beautifulsoup4** - Web scraping
- **pytest** - Testing

---

## 🔒 Seguridad

- Sin API keys externas requeridas
- Investigación funciona 100% offline
- Endpoints de ejecución de sistema eliminados
- Para uso local exclusivamente

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

*Actualizado: Abril 2026*