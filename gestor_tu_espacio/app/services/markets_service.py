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
    """Obtiene cotizaciones con cache."""
    cached = cache.get("markets")
    if cached:
        return cached
    try:
        rows = retry_with_backoff(_fetch_yfinance, max_attempts=3, backoff_factor=2.0)
    except Exception as e:
        logger.error(f"Markets error: {e}")
        rows = [{"symbol": "—", "price": 0, "chg_pct": 0, "price_fmt": "—", "chg_fmt": "—"}]
    cache.set("markets", rows, MERCADOS_TTL)
    return rows


def invalidate_markets_cache():
    cache.invalidate("markets")
