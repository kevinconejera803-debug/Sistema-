"""Fixtures compartidos para tests."""

from __future__ import annotations

import pytest
from pathlib import Path

from app import create_app
from app.extensions import db


@pytest.fixture
def flask_app(tmp_path: Path):
    """Crea una app de Flask para testing."""
    database_uri = f"sqlite:///{tmp_path / 'test_tu_espacio.db'}"
    app = create_app(
        testing=True,
        config_overrides={
            "SQLALCHEMY_DATABASE_URI": database_uri,
            "SEED_DEMO": False,
        },
    )

    with app.app_context():
        db.drop_all()
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(flask_app):
    """Client de test para la app."""
    with flask_app.test_client() as test_client:
        yield test_client


@pytest.fixture
def app_context(flask_app):
    """Contexto de aplicación Flask."""
    with flask_app.app_context():
        yield flask_app