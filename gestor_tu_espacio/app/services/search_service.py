"""
Servicio de búsqueda web - Gratis via DuckDuckGo HTML.
"""
import requests
from bs4 import BeautifulSoup
from app.config import logger, API_TIMEOUT

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

def search_web(query: str, num_results: int = 5) -> list[dict]:
    """
    Buscar en la web usando DuckDuckGo (gratis, sin API key).
    Retorna lista de resultados con title, url y snippet.
    """
    if not query or not query.strip():
        return []
    
    url = "https://html.duckduckgo.com/html/"
    data = {"q": query, "b": ""}
    headers = {"User-Agent": USER_AGENT}
    
    try:
        response = requests.post(url, data=data, headers=headers, timeout=API_TIMEOUT)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        results = []
        
        for result in soup.select(".result")[:num_results]:
            title_elem = result.select_one(".result__title")
            link_elem = result.select_one(".result__url")
            snippet_elem = result.select_one(".result__snippet")
            
            if title_elem and link_elem:
                title = title_elem.get_text(strip=True)
                # Extraer URL real del enlace
                href = title_elem.find("a")
                url_link = href.get("href", "") if href else ""
                # Limpiar URL
                if url_link.startswith("/"):
                    continue
                
                snippet = snippet_elem.get_text(strip=True) if snippet_elem else ""
                
                results.append({
                    "title": title,
                    "url": url_link,
                    "snippet": snippet
                })
        
        return results
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        return []

def search_with_sources(query: str) -> dict:
    """
    Búsqueda web + retorna resultados listos para mostrar.
    """
    results = search_web(query)
    
    if not results:
        return {"query": query, "sources": [], "error": "No se encontraron resultados"}
    
    return {
        "query": query,
        "sources": results[:5],
        "count": len(results)
    }