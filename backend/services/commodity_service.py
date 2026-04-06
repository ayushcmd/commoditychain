"""
Commodity service — Twelve Data for all real prices.
Falls back to GBM simulation if API call fails.
"""

import asyncio
import logging
import math
import os
import random
import time
from datetime import datetime, timezone, timedelta
from typing import Optional

import requests

from models.commodity import Commodity, PricePoint

logger = logging.getLogger(__name__)

TWELVE_DATA_KEY = os.getenv("TWELVE_DATA_KEY", "")

COMMODITIES_CONFIG = [
    {"id": "crude-wti",   "name": "Crude Oil WTI", "ticker": "WTI",    "td_symbol": "WTI/USD",   "unit": "per barrel",  "category": "energy",  "currency": "USD", "seed": 82.50,   "vol": 0.012},
    {"id": "crude-brent", "name": "Brent Crude",   "ticker": "BRENT",  "td_symbol": "BRENT/USD", "unit": "per barrel",  "category": "energy",  "currency": "USD", "seed": 86.20,   "vol": 0.011},
    {"id": "natural-gas", "name": "Natural Gas",   "ticker": "NG=F",   "td_symbol": "NATURAL_GAS/USD", "unit": "per MMBtu","category": "energy","currency": "USD", "seed": 2.15,    "vol": 0.022},
    {"id": "gold",        "name": "Gold",          "ticker": "GC=F",   "td_symbol": "XAU/USD",   "unit": "per troy oz", "category": "metals",  "currency": "USD", "seed": 3300.00, "vol": 0.006},
    {"id": "silver",      "name": "Silver",        "ticker": "SI=F",   "td_symbol": "XAG/USD",   "unit": "per troy oz", "category": "metals",  "currency": "USD", "seed": 33.50,   "vol": 0.014},
    {"id": "copper",      "name": "Copper",        "ticker": "HG=F",   "td_symbol": "COPPER/USD","unit": "per lb",      "category": "metals",  "currency": "USD", "seed": 4.45,    "vol": 0.009},
    {"id": "aluminium",   "name": "Aluminium",     "ticker": "ALI=F",  "td_symbol": "ALUMINUM/USD","unit": "per lb",    "category": "metals",  "currency": "USD", "seed": 1.12,    "vol": 0.008},
    {"id": "platinum",    "name": "Platinum",      "ticker": "PL=F",   "td_symbol": "XPT/USD",   "unit": "per troy oz", "category": "metals",  "currency": "USD", "seed": 980.00,  "vol": 0.010},
]

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "CommodityChain/1.0"})

_cache: dict[str, Commodity] = {}
_cache_ts: Optional[datetime] = None
_price_state: dict[str, float] = {}
CACHE_TTL = 60


# ── Twelve Data ─────────────────────────────────────────────────

def _fetch_twelve_data(symbol: str) -> Optional[dict]:
    """Fetch latest quote + 30-day history from Twelve Data."""
    try:
        # Current price
        quote_url = "https://api.twelvedata.com/price"
        q = SESSION.get(quote_url, params={"symbol": symbol, "apikey": TWELVE_DATA_KEY}, timeout=8)
        q.raise_for_status()
        price_data = q.json()
        if "price" not in price_data:
            return None
        price = float(price_data["price"])

        # 30-day history
        ts_url = "https://api.twelvedata.com/time_series"
        r = SESSION.get(ts_url, params={
            "symbol": symbol, "interval": "1day",
            "outputsize": 30, "apikey": TWELVE_DATA_KEY
        }, timeout=10)
        r.raise_for_status()
        ts_data = r.json()

        history = []
        if "values" in ts_data:
            for v in reversed(ts_data["values"]):
                history.append(PricePoint(timestamp=v["datetime"], price=round(float(v["close"]), 4)))

        prev_close = float(ts_data["values"][1]["close"]) if len(ts_data.get("values", [])) > 1 else price
        high24 = float(ts_data["values"][0]["high"]) if ts_data.get("values") else price
        low24  = float(ts_data["values"][0]["low"])  if ts_data.get("values") else price

        return {"price": price, "prev_close": prev_close, "high24": high24, "low24": low24, "history": history}

    except Exception as exc:
        logger.warning("Twelve Data error for %s: %s", symbol, exc)
        return None


# ── GBM simulation fallback ──────────────────────────────────────

def _simulate_price(cid: str, seed: float, vol: float) -> float:
    current = _price_state.get(cid, seed)
    drift   = 0.0001 * (seed - current) / seed
    shock   = random.gauss(drift, vol * 0.3)
    new_p   = max(seed * 0.85, min(seed * 1.15, current * math.exp(shock)))
    _price_state[cid] = new_p
    return round(new_p, 4)


def _build_history(cid: str, price: float, seed: float, vol: float) -> list[PricePoint]:
    pts, p = [], price * random.uniform(0.94, 1.06)
    now = datetime.now(timezone.utc)
    for i in range(30, -1, -1):
        p = max(seed * 0.82, min(seed * 1.18, p * math.exp(random.gauss(0, vol * 0.5))))
        pts.append(PricePoint(timestamp=(now - timedelta(days=i)).isoformat(), price=round(p, 4)))
    pts[-1] = PricePoint(timestamp=now.isoformat(), price=price)
    return pts


def _build_commodity(cfg: dict, price: float, prev_close: float, high24: float, low24: float, history: list, is_live: bool) -> Commodity:
    change     = round(price - prev_close, 4)
    change_pct = round((change / prev_close * 100) if prev_close else 0.0, 4)
    source     = "live" if is_live else "sim"
    logger.info("%s %-14s  $%10.4f  %+.2f%%  [%s]", "OK" if is_live else "SIM", cfg["id"], price, change_pct, source)
    return Commodity(
        id=cfg["id"], name=cfg["name"], ticker=cfg["ticker"],
        unit=cfg["unit"], category=cfg["category"], currency=cfg["currency"],
        price=price, previousClose=round(prev_close, 4),
        change=change, changePercent=change_pct,
        high24h=round(high24, 4), low24h=round(low24, 4),
        volume=round(random.uniform(80_000, 250_000), 0),
        marketStatus="open",
        lastUpdated=datetime.now(timezone.utc).isoformat(),
        history=history,
    )


# ── Main fetch ───────────────────────────────────────────────────

async def _fetch_all() -> list[Commodity]:
    loop    = asyncio.get_event_loop()
    results = []

    for i, cfg in enumerate(COMMODITIES_CONFIG):
        if i > 0:
            await asyncio.sleep(0.5)  # respect rate limit

        td_data = None
        if TWELVE_DATA_KEY:
            td_data = await loop.run_in_executor(None, _fetch_twelve_data, cfg["td_symbol"])

        if td_data:
            c = _build_commodity(cfg, td_data["price"], td_data["prev_close"],
                                 td_data["high24"], td_data["low24"], td_data["history"], is_live=True)
        else:
            price = _simulate_price(cfg["id"], cfg["seed"], cfg["vol"])
            prev  = price / math.exp(random.gauss(0, cfg["vol"] * 0.4))
            hist  = _build_history(cfg["id"], price, cfg["seed"], cfg["vol"])
            c = _build_commodity(cfg, price, prev, price * 1.005, price * 0.995, hist, is_live=False)

        results.append(c)

    return results


# ── Cache ────────────────────────────────────────────────────────

def _stale() -> bool:
    if not _cache_ts: return True
    return (datetime.now(timezone.utc) - _cache_ts).total_seconds() > CACHE_TTL


async def get_all_prices() -> list[Commodity]:
    global _cache, _cache_ts
    if _stale():
        fresh = await _fetch_all()
        if fresh:
            _cache    = {c.id: c for c in fresh}
            _cache_ts = datetime.now(timezone.utc)
            logger.info("Cache updated — %d commodities", len(fresh))
    return list(_cache.values())


async def get_price_by_id(cid: str) -> Optional[Commodity]:
    return next((c for c in await get_all_prices() if c.id == cid), None)