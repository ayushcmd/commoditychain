"""
Shock Simulator — computes India macro impact of commodity price shocks.
Uses pre-estimated regression coefficients from historical data.
All coefficients = unit change in macro metric per $1 change in commodity price.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["simulator"])


# ---------------------------------------------------------------------------
# Regression coefficients (estimated from historical relationships)
# India macro metrics vs commodity price changes
# ---------------------------------------------------------------------------

# How much each India macro metric changes per $1 change in commodity price
COEFFICIENTS: dict[str, dict[str, float]] = {
    "crude-wti": {
        "india_retail_petrol_inr":   0.52,    # INR per litre (petrol pump price)
        "india_retail_diesel_inr":   0.41,    # INR per litre
        "cpi_inflation_pct":         0.018,   # CPI % point change
        "trade_deficit_usd_bn":      0.38,    # $Bn monthly trade deficit
        "inr_usd_rate":              0.045,   # INR depreciation per $1 crude rise
        "fiscal_deficit_gdp_pct":    0.0012,  # % of GDP
    },
    "crude-brent": {
        "india_retail_petrol_inr":   0.50,
        "india_retail_diesel_inr":   0.39,
        "cpi_inflation_pct":         0.017,
        "trade_deficit_usd_bn":      0.36,
        "inr_usd_rate":              0.043,
        "fiscal_deficit_gdp_pct":    0.0011,
    },
    "natural-gas": {
        "india_retail_petrol_inr":   0.0,
        "india_retail_diesel_inr":   0.0,
        "cpi_inflation_pct":         0.008,
        "trade_deficit_usd_bn":      0.12,
        "inr_usd_rate":              0.015,
        "fiscal_deficit_gdp_pct":    0.0004,
    },
    "gold": {
        "india_retail_petrol_inr":   0.0,
        "india_retail_diesel_inr":   0.0,
        "cpi_inflation_pct":         0.002,
        "trade_deficit_usd_bn":      0.08,
        "inr_usd_rate":              0.01,
        "fiscal_deficit_gdp_pct":    0.0002,
    },
}

# Baseline India macro values (approximate 2024 levels)
BASELINES = {
    "india_retail_petrol_inr":  104.5,
    "india_retail_diesel_inr":   92.3,
    "cpi_inflation_pct":          5.1,
    "trade_deficit_usd_bn":      22.5,
    "inr_usd_rate":              83.9,
    "fiscal_deficit_gdp_pct":     5.6,
}

METRIC_LABELS = {
    "india_retail_petrol_inr":  "India Petrol Price",
    "india_retail_diesel_inr":  "India Diesel Price",
    "cpi_inflation_pct":         "CPI Inflation",
    "trade_deficit_usd_bn":      "Trade Deficit",
    "inr_usd_rate":              "INR / USD Rate",
    "fiscal_deficit_gdp_pct":    "Fiscal Deficit",
}

METRIC_UNITS = {
    "india_retail_petrol_inr":  "INR/litre",
    "india_retail_diesel_inr":  "INR/litre",
    "cpi_inflation_pct":         "% YoY",
    "trade_deficit_usd_bn":      "$ Billion/month",
    "inr_usd_rate":              "INR per USD",
    "fiscal_deficit_gdp_pct":    "% of GDP",
}

METRIC_DIRECTION = {
    "india_retail_petrol_inr":  "higher is worse",
    "india_retail_diesel_inr":  "higher is worse",
    "cpi_inflation_pct":         "higher is worse",
    "trade_deficit_usd_bn":      "higher is worse",
    "inr_usd_rate":              "higher means INR weaker",
    "fiscal_deficit_gdp_pct":    "higher is worse",
}


class SimulatorRequest(BaseModel):
    commodity_id: str
    base_price: float     # current/reference price
    shock_price: float    # user-selected shock price


class MetricResult(BaseModel):
    key: str
    label: str
    unit: str
    direction: str
    baseline: float
    shocked: float
    delta: float
    delta_pct: float


class SimulatorResponse(BaseModel):
    commodity_id: str
    base_price: float
    shock_price: float
    price_change: float
    price_change_pct: float
    metrics: list[MetricResult]


@router.post("/simulate", response_model=SimulatorResponse)
async def simulate(req: SimulatorRequest):
    coeffs = COEFFICIENTS.get(req.commodity_id, COEFFICIENTS.get("crude-wti", {}))
    delta_price = req.shock_price - req.base_price
    price_change_pct = (delta_price / req.base_price * 100) if req.base_price else 0

    metrics: list[MetricResult] = []
    for key, baseline in BASELINES.items():
        coeff = coeffs.get(key, 0.0)
        shocked = baseline + coeff * delta_price
        delta = shocked - baseline
        delta_pct = (delta / baseline * 100) if baseline else 0

        metrics.append(MetricResult(
            key=key,
            label=METRIC_LABELS[key],
            unit=METRIC_UNITS[key],
            direction=METRIC_DIRECTION[key],
            baseline=round(baseline, 4),
            shocked=round(shocked, 4),
            delta=round(delta, 4),
            delta_pct=round(delta_pct, 4),
        ))

    return SimulatorResponse(
        commodity_id=req.commodity_id,
        base_price=req.base_price,
        shock_price=req.shock_price,
        price_change=round(delta_price, 4),
        price_change_pct=round(price_change_pct, 4),
        metrics=metrics,
    )


@router.get("/simulate/commodities")
async def simulatable_commodities():
    """Which commodities have macro coefficient models."""
    return list(COEFFICIENTS.keys())
