# Workspace

Repositorio de trabajo con una aplicacion principal dentro de `gestor_tu_espacio/`.

## Estructura

```text
Ejercicios practicos/
|-- config/
|   `-- git/
|       |-- attributes
|       `-- ignore
|-- docs/
|   `-- workspace/
|       `-- README.md
`-- gestor_tu_espacio/
```

## Convenciones

- Los archivos de soporte viven en carpetas dedicadas para mantener la raiz limpia.
- La configuracion versionada de Git se guarda en `config/git/`.
- La documentacion del producto se mantiene en `gestor_tu_espacio/docs/`.
- La raiz del workspace usa una allowlist estricta definida en `config/tooling/workspace-layout.json`.
- Los scripts operativos del workspace viven en `scripts/`.

## Proyecto principal

- Documentacion: `gestor_tu_espacio/docs/README.md`
- Docker: `gestor_tu_espacio/infra/docker/`
- Configuracion de Kilo: `gestor_tu_espacio/config/kilo/kilo.json`

## Claude Code

- La memoria del workspace para Claude vive en `CLAUDE.md`.
- Los skills versionados viven en `.claude/skills/`.
- Los subagentes versionados viven en `.claude/agents/`.
- Esta capa debe mantenerse alineada con la reorganizacion actual para no recrear archivos legacy por error.

## Operacion

- Validar layout: `python scripts/quality/validate_layout.py`
- Limpiar caches y logs seguros: `powershell -ExecutionPolicy Bypass -File scripts/maintenance/Clean-Workspace.ps1`
