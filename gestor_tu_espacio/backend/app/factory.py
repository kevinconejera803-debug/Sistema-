"""Factory principal de Flask."""

from __future__ import annotations

from flask import Flask

from app.config import get_config, logger
from app.errors import register_error_handlers
from app.extensions import init_extensions
from app.observability import init_observability
from app.routes import register_blueprints
from app.services.bootstrap_service import initialize_database


def create_app(testing: bool = False, config_overrides: dict | None = None) -> Flask:
    """Crea una aplicacion Flask lista para usarse."""
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config.from_object(get_config(testing=testing))

    if config_overrides:
        app.config.update(config_overrides)

    app.jinja_env.cache = None

    init_extensions(app)
    init_observability(app)
    register_blueprints(app)
    register_error_handlers(app)
    initialize_database(app)

    logger.info("Aplicacion inicializada con estructura modular")
    return app
