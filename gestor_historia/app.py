"""
Historia — Flask. App independiente (sin URLs ni imports de gestor_tu_espacio).
"""
import os

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    return render_template(
        "historia.html",
        port=os.environ.get("FLASK_PORT", "5001"),
    )


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5001"))
    host = os.environ.get("FLASK_HOST", "127.0.0.1")
    app.run(host=host, port=port, debug=True)
