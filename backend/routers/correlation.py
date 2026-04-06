"""
Correlation router — compute rolling Pearson correlation between commodity pairs.
Uses price history from the in-memory cache (no DB needed).
"""
import math
from fastapi import APIRouter
from services.commodity_service import get_all_prices

router = APIRouter(prefix="/api", tags=["correlation"])


def _pearson(xs: list[float], ys: list[float]) -> float:
    n = min(len(xs), len(ys))
    if n < 3:
        return 0.0
    xs, ys = xs[-n:], ys[-n:]
    mx = sum(xs) / n
    my = sum(ys) / n
    num   = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    denom = math.sqrt(sum((x - mx) ** 2 for x in xs) * sum((y - my) ** 2 for y in ys))
    return round(num / denom, 4) if denom else 0.0


@router.get("/correlation")
async def correlation_matrix():
    commodities = await get_all_prices()

    # Build price series per commodity (30-day daily closes)
    series: dict[str, list[float]] = {}
    labels: dict[str, str] = {}
    for c in commodities:
        prices = [p.price for p in c.history if p.price > 0]
        if prices:
            series[c.id]  = prices
            labels[c.id]  = c.name

    ids = list(series.keys())

    matrix: list[dict] = []
    for id_a in ids:
        for id_b in ids:
            corr = 1.0 if id_a == id_b else _pearson(series[id_a], series[id_b])
            matrix.append({
                "a":    id_a,
                "b":    id_b,
                "name_a": labels[id_a],
                "name_b": labels[id_b],
                "corr": corr,
            })

    return {"ids": ids, "labels": labels, "matrix": matrix}
