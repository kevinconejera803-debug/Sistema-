# 🏛️ Tu Espacio - Santuario Digital

<p align="center">
  <img src="https://img.shields.io/badge/Stack-Flask%20%2B%20React-blue?style=for-the-badge&logo=python&logoColor=white" alt="Stack">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Tests-44%2B%20passed-brightgreen?style=for-the-badge" alt="Tests">
</p>

Tu asistente personal privado con arquitectura **local-first**. Una aplicación full-stack que prioriza la privacidad, el control y la eficiencia, funcionando completamente en tu máquina sin dependencias externas de terceros.

## ✨ Características

- **🗓️ Calendario** - Gestión de eventos y agenda personal
- **🎓 Universidad** - Seguimiento de tareas y asignaciones académicas
- **👥 Contactos** - Red de contactos personal y profesional
- **📈 Mercados** - Widget de seguimiento de mercados financieros
- **📰 Noticias** - Feed de noticias curado
- **🤖 Asistente IA** - Chatbot con contexto local
- **🙏 Oraciones** - Registro personal de oraciones

## 🚀 Inicio Rápido

### Prerrequisitos

| Requisito | Versión mínima |
|-----------|---------------|
| Python | 3.12+ |
| Node.js | 20+ |
| npm | 10+ |

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/tu-espacio.git
cd tu-espacio

# 2. Configurar Backend
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt

# 3. Configurar Frontend (en otra terminal)
cd frontend
npm install
```

### Ejecución

```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend (desarrollo)
cd frontend
npm run dev
```

Accede a: **http://localhost:5000**

---

## 📦 Estructura del Proyecto

```
tu-espacio/
│
├── backend/                 # Aplicación Flask
│   ├── app/
│   │   ├── config/        # Configuración
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── routes/       # Blueprints HTTP
│   │   ├── services/    # Lógica de negocio
│   │   └── validation/  # Validación de payloads
│   ├── tests/            # 44 tests
│   ├── infra/           # Docker
│   └── run.py           # Entry point
│
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/      # PáginasSPA
│   │   ├── services/    # API client
│   │   └── styles/     # CSS tokens
│   ├── docs/            # Documentación
│   └── vite.config.ts   # Config Vite
│
├── config/               # Configuraciones globales
│   ├── kilo/           # Config Kilo CLI
│   └── tooling/        # Tooling settings
│
├── scripts/             # Scripts operativos
│   ├── maintenance/    # Mantenimiento
│   └── quality/        # Validación
│
└── .claude/            # Config AI agents
```

---

## 🔧 tech Stack

### Backend

| Dependencia | Propósito |
|------------|-----------|
| Flask | Web framework |
| SQLAlchemy | ORM |
| Flask-Limiter | Rate limiting |
| Flask-Migrate | Migraciones |
| pytest | Testing |

### Frontend

| Dependencia | Propósito |
|------------|-----------|
| React 19 | UI framework |
| React Router | Enrutamiento |
| TypeScript | Tipado estático |
| Vite | Build tool |
| Vitest | Testing |

---

## 🧪 Testing

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm test

# CI completo
cd backend && pytest
cd frontend && npm run ci
```

**Cobertura**: 44+ tests pasando

---

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/stats` | Métricas del sistema |
| `GET` | `/api/calendar/events` | Listar eventos |
| `POST` | `/api/calendar/events` | Crear evento |
| `GET` | `/api/contacts` | Listar contactos |
| `POST` | `/api/contacts` | Crear contacto |
| `GET` | `/api/assignments` | Listar tareas |
| `POST` | `/api/assignments` | Crear tarea |
| `GET` | `/api/news` | Noticias |
| `GET` | `/api/mercados` | Datos de mercados |
| `POST` | `/api/research/ask` | Chat con IA |
| `GET` | `/api/research/history` | Historial de chat |

---

## 🐳 Docker

```bash
# Build
docker build -t tu-espacio .

# Run
docker run -p 5000:5000 tu-espacio
```

---

## 🎨 Diseño - Santuario Digital

El proyecto usa un sistema de diseño personalizado "Santuario Digital":

- **Fondo**: `#020617` (Deep Space)
- **Acento**: `#38bdf8` (Cyan)
- **Tipografía**: Instrument Serif + Inter

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para decisiones de diseño.

---

## 🤖 Claude Code

El proyecto incluye configuración para Claude Code en `.claude/`:

### Skills Disponibles

| Skill | Propósito |
|-------|-----------|
| `tu-espacio-fullstack` | Desarrollador full stack |
| `tu-espacio-review` | Auditoría y review |
| `release-check` | Verificación pre-release |

### Subagentes

| Agente | Descripción |
|--------|-------------|
| `tu-espacio-reviewer` | Revisor centrado en riesgos |
| `tu-espacio-fullstack` | Implementador full stack |

### Comandos CLI

```bash
# /run - Iniciar servidor
# /test - Ejecutar tests
# /frontend - Levantar Vite
# /build - Build del frontend
# /docker - Build del contenedor
# /status - Ver estado git
# /lint - Verificar código
# /validate-root - Verificar layout
# /clean - Limpiar artefactos
```

---

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. commit tus cambios (`git commit -m 'Add una característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - Consulta [`LICENSE`](LICENSE) para detalles.

---

## 📚 Documentación Adicional

- [`docs/README.md`](docs/README.md) - Setup completo
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Decisiones de arquitectura
- [`docs/API.md`](docs/API.md) - Referencia completa de API
- [`docs/PROJECT_REVIEW.md`](docs/PROJECT_REVIEW.md) - Revisión del proyecto

---

<p align="center">
  <sub>Construido con ❤️ usando Flask + React</sub>
</p>