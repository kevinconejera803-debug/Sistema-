# Project Review: Tu Espacio

## Executive Summary

The project has a good base: modular Flask app factory, clear React/Vite separation, useful backend tests, basic frontend tests, and CI that already checks both stacks.

The biggest risks are not flashy bugs. They are structural:

- the repo is still mid-reorganization
- runtime, generated, and source concerns are still mixed together
- the domain model stores dates and flags too loosely
- the assistant layer still carries mental baggage from the old provider-based AI design

This means the app is workable today, but maintainability and agent productivity will degrade fast if the reorganization is not finished cleanly.

## Critical Findings

### High

1. Repo state and source-of-truth drift

- Git currently shows a move from legacy files into `config/`, `docs/`, and `infra/`, but the migration is not fully landed yet.
- Risk: humans and coding agents can recreate deleted files, edit stale paths, or review the wrong source of truth.
- Best next move: finish the reorganization in one focused cleanup pass and keep `CLAUDE.md` plus `.claude/` aligned with the new layout.

2. Temporal data is modeled as strings and filtered in Python

- `backend/app/models/entities.py` stores `start_iso`, `due_iso`, and `timestamp` as strings, and `all_day` as an integer.
- `backend/app/services/calendar_service.py` and `backend/app/services/university_service.py` load ordered rows and then parse/filter in Python.
- Risk: timezone edge cases, inconsistent sorting semantics, and poor scalability once row counts grow.
- Best next move: migrate to proper `DateTime(timezone=True)` and `Boolean` fields, then move filtering into SQL queries with indexes.

3. Assistant flow does duplicate data work and still reflects the old AI-provider era

- `backend/app/services/assistant_service.py` calls `fetch_external_data()` and then refetches news or markets again when building the final answer.
- `backend/app/routes/research.py` already returns `410` for removed provider endpoints, so the product direction is local/system responses, but the codebase still reflects the previous provider mental model.
- Risk: wasted network calls, confusing maintenance, and harder future evolution.
- Best next move: unify the assistant contract around one local pipeline, reuse fetched data, and remove dead provider-era remnants once the migration is complete.

### Medium

4. Runtime and generated artifacts need a firmer policy

- The frontend build publishes into `backend/app/static/landing/`.
- Local DB, logs, and virtualenvs live inside the project tree.
- This can be practical, but it must stay deliberate. Otherwise reviews become noisy and agents waste time on artifacts.
- Best next move: keep the current flow, but document it clearly and enforce ignore/build rules consistently.

5. Backend transaction error handling should be hardened

- `backend/app/services/chat_service.py` logs DB write failures, but it does not roll back the SQLAlchemy session after an exception.
- Risk: one failed write can poison the session for later operations in the same app context.
- Best next move: add `db.session.rollback()` in failure paths for persistence helpers.

6. Frontend coverage is still thin compared with the amount of UI surface

- Tests currently cover navigation, home, calendar, and assistant, but large parts of the UI remain unverified.
- Risk: regressions in contacts, assignments, markets, and news pages can slip through even when CI stays green.
- Best next move: add page-level interaction tests for the remaining CRUD flows and a few contract tests around API payload shapes.

7. External data reliability is fragile

- The news service depends on third-party RSS feeds, and some URLs are plain HTTP.
- Markets depend on live yfinance calls plus retry logic.
- Risk: noisy failures, inconsistent freshness, and avoidable integrity problems.
- Best next move: move all feeds to HTTPS where available, centralize fallback policy, and add smoke tests around response formatting.

## Very Good Improvements To Prioritize

1. Finish the repo reorganization as a dedicated cleanup change.

- Land the new paths as the only source of truth.
- Remove ambiguity between deleted legacy files and their replacements.

2. Strongly type the domain model.

- Use real datetimes and booleans.
- Push date filtering into SQL.
- Keep API serialization explicit.

3. Refactor the assistant into a single local orchestration layer.

- One entrypoint for intent detection, context lookup, external data fetch, response generation, and history persistence.
- Reuse fetched data instead of calling external services twice.

4. Add an operational quality layer.

- Ruff or another linter for Python.
- Formatting rules for TS/TSX and Python.
- Pre-commit hooks for tests, formatting, and accidental artifact changes.

5. Expand frontend regression coverage.

- CRUD flow tests for contacts and assignments.
- Error-state and empty-state tests for data pages.
- One smoke test that validates the SPA shell against the built backend static output.

## Claude Readiness

The project is now much more ready for Claude than before because the repo has:

- a root `CLAUDE.md` with workspace and project guardrails
- project skills under `.claude/skills/`
- project subagents under `.claude/agents/`

The most important rule for Claude in this repo is simple:

- respect the new canonical paths
- avoid reviving legacy files by accident
- treat generated assets as generated assets

## Verification Snapshot

Verified locally in this workspace:

- backend: `41 passed`
- frontend: `npm run ci` passed, including build output

Note:

- In the sandboxed environment, backend tests first failed on temp-directory permissions and frontend checks first failed with `spawn EPERM` from `esbuild`. Both passed when rerun outside the sandbox, so those failures were environmental, not product regressions.
