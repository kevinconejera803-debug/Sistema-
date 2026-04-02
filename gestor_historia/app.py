"""
Historia — entrada Flask (mínima). Sustituye o amplía según tu proyecto.
"""
import os

from flask import Flask, render_template_string

app = Flask(__name__)


PAGE = """
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Historia</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
    code { background: #f0f0f0; padding: 0.15rem 0.4rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Historia</h1>
  <p>La app está corriendo. Puerto: <strong>{{ port }}</strong></p>
  <p>Si ves esto, Python y el venv funcionan. Puedes desarrollar aquí con normalidad.</p>
</body>
</html>
"""


@app.route("/")
def index():
    port = os.environ.get("FLASK_PORT", "5001")
    return render_template_string(PAGE, port=port)


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5001"))
    app.run(host=os.environ.get("FLASK_HOST", "127.0.0.1"), port=port, debug=True)
