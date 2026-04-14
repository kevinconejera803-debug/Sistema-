# Tu Espacio

Aplicacion full stack con backend Flask, frontend React + Vite y persistencia SQLite via SQLAlchemy.

## Stack

- Backend: Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-Limiter
- Frontend: React 19, React Router, Vite, TypeScript
- Base de datos: SQLite por defecto, con ruta configurable y opcion de `DATABASE_URL`
- Asistente: respuestas locales basadas en calendario, tareas, noticias, mercados e historial

## Estructura

```text
gestor_tu_espacio/
|-- backend/
|   |-- app/
|   |   |-- config/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- static/
|   |   |-- validation/
|   |   |-- errors.py
|   |   |-- extensions.py
|   |   |-- factory.py
|   |   `-- http.py
|   |-- instance/
|   |-- tests/
|   |-- requirements.txt
|   `-- run.py
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- styles/
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   |-- navigation.ts
|   |   `-- types.ts
|   |-- index.html
|   |-- package.json
|   |-- tsconfig.json
|   `-- vite.config.ts
|-- .github/
|-- AGENTS.md
|-- Dockerfile
`-- README.md
```

## Backend

1. Crear entorno virtual e instalar dependencias:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Ejecutar el servidor:

```bash
python run.py
```

Backend por defecto:

- URL: `http://localhost:5000`
- Base de datos: `backend/instance/tu_espacio.db`

Variables utiles:

- `TU_ESPACIO_DB_PATH`
- `DATABASE_URL`
- `TU_ESPACIO_SEED_DEMO`

## Frontend

1. Instalar dependencias:

```bash
cd frontend
npm install
```

2. Levantar Vite en desarrollo:

```bash
npm run dev
```

3. Generar build integrado con Flask:

```bash
npm run build
```

El build se publica en `backend/app/static/landing/`, que es el directorio que Flask sirve para las rutas SPA.

## Tests

Backend:

```bash
cd backend
pytest tests/test_app.py -q
```

Frontend:

```bash
cd frontend
npm run ci
```

## Endpoints principales

- `GET /api/health`
- `GET /api/stats`
- `GET /api/calendar/events`
- `POST /api/calendar/events`
- `GET /api/contacts`
- `POST /api/contacts`
- `GET /api/assignments`
- `POST /api/assignments`
- `GET /api/news`
- `GET /api/mercados`
- `POST /api/research/ask`

## Decisiones de arquitectura

- Flask usa app factory (`backend/app/factory.py`) para facilitar testing y despliegue.
- La configuracion se centraliza en `backend/app/config/`.
- SQLAlchemy se mantiene como ORM y punto de evolucion natural si mas adelante se migra a PostgreSQL.
- Las rutas HTTP delegan a servicios de dominio para evitar logica de negocio en los endpoints.
- El asistente ahora usa reglas locales y datos existentes del sistema en lugar de proveedores IA externos.
- React se organiza en `components/`, `pages/` y `services/` para separar UI, navegacion y llamadas API.

## Estado actual

- Backend cubierto por pruebas de endpoints y validaciones.
- Frontend compilando con Vite hacia el directorio servido por Flask.
- CI ejecuta tests de backend y checks completos de frontend.
