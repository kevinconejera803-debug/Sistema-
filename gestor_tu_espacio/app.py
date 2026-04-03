"""
Tu espacio — Flask: SYSTEM INTERFACE / dashboard principal.
"""
import os
from datetime import datetime

from flask import Flask, redirect, render_template, url_for

app = Flask(__name__)

_MONTHS_ES = (
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
)

def _historia_url():
    base = os.environ.get("HISTORIA_APP_URL", "http://127.0.0.1:5001").strip().rstrip("/")
    return base + "/"


def _tu_espacio_context():
    now = datetime.now()
    month_badge = f"{_MONTHS_ES[now.month - 1]} - {now.year}"
    h = _historia_url()
    access_cards = [
        {
            "title": "HISTORIA",
            "desc": "Segunda app del repositorio (Flask, puerto 5001)",
            "icon": "📜",
            "theme": "purple",
            "href": h,
        },
    ]
    return {
        "access_cards": access_cards,
        "month_badge": month_badge,
        "historia_href": h,
    }


@app.route("/")
def index():
    return redirect(url_for("tu_espacio"))


@app.route("/tu-espacio")
def tu_espacio():
    return render_template("tu_espacio.html", **_tu_espacio_context())


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    app.run(host=host, port=port, debug=True)
