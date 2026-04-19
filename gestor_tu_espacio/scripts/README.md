# Scripts

Scripts versionados para mantener la raiz limpia y el workspace estable.

## Calidad

- `scripts/quality/validate_layout.py`
  Valida que el workspace root y el project root no acumulen archivos o carpetas no permitidos.

## Mantenimiento

- `scripts/maintenance/Clean-Workspace.ps1`
  Limpia caches, logs y artefactos temporales seguros sin tocar dependencias ni la base de datos local.

## Politicas

- `config/tooling/workspace-layout.json`
- `gestor_tu_espacio/config/tooling/project-layout.json`

Estas politicas son la fuente de verdad para la validacion de layout.
