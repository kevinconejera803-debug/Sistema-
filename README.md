# 🎯 Sistema

**Sistema de gestión personal con módulos funcionales y APIs REST.**

> Puerto 5000

---

## 📦 Proyectos

| Proyecto | Descripción |
|----------|-------------|
| [gestor_tu_espacio](./gestor_tu_espacio/) | Panel principal con módulos funcionales |

---

## 🚀 Quick Start - Gestor Tu Espacio

```powershell
cd gestor_tu_espacio
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

**Abrir:** http://127.0.0.1:5000/tu-espacio

---

## 📋 Módulos

| Módulo | Ruta |
|--------|------|
| Panel Principal | `/tu-espacio` |
| Calendario | `/calendario` |
| Universidad | `/universidad` |
| Contactos | `/contactos` |
| Mercados | `/mercados` |
| Noticias | `/noticias` |
| Investigación | `/investigacion` |
| Ciberseguridad | `/cibersecurity` |

---

## 🧪 Tests

```powershell
cd gestor_tu_espacio
.\.venv\Scripts\Activate.ps1
python -m pytest tests/test_app.py -v
```

**26 tests passing**

---

*Actualizado: Abril 2026*
