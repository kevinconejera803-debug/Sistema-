"""
Servicio de mercados (yfinance) con cache.
"""
from app import cache
from app.config import logger, MERCADOS_TTL, API_TIMEOUT
from app.utils import retry_with_backoff

_SYMBOLS = ["ES=F", "NQ=F", "SPY", "QQQ", "EURUSD=X", "BTC-USD"]


def _fetch_yfinance(timeout=API_TIMEOUT):
    import yfinance as yf
    result = []
    for sym in _SYMBOLS:
        try:
            t = yf.Ticker(sym)
            h = t.history(period="5d")
            if h is None or h.empty:
                continue
            last = float(h["Close"].iloc[-1])
            prev = float(h["Close"].iloc[-2]) if len(h) > 1 else last
            chg = ((last - prev) / prev * 100.0) if prev else 0.0
            result.append({
                "symbol": sym,
                "price": last,
                "chg_pct": chg,
                "price_fmt": f"{last:,.2f}",
                "chg_fmt": f"{chg:+.2f}%",
            })
        except Exception as e:
            logger.warning(f"Error {sym}: {e}")
    return result


def fetch_markets():
    """Obtiene cotizaciones con cache y fallback."""
    cached = cache.get("markets")
    if cached:
        return cached
    try:
        rows = retry_with_backoff(_fetch_yfinance, max_attempts=3, backoff_factor=2.0)
    except Exception as e:
        logger.error(f"Markets error: {e}")
        cached_fallback = cache.get("markets_fallback")
        if cached_fallback:
            return cached_fallback
        rows = [{"symbol": "—", "price": 0, "chg_pct": 0, "price_fmt": "—", "chg_fmt": "—"}]
    if rows and all(s["symbol"] != "—" for s in rows):
        cache.set("markets", rows, MERCADOS_TTL)
        cache.set("markets_fallback", rows, MERCADOS_TTL * 24)
    else:
        cache.set("markets", rows, MERCADOS_TTL)
    return rows


def invalidate_markets_cache():
    cache.invalidate("markets")


def analyze_market_data(markets: list[dict]) -> str:
    """Genera prompt para análisis de mercados."""
    if not markets:
        return "No hay datos de mercados."
    
    summary = "\n".join([
        f"- {m['symbol']}: {m['price_fmt']} ({m['chg_fmt']})"
        for m in markets
    ])
    
    prompt = f"""Analiza brevemente estos datos de mercados y menciona puntos clave:

{summary}

Análisis:"""
    return prompt


async def generate_market_analysis(ai_manager) -> str:
    """Genera análisis de mercados usando IA."""
    from app.services.markets_service import fetch_markets
    
    markets = fetch_markets()
    if not markets:
        return "No hay datos de mercados."
    
    prompt = analyze_market_data(markets)
    
    try:
        analysis = await ai_manager.generate(prompt)
        return analysis if isinstance(analysis, str) else str(analysis)
    except Exception as e:
        logger.error(f"Error generando análisis: {e}")
        return "No se pudo generar el análisis."
