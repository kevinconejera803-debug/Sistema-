# Tu Espacio Reference

## Workspace Shape

- Git root: `Ejercicios practicos/`
- Main app: `gestor_tu_espacio/`
- Workspace docs: `docs/workspace/README.md`
- Product docs: `gestor_tu_espacio/docs/README.md`

## Canonical Paths After The Reorganization

- Git ignore rules: `config/git/ignore`
- Git attributes: `config/git/attributes`
- Product docs: `gestor_tu_espacio/docs/`
- Docker files: `gestor_tu_espacio/infra/docker/`
- Kilo config: `gestor_tu_espacio/config/kilo/kilo.json`

If you notice deleted legacy files in `git status`, assume the locations above are the intended replacements unless the user says otherwise.

## Backend Conventions

- App factory: `gestor_tu_espacio/backend/app/factory.py`
- Route registration: `gestor_tu_espacio/backend/app/routes/__init__.py`
- Business logic: `gestor_tu_espacio/backend/app/services/`
- Validation: `gestor_tu_espacio/backend/app/validation/`
- Tests: `gestor_tu_espacio/backend/tests/`

Guidance:

- Keep routes focused on HTTP parsing, status codes, and calling services.
- Prefer service-level changes over adding route-level branching.
- Add or update backend tests when changing endpoint behavior, validation, or assistant responses.

## Frontend Conventions

- Shared types: `gestor_tu_espacio/frontend/src/types.ts`
- API clients: `gestor_tu_espacio/frontend/src/services/`
- Pages: `gestor_tu_espacio/frontend/src/pages/`
- Shared UI: `gestor_tu_espacio/frontend/src/components/`
- Async helpers: `gestor_tu_espacio/frontend/src/hooks/useAsyncData.ts`

Guidance:

- Keep page behavior and API service contracts synchronized.
- Update tests when changing visible behavior in `pages/`.
- Preserve the current Vite-to-Flask deployment flow unless the user explicitly wants it changed.

## Generated And Runtime Files

- Frontend build output: `gestor_tu_espacio/backend/app/static/landing/`
- Local DB: `gestor_tu_espacio/backend/instance/`
- Logs: `gestor_tu_espacio/logs/`
- Local virtual env: `gestor_tu_espacio/.venv/`

Do not treat these like normal source files unless the task specifically targets them.

## Verification Commands

- Backend: `pytest -q` in `gestor_tu_espacio/backend`
- Frontend: `npm run ci` in `gestor_tu_espacio/frontend`
- Repo status: `git status --short` from repo root

## Known Environment Caveat

On this Windows workspace, sandboxed runs may fail with:

- `pytest` temp-directory permission errors
- `vite` or `vitest` `spawn EPERM` when `esbuild` starts

If that happens, rerun outside the sandbox before treating it as a code regression.
