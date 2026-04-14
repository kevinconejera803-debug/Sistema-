"""Instrumentacion ligera para logs y tiempos de respuesta."""

from __future__ import annotations

from time import perf_counter

from flask import Flask, g, request

from app.config import logger


def init_observability(app: Flask) -> None:
    """Registra hooks simples de timing por request."""

    @app.before_request
    def _start_request_timer() -> None:
        g.request_started_at = perf_counter()

    @app.after_request
    def _append_request_metrics(response):
        started_at = getattr(g, "request_started_at", None)
        if started_at is None:
            return response

        duration_ms = (perf_counter() - started_at) * 1000
        response.headers["X-Request-Duration-Ms"] = f"{duration_ms:.2f}"
        logger.info(
            "%s %s -> %s en %.2fms",
            request.method,
            request.path,
            response.status_code,
            duration_ms,
        )
        return response
