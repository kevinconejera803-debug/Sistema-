---
name: tu-espacio-review
description: Run a critical audit of Tu Espacio focused on bugs, regressions, repo hygiene, architecture, performance, and Claude readiness.
argument-hint: [scope-or-path]
disable-model-invocation: true
context: fork
agent: tu-espacio-reviewer
---

Review scope: $ARGUMENTS

If no scope is provided, review the whole `gestor_tu_espacio/` application.

## Review Rubric

- Use [checklist.md](checklist.md) as the audit rubric.
- Treat `config/git/*`, `docs/workspace/README.md`, `gestor_tu_espacio/docs/*`, `gestor_tu_espacio/infra/docker/*`, and `gestor_tu_espacio/config/kilo/kilo.json` as the canonical replacements for the deleted legacy files.

## Output Requirements

1. Findings first, ordered by severity.
2. For each finding, include: risk, concrete path or area, why it matters, and the best next fix.
3. Separate confirmed problems from assumptions or follow-up questions.
4. Add a short improvement roadmap after the findings.
5. If commands or tests were run, state whether failures were real code problems or environment/sandbox issues.
