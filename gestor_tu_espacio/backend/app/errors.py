"""Errores y manejadores globales."""

from __future__ import annotations

from http import HTTPStatus

from flask import jsonify, request
from werkzeug.exceptions import HTTPException

from app.config import logger


class ApiError(Exception):
    """Error controlado que se serializa como respuesta JSON."""

    def __init__(self, message: str, status_code: int = 400, payload: dict | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload or {}

    def to_dict(self) -> dict:
        data = {"error": self.message}
        data.update(self.payload)
        return data


def register_error_handlers(app) -> None:
    """Registra manejadores globales y consistentes."""

    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        logger.warning("API error en %s: %s", request.path, error.message)
        return jsonify(error.to_dict()), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_error(error: HTTPException):
        message = error.description or HTTPStatus(error.code).phrase
        logger.warning("HTTP error %s en %s", error.code, request.path)
        return jsonify({"error": message}), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error: Exception):
        logger.error("Excepcion no controlada en %s: %s", request.path, error, exc_info=True)
        return jsonify({"error": "error interno del servidor"}), 500
