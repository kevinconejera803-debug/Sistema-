# Configuración de Kilo Code para el proyecto

## Comandos disponibles

### `/run` - Iniciar servidor
Ejecuta `python run.py` en el directorio gestor_tu_espacio.

### `/test` - Ejecutar tests
Ejecuta `pytest tests/ -v` para verificar que todo funcione.

### `/commit` - Commit y push
Hace `git add -A`, `git commit` y `git push` automáticamente.

### `/status` - Ver estado
Muestra `git status` y `git log --oneline -5`.

### `/lint` - Verificar código
Ejecuta `ruff check app/` para verificar linting.

## Agentes

### fullstack
Desarrollador fullstack especializado en Flask, SQLAlchemy, Jinja2, JavaScript vanilla.

### debug
Experto en debugging - analiza errores, propone soluciones y verifica con tests.

### improve
Analiza código existente y propone mejoras de performance, seguridad y mejores prácticas.

## Uso en VS Code

1. Instalar extensión "Kilo Code" (pre-release)
2. Abrir paleta de comandos: `Ctrl+Shift+P`
3. Escribir "Kilo" para ver comandos disponibles
4. O usar el panel lateral de Kilo

## Configuración de AI Provider

En la configuración de Kilo Code, elegir:
- **Gratis**: OpenRouter (incluye modelos gratuitos)
- **Con clave**: OpenAI, Anthropic, Google, etc.