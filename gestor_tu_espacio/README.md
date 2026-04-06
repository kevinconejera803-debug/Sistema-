# 🚀 Tu Espacio  
> Asistente personal inteligente con IA local

---

## 🧠 Descripción

**Tu Espacio** es una aplicación web que combina gestión personal (calendario, estudios, noticias y mercados) con un asistente de inteligencia artificial contextual.

El sistema utiliza IA local mediante Ollama, evitando dependencias de APIs externas y permitiendo mayor privacidad, control y escalabilidad.

---

## ✨ Características

- 🤖 IA local (Ollama - llama3.1)
- 🧠 Memoria conversacional persistente (SQLite)
- 🎯 Detección de intención del usuario
- 📅 Contexto dinámico desde calendario
- ⚡ Recomendaciones proactivas
- 📰 Resumen inteligente de noticias
- 📊 Análisis de mercados
- 🎓 Gestión académica inteligente
- 💬 Interfaz de chat integrada

---

## 💡 Ejemplo

**Usuario:**
```bash
¿Qué debería hacer hoy?
```

**Respuesta:**
```bash
Tienes un examen mañana. Te recomiendo estudiar al menos 2 horas hoy.
```

---

## 🏗️ Arquitectura

```text
Frontend (HTML/JS)
        ↓
Flask (Blueprints)
        ↓
Services (lógica)
        ↓
AIManager
        ↓
Ollama (llama3.1)
```

---

## 🛠️ Tecnologías

**Backend**
- Python
- Flask
- SQLAlchemy
- SQLite

**IA**
- Ollama
- llama3.1

**Frontend**
- HTML
- CSS
- JavaScript

**Otros**
- dotenv
- requests
- asyncio

---

## ⚙️ Instalación

```bash
git clone <repo>
cd Sistema
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Instalar Ollama:
https://ollama.ai

```bash
ollama serve
ollama pull llama3.1
```

Crear `.env`:

```env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.1:latest
```

Ejecutar:

```bash
python run.py
```

---

## 🔌 Endpoints

| Endpoint | Método | Descripción |
|--------|--------|------------|
| /api/research/ask | POST | Chat IA |
| /api/assistant/insights | GET | Sugerencias |
| /api/research/notifications | GET | Eventos |
| /api/news/summary | GET | Noticias |
| /api/markets/analysis | GET | Mercados |

---

## 🧠 IA

El sistema combina:

- historial conversacional
- contexto del usuario
- detección de intención

Generando respuestas personalizadas y accionables.

---

## 📈 Roadmap

- Multiusuario
- Notificaciones automáticas
- Mejor UI tipo chat
- Optimización de IA

---

## 🤝 Contribución

Fork → cambios → Pull Request

---

## ⚡ Visión

Crear un asistente que anticipe necesidades y ayude a tomar decisiones.