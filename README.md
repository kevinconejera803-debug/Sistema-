# 🎯 Sistema

**Sistema de gestión personal con módulos funcionales, IA local y APIs REST.**

> Puerto 5000

---

## 📦 Proyectos

| Proyecto | Descripción |
|----------|-------------|
| [gestor_tu_espacio](./gestor_tu_espacio/) | Panel principal con IA integrada |

---

## 🚀 Quick Start - Gestor Tu Espacio

```powershell
cd gestor_tu_espacio
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Instalar Ollama:** https://ollama.ai

```powershell
ollama serve
ollama pull llama3.1
python run.py
```

**Abrir:** http://127.0.0.1:5000

---

## ✨ Características

- 🤖 IA local (Ollama)
- 🧠 Memoria conversacional
- 🎯 Detección de intención
- ⚡ Recomendaciones proactivas

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
| **Asistente IA** | `/asistente` |

---

## 🔌 Endpoints IA

| Endpoint | Método | Descripción |
|---------|--------|-------------|
| `/api/research/ask` | POST | Chat con IA |
| `/api/assistant/insights` | GET | Sugerencias proactivas |
| `/api/news/summary` | GET | Resumen de noticias |
| `/api/markets/analysis` | GET | Análisis de mercados |

---

## 🧪 Tests

```powershell
cd gestor_tu_espacio
.\.venv\Scripts\Activate.ps1
python -m pytest tests/test_app.py -v
```

---

*Actualizado: Abril 2026*