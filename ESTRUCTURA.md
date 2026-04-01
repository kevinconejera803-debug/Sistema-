# Estructura del repositorio

```
Ejercicios practicos/
├── README.md                 # Índice de las dos apps
├── GUIA_DESARROLLO.md       # Git y convivencia de proyectos
├── ESTRUCTURA.md            # Este archivo
├── .gitignore
├── eliminar_gestor_tareas_restante.ps1
├── gestor_tu_espacio/       # App Tu espacio (puerto ~5000)
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   ├── templates/
│   ├── static/
│   ├── trading_lab/
│   ├── scripts/
│   │   └── limpiar_templates_muertos.py
│   ├── README.md
│   └── GUIA.md
└── gestor_historia/         # App Historia / simulador (puerto ~5001)
    ├── app.py
    ├── database.py
    ├── requirements.txt
    ├── templates/
    ├── static/
    ├── data/
    ├── scripts/
    │   └── limpiar_templates_muertos.py
    ├── README.md
    └── GUIA.md
```

## Reglas de orden

1. **Nada de código compartido** entre carpetas: cada app es autocontenida.
2. **Un venv por carpeta** (`.venv` o `venv`), nunca mezclar dependencias de las dos apps.
3. **Bases de datos** solo en su carpeta (`tu_espacio.db` / `historia.db`).
4. **Plantillas muertas:** ejecutar el script de limpieza (ver abajo) antes de borrar a mano.

## Limpieza de plantillas obsoletas

Si copiaste archivos desde el monolito antiguo, puede haber HTML que **ninguna ruta** usa.

Desde **cada** carpeta de app (`gestor_historia` o `gestor_tu_espacio`), con `app.py` y `templates/` presentes:

```powershell
python scripts/limpiar_templates_muertos.py
```

Revisa la lista. Si es correcta:

```powershell
python scripts/limpiar_templates_muertos.py --apply
```

**Importante:** haz una copia de seguridad o commit Git antes de `--apply`.

## Caché del service worker (`static/sw.js`)

Si recortas plantillas o CSS, revisa la lista `STATIC_ASSETS` en `sw.js` y quita rutas que ya no existan para evitar errores en modo offline.
