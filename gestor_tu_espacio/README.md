# Tu Espacio - Santuario Digital

Tu asistente personal privado con arquitectura local-first.

## Inicio Rápido

```bash
# Backend
cd backend
python run.py

# Frontend (en otra terminal)
cd frontend
npm run dev
```

Accede a: **http://localhost:5000**

## Documentación

La documentación detallada vive en [`docs/`](docs/)

- [`docs/README.md`](docs/README.md) - Setup completo
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Decisiones de arquitectura  
- [`docs/API.md`](docs/API.md) - Referencia de endpoints

## Tech Stack

- **Backend**: Flask, SQLAlchemy, SQLite
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS custom (Santuario Digital theme)

## Tests

```bash
# Backend
cd backend && pytest

# Frontend  
cd frontend && npm test
```