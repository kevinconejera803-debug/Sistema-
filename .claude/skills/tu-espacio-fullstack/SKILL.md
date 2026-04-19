---
name: tu-espacio-fullstack
description: Shared project context and guardrails for editing the Tu Espacio app during its repository reorganization.
when_to_use: Use automatically when working in `gestor_tu_espacio/backend`, `gestor_tu_espacio/frontend`, `gestor_tu_espacio/docs`, `gestor_tu_espacio/config`, or `gestor_tu_espacio/infra`.
user-invocable: false
paths:
  - gestor_tu_espacio/backend/**
  - gestor_tu_espacio/frontend/**
  - gestor_tu_espacio/docs/**
  - gestor_tu_espacio/config/**
  - gestor_tu_espacio/infra/**
---

Use this skill as standing guidance for the `gestor_tu_espacio/` application.

## Load This Reference When Needed

- For architecture, moved-file mapping, build behavior, and verification commands, read [reference.md](reference.md).

## Non-Negotiable Guardrails

1. Treat the repo as mid-reorganization. Prefer the new canonical paths documented in `CLAUDE.md` and [reference.md](reference.md).
2. Do not recreate deleted legacy files unless the user explicitly asks for that migration to be reversed.
3. Do not hand-edit generated frontend build files in `backend/app/static/landing/assets/`. If those files change, they should come from `npm run build`.
4. Keep route handlers thin. Push domain behavior into backend services.
5. When changing API behavior, update backend tests.
6. When changing frontend behavior, keep `types.ts`, the matching `services/` module, page component, and tests aligned.
7. Prefer low-risk changes that do not trample user work already in progress.

## Working Pattern

1. Confirm the source-of-truth path before editing.
2. Read the nearest backend service, frontend page, or docs file before proposing structure changes.
3. Implement the smallest coherent change that preserves the current architecture direction.
4. Verify with the project commands in [reference.md](reference.md).
5. In the final handoff, call out any generated assets, environment-only failures, or repo-hygiene concerns.
