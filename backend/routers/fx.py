"""
FX rates router — live USD base rates via ExchangeRate-API free tier.
Free tier: 1500 requests/month at exchangerate-api.com (no key needed for basic).
Falls back to hardcoded approximate rates if API fails.
"""

import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["fx"])

_fx_cache: dict = {}
_fx_ts: float = 0.0
FX_CACHE_TTL = 3600  # 1 hour — rates don't change fast

FALLBACK_RATES = {
    "USD": 1.0,
    "INR": 83.90,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 151.20,
    "AUD": 1.53,
    "CAD": 1.36,
    "CNY": 7.24,
    "SGD": 1.34,
    "AED": 3.67,
}


async def _fetch_rates() -> dict[str, float]:
    global _fx_cache, _fx_ts
    now = datetime.now(timezone.utc).timestamp()
    if _fx_cache and (now - _fx_ts) < FX_CACHE_TTL:
        return _fx_cache

    try:
        url = "https://open.er-api.com/v6/latest/USD"
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            rates = data.get("rates", {})
            if rates:
                _fx_cache = {k: float(v) for k, v in rates.items()}
                _fx_ts = now
                logger.info("FX rates refreshed — %d currencies", len(_fx_cache))
                return _fx_cache
    except Exception as exc:
        logger.warning("FX API failed: %s — using fallback rates", exc)

    return FALLBACK_RATES


@router.get("/rates")
async def get_rates():
    rates = await _fetch_rates()
    # Return only currencies relevant to the app
    keys = ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "CNY", "SGD", "AED"]
    return {k: rates.get(k, FALLBACK_RATES.get(k, 1.0)) for k in keys}
