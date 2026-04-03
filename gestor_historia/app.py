"""
Historia — Flask: segunda app del repo (junto a gestor_tu_espacio).
"""
import os

from flask import Flask, render_template

app = Flask(__name__)


def _tu_espacio_url():
    base = os.environ.get("TU_ESPACIO_URL", "http://127.0.0.1:5000").strip().rstrip("/")
    return base + "/tu-espacio"


@app.route("/")
def index():
    return render_template(
        "historia.html",
        port=os.environ.get("FLASK_PORT", "5001"),
        tu_espacio_href=_tu_espacio_url(),
    )


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5001"))
    host = os.environ.get("FLASK_HOST", "127.0.0.1")
    app.run(host=host, port=port, debug=True)
