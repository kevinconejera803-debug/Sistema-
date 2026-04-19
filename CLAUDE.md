# Claude Workspace Guide

This repository is a workspace. The main product lives in `gestor_tu_espacio/`.

## Current State

- The repo is mid-reorganization. Prefer the new canonical locations:
  - old root `.gitignore` -> `config/git/ignore`
  - old root `.gitattributes` -> `config/git/attributes`
  - old root `README.md` -> `docs/workspace/README.md`
  - old project `gestor_tu_espacio/README.md` -> `gestor_tu_espacio/docs/README.md`
  - old project `gestor_tu_espacio/AGENTS.md` -> `gestor_tu_espacio/docs/AGENTS.md`
  - old project `gestor_tu_espacio/Dockerfile` and `.dockerignore` -> `gestor_tu_espacio/infra/docker/`
  - old project `gestor_tu_espacio/kilo.json` -> `gestor_tu_espacio/config/kilo/kilo.json`
- Do not casually recreate the moved legacy files while the reorganization is still being landed.
- Do not hand-edit generated frontend build assets in `gestor_tu_espacio/backend/app/static/landing/assets/`.

## Main Project Layout

- App root: `gestor_tu_espacio/`
- Backend: `gestor_tu_espacio/backend`
- Frontend: `gestor_tu_espacio/frontend`
- Product docs: `gestor_tu_espacio/docs`
- Infra: `gestor_tu_espacio/infra/docker`
- Scripts: `scripts/`
- Local runtime artifacts: `gestor_tu_espacio/logs`, `gestor_tu_espacio/backend/instance`, `gestor_tu_espacio/.venv`

## Root Policy

- Root files are intentionally restricted.
- Allowed workspace-root files are defined in `config/tooling/workspace-layout.json`.
- Allowed project-root files are defined in `gestor_tu_espacio/config/tooling/project-layout.json`.
- Validate with `python scripts/quality/validate_layout.py`.
- Clean safe caches and logs with `powershell -ExecutionPolicy Bypass -File scripts/maintenance/Clean-Workspace.ps1`.

## Preferred Workflow

1. Read `docs/workspace/README.md` and `gestor_tu_espacio/docs/README.md` before making structural changes.
2. Keep Flask routes thin and move business logic into services.
3. When frontend contracts change, update `frontend/src/types.ts`, the relevant `services/` file, the page, and its tests together.
4. If `npm run build` runs, expect changes under `gestor_tu_espacio/backend/app/static/landing/`.
5. Verify with:
   - `pytest -q` in `gestor_tu_espacio/backend`
   - `npm run ci` in `gestor_tu_espacio/frontend`
6. On Windows in sandboxed environments, backend tests may fail on temp-dir permissions and frontend checks may fail when Vite/Vitest tries to spawn `esbuild`. Treat those as environment issues until rerun outside the sandbox confirms otherwise.

## Review Priorities

1. Bugs and behavioral regressions
2. Repo hygiene and moved-file consistency
3. Time/date handling and query scalability
4. Assistant correctness and duplicated data fetching
5. Test coverage, linting, and docs drift

## Custom Claude Assets

- Skills: `.claude/skills/`
- Subagents: `.claude/agents/`
- Project audit: `gestor_tu_espacio/docs/PROJECT_REVIEW.md`
