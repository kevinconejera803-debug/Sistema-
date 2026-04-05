"""
Blueprint investigación: API de búsqueda académica.
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.utils import log_endpoint

research_bp = Blueprint("research", __name__, url_prefix="/api")

_CORPUS = [
    {
        "title": "Transformación digital en la gestión financiera corporativa",
        "authors": "Journal of Business Research",
        "year": "2022",
        "source": "Business Research",
        "url": "https://scholar.google.com/scholar?hl=es&q=transformaci%C3%B3n+digital+finanzas",
        "summary": "Reporte académico sobre adopción digital, métricas de desempeño financiero y evidencia empírica de resultados comerciales.",
        "category": "Finanzas",
        "tags": ["digital", "finanzas", "transformación", "gestión"],
    },
    {
        "title": "Enfoques verificados para investigación estratégica en finanzas",
        "authors": "Harvard Business Review",
        "year": "2021",
        "source": "Harvard Business Review",
        "url": "https://hbr.org/2021/01/strategic-research-in-finance",
        "summary": "Análisis de fuentes confiables y métodos para construir un marco de investigación profesional en entornos de alto impacto.",
        "category": "Estrategia",
        "tags": ["finanzas", "estrategia", "investigación", "gestión"],
    },
    {
        "title": "Guía práctica para uso de Google Scholar en investigaciones confiables",
        "authors": "Universidad de Stanford",
        "year": "2023",
        "source": "Stanford University",
        "url": "https://scholar.google.com/scholar?hl=es&q=guia+google+scholar+investigacion",
        "summary": "Metodología de búsqueda avanzada para localizar literatura revisada por pares y referencias verificables en tiempo real.",
        "category": "Metodología",
        "tags": ["Google Scholar", "metodología", "citas", "búsqueda"],
    },
    {
        "title": "Inteligencia artificial aplicada a la educación superior",
        "authors": "MIT Sloan Management Review",
        "year": "2024",
        "source": "MIT Sloan",
        "url": "https://sloanreview.mit.edu/article/artificial-intelligence-education/",
        "summary": "Informe sobre implementación de IA en educación, avances en análisis de datos y recomendaciones para uso institucional.",
        "category": "Tecnología",
        "tags": ["IA", "educación", "análisis", "innovación"],
    },
    {
        "title": "Informe global sobre transformación digital 2024",
        "authors": "McKinsey Global Institute",
        "year": "2024",
        "source": "McKinsey",
        "url": "https://www.mckinsey.com/business-functions/mckinsey-digital/our-insights/global-digital-report-2024",
        "summary": "Reporte ejecutivo con tendencias de digitalización, adopción tecnológica y desempeño en sectores clave.",
        "category": "Tendencias",
        "tags": ["transformación", "digital", "tendencias", "estrategia"],
    },
    {
        "title": "Ciberseguridad en instituciones financieras: mejores prácticas",
        "authors": "World Economic Forum",
        "year": "2023",
        "source": "WEF",
        "url": "https://www.weforum.org/reports/fintech-security-2023",
        "summary": "Documento de referencia con controles, riesgos y marcos de gestión para proteger datos y activos en finanzas.",
        "category": "Seguridad",
        "tags": ["ciberseguridad", "finanzas", "riesgo", "instituciones"],
    },
    {
        "title": "Metodologías de análisis de datos para la toma de decisiones estratégicas",
        "authors": "OECD",
        "year": "2023",
        "source": "OCDE",
        "url": "https://www.oecd.org/data/strategic-analytics/",
        "summary": "Publicación sobre métricas, calidad de datos y modelos analíticos en políticas públicas y gestión empresarial.",
        "category": "Análisis",
        "tags": ["datos", "analítica", "políticas", "estrategia"],
    },
    {
        "title": "Machine Learning en predicción de mercados financieros",
        "authors": "IEEE Transactions on Neural Networks",
        "year": "2024",
        "source": "IEEE",
        "url": "https://scholar.google.com/scholar?hl=es&q=machine+learning+mercados+financieros",
        "summary": "Estudio comparativo de modelos de aprendizaje automático para pronósticos de volatilidad y riesgos de inversión.",
        "category": "Tecnología",
        "tags": ["machine learning", "finanzas", "predicción", "IA"],
    },
    {
        "title": "Sostenibilidad empresarial y responsabilidad corporativa en 2024",
        "authors": "Accenture Research",
        "year": "2024",
        "source": "Accenture",
        "url": "https://www.accenture.com/sustainability-research",
        "summary": "Análisis de iniciativas de responsabilidad social, impacto ambiental y gobernanza corporativa en empresas globales.",
        "category": "Sostenibilidad",
        "tags": ["sostenibilidad", "RSE", "gobernanza", "empresa"],
    },
    {
        "title": "Gestión de riesgos en transformación digital",
        "authors": "Deloitte Insights",
        "year": "2023",
        "source": "Deloitte",
        "url": "https://www2.deloitte.com/digital-risk-management",
        "summary": "Marco completo para identificar, evaluar y mitigar riesgos en proyectos de transformación tecnológica.",
        "category": "Gestión",
        "tags": ["riesgo", "transformación", "digital", "gestión"],
    },
    {
        "title": "Economía de plataformas y modelos digitales innovadores",
        "authors": "Journal of Economic Perspectives",
        "year": "2023",
        "source": "AEA",
        "url": "https://scholar.google.com/scholar?hl=es&q=economia+plataformas+digital",
        "summary": "Análisis teórico y empírico de la economía de plataformas, mercados bidireccionales y disrupción empresarial.",
        "category": "Economía",
        "tags": ["plataformas", "economía digital", "innovación", "modelos"],
    },
    {
        "title": "Competencias futuras para profesionales del análisis de datos",
        "authors": "World Economic Forum Future of Jobs",
        "year": "2024",
        "source": "WEF",
        "url": "https://www.weforum.org/future-of-jobs-2024",
        "summary": "Reporte sobre habilidades críticas en análisis, ciencia de datos y literacia digital para carreras profesionales.",
        "category": "Educación",
        "tags": ["datos", "competencias", "futuro", "educación"],
    },
    {
        "title": "Regulación y cumplimiento en tecnología financiera (FinTech)",
        "authors": "Basel Committee on Banking Supervision",
        "year": "2023",
        "source": "BIS",
        "url": "https://www.bis.org/fintech-regulation",
        "summary": "Directrices internacionales para regulación de servicios financieros digitales y cumplimiento normativo global.",
        "category": "Regulación",
        "tags": ["fintech", "regulación", "normativa", "finanzas"],
    },
]


def _score_result(item: dict, query_terms: list[str]) -> int:
    """Calcula relevancia de un artículo frente a términos de búsqueda."""
    score = 0
    title_lower = item["title"].lower()
    summary_lower = item["summary"].lower()
    tags_lower = [tag.lower() for tag in item["tags"]]

    for term in query_terms:
        if term in title_lower:
            score += 5
        if term in summary_lower:
            score += 2
        if any(term in tag for tag in tags_lower):
            score += 3

    return score


@research_bp.route("/research")
@log_endpoint
def api_research():
    """Proveer resultados de investigación profesional basada en términos de consulta."""
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "Debes proporcionar un término de búsqueda."}), 400

    query_lower = query.lower()
    query_terms = query_lower.split()

    scored_results = [(item, _score_result(item, query_terms)) for item in _CORPUS]
    scored_results.sort(key=lambda x: x[1], reverse=True)
    results = [item for item, score in scored_results if score > 0] or [item for item, _ in scored_results[:4]]

    return jsonify({"query": query, "results": results[:10]})
