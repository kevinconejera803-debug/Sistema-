"""Servidor de desarrollo para el backend Flask."""

from app import create_app
from app.config import logger

app = create_app()


if __name__ == "__main__":
    host = app.config["FLASK_HOST"]
    port = app.config["FLASK_PORT"]
    debug = app.config["FLASK_DEBUG"]
    logger.info("Iniciando backend en %s:%s", host, port)
    app.run(host=host, port=port, debug=debug)
