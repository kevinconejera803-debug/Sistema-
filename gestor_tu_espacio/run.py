import os
from app import app

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", "5000"))
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    print(f"Ejecutando servidor desde Factory (Run.py): {host}:{port}")
    app.run(host=host, port=port, debug=bool(os.environ.get("FLASK_DEBUG", "")))
