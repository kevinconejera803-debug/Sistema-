"""Registro central de blueprints."""


def register_blueprints(app) -> None:
    from app.routes.calendar import calendar_bp
    from app.routes.contacts import contacts_bp
    from app.routes.core import core_bp
    from app.routes.health import health_bp
    from app.routes.markets import markets_bp
    from app.routes.news import news_bp
    from app.routes.research import research_bp
    from app.routes.university import university_bp

    blueprints = [
        calendar_bp,
        contacts_bp,
        university_bp,
        news_bp,
        markets_bp,
        core_bp,
        research_bp,
        health_bp,
    ]

    for blueprint in blueprints:
        app.register_blueprint(blueprint)
