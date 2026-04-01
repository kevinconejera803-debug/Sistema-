# Ejercicios prácticos — apps Flask separadas

Dos aplicaciones **independientes**: cada una con su **venv**, su **`requirements.txt`** y su **base de datos**.

| Carpeta | Puerto típico | Documentación dentro de la carpeta |
|---------|---------------|-------------------------------------|
| [`gestor_tu_espacio/`](gestor_tu_espacio/) | **5000** | [README](gestor_tu_espacio/README.md) · **[GUIA](gestor_tu_espacio/GUIA.md)** |
| [`gestor_historia/`](gestor_historia/) | **5001** | [README](gestor_historia/README.md) · **[GUIA](gestor_historia/GUIA.md)** |

## Estructura y limpieza

**[ESTRUCTURA.md](ESTRUCTURA.md)** — árbol de carpetas, reglas de orden y uso de `scripts/limpiar_templates_muertos.py` en cada app.

## Guía del repositorio (Git, ambas apps)

**[GUIA_DESARROLLO.md](GUIA_DESARROLLO.md)** — commits, `.gitignore`, cómo conviven las dos apps; **no** sustituye a las guías de cada carpeta.

## Resumen rápido

Los comandos detallados (PowerShell, CMD, Bash) están **solo** en:

- **Tu espacio:** [gestor_tu_espacio/GUIA.md](gestor_tu_espacio/GUIA.md)  
- **Historia:** [gestor_historia/GUIA.md](gestor_historia/GUIA.md)

## Monolito antiguo

`gestor_tareas` ya no se usa. Si queda alguna carpeta bloqueada, cierra Python y ejecuta `eliminar_gestor_tareas_restante.ps1` en esta raíz.
