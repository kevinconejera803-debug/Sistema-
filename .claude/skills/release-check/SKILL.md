---
name: release-check
description: Verify Tu Espacio changes before handoff by checking git state, backend tests, frontend checks, and generated asset hygiene.
disable-model-invocation: true
argument-hint: [optional-focus]
---

Use this skill before closing work on `gestor_tu_espacio/`.

Optional focus: $ARGUMENTS

## Verification Flow

1. Run `git status --short` from the repo root.
2. Run `pytest -q` in `gestor_tu_espacio/backend`.
3. Run `npm run ci` in `gestor_tu_espacio/frontend`.
4. If `backend/app/static/landing/` changed, confirm those changes came from a frontend build.
5. Confirm no moved legacy files were accidentally recreated.
6. Report environment-only permission issues separately from real code failures.

## Handoff Expectations

- Mention which checks passed.
- Mention which checks could not run and why.
- Mention whether generated build assets or runtime files changed.
