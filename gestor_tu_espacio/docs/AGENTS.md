# Configuracion Operativa

Este documento vive en `docs/` para mantener la raiz del proyecto ordenada.

## Claude Code

La configuracion versionada para Claude Code vive en la raiz del repo:

- `../../CLAUDE.md`
- `../../.claude/skills/`
- `../../.claude/agents/`

### Skills preparados

- `tu-espacio-fullstack`: contexto, guardrails y convenciones del proyecto.
- `tu-espacio-review`: auditoria critica y readiness review.
- `release-check`: verificacion operativa antes del handoff.

### Subagentes preparados

- `tu-espacio-reviewer`: reviewer findings-first, read-only y centrado en riesgos reales.
- `tu-espacio-fullstack`: implementador para cambios full stack sin romper la reorganizacion.

## Kilo Code

La configuracion versionada de Kilo se encuentra en `config/kilo/kilo.json`.

## Politica de Raiz

La raiz del workspace y la raiz del proyecto tienen una allowlist explicita:

- Workspace: `../../config/tooling/workspace-layout.json`
- Proyecto: `../config/tooling/project-layout.json`

Validacion recomendada:

- `python ../../scripts/quality/validate_layout.py`
- `powershell -ExecutionPolicy Bypass -File ../../scripts/maintenance/Clean-Workspace.ps1`

## Comandos disponibles

### `/run` - Iniciar servidor
Ejecuta `python run.py` dentro del directorio `backend`.

### `/test` - Ejecutar tests
Ejecuta `pytest tests/ -v` dentro de `backend`.

### `/frontend` - Levantar Vite
Ejecuta `npm run dev` dentro de `frontend`.

### `/build` - Build del frontend
Ejecuta `npm run build` dentro de `frontend`.

### `/docker` - Build del contenedor
Ejecuta `docker build -f infra/docker/Dockerfile -t tu-espacio .` desde la raiz del proyecto.

### `/status` - Ver estado
Muestra `git status` y `git log --oneline -5`.

### `/lint` - Verificar codigo
Ejecuta `ruff check backend/app/` para revisar el backend.

### `/validate-root` - Verificar layout
Ejecuta `python ..\scripts\quality\validate_layout.py` desde el workspace.

### `/clean` - Limpiar artefactos
Ejecuta `powershell -ExecutionPolicy Bypass -File ..\scripts\maintenance\Clean-Workspace.ps1` desde el workspace.

## Agentes

### fullstack
Desarrollador full stack orientado a Flask, SQLAlchemy, React y TypeScript.

### debug
Especialista en debugging, verificacion con tests y aislamiento de regresiones.

### improve
Enfocado en arquitectura, performance, legibilidad y mejoras de mantenibilidad.
