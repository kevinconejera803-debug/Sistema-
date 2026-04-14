"""Servicio de mercados con cache y analisis local."""

from __future__ import annotations

from app.config import API_TIMEOUT, MERCADOS_TTL, logger
from app.extensions import cache
from app.utils import retry_with_backoff

_SYMBOLS = ["ES=F", "NQ=F", "SPY", "QQQ", "EURUSD=X", "BTC-USD"]


def _fetch_yfinance(timeout=API_TIMEOUT):
    import yfinance as yf

    result = []
    for symbol in _SYMBOLS:
        try:
            ticker = yf.Ticker(symbol)
            history = ticker.history(period="5d")
            if history is None or history.empty:
                continue

            last = float(history["Close"].iloc[-1])
            prev = float(history["Close"].iloc[-2]) if len(history) > 1 else last
            change_pct = ((last - prev) / prev * 100.0) if prev else 0.0
            result.append({
                "symbol": symbol,
                "price": last,
                "chg_pct": change_pct,
                "price_fmt": f"{last:,.2f}",
                "chg_fmt": f"{change_pct:+.2f}%",
            })
        except Exception as error:
            logger.warning("Error %s: %s", symbol, error)
    return result


def fetch_markets():
    """Obtiene cotizaciones con cache y fallback."""
    cached = cache.get("markets")
    if cached:
        return cached

    try:
        rows = retry_with_backoff(_fetch_yfinance, max_attempts=3, backoff_factor=2.0)
    except Exception as error:
        logger.error("Markets error: %s", error)
        cached_fallback = cache.get("markets_fallback")
        if cached_fallback:
            return cached_fallback
        rows = [{"symbol": "-", "price": 0, "chg_pct": 0, "price_fmt": "-", "chg_fmt": "-"}]

    if rows and all(row["symbol"] != "-" for row in rows):
        cache.set("markets", rows, MERCADOS_TTL)
        cache.set("markets_fallback", rows, MERCADOS_TTL * 24)
    else:
        cache.set("markets", rows, MERCADOS_TTL)
    return rows


def invalidate_markets_cache():
    cache.invalidate("markets")


def analyze_market_data(markets: list[dict]) -> str:
    """Entrega una lectura corta y deterministica de mercados."""
    if not markets:
        return "No hay datos de mercados."

    ordered = sorted(markets, key=lambda row: row.get("chg_pct", 0), reverse=True)
    strongest = ordered[0]
    weakest = ordered[-1]
    strongest_change = strongest.get("chg_fmt") or f"{strongest.get('chg_pct', 0):+.2f}%"
    weakest_change = weakest.get("chg_fmt") or f"{weakest.get('chg_pct', 0):+.2f}%"
    return f"Mejor desempeno: {strongest['symbol']} {strongest_change}. Mas debil: {weakest['symbol']} {weakest_change}."
