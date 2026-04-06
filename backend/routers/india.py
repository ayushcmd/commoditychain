"""
India price layer — city-wise petrol/diesel prices + macro data.
Data sourced from public government sources and estimated from crude oil price.
"""
import os
import logging
from datetime import datetime, timezone
from fastapi import APIRouter
from services.commodity_service import get_price_by_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/india", tags=["india"])

# Base retail prices (approximate, updated periodically)
# Formula: base + (crude_deviation * pass_through_rate)
# Indian government adjusts these based on crude + taxes

CITIES = [
    {"city": "Mumbai",    "state": "Maharashtra", "petrol_base": 106.31, "diesel_base": 94.27},
    {"city": "Delhi",     "state": "Delhi",        "petrol_base": 94.72,  "diesel_base": 87.62},
    {"city": "Bengaluru", "state": "Karnataka",    "petrol_base": 102.86, "diesel_base": 88.94},
    {"city": "Chennai",   "state": "Tamil Nadu",   "petrol_base": 100.75, "diesel_base": 92.34},
    {"city": "Kolkata",   "state": "West Bengal",  "petrol_base": 103.94, "diesel_base": 90.76},
    {"city": "Hyderabad", "state": "Telangana",    "petrol_base": 107.41, "diesel_base": 95.65},
    {"city": "Patna",     "state": "Bihar",        "petrol_base": 107.24, "diesel_base": 94.04},
    {"city": "Jaipur",    "state": "Rajasthan",    "petrol_base": 104.88, "diesel_base": 90.36},
    {"city": "Lucknow",   "state": "Uttar Pradesh","petrol_base": 94.65,  "diesel_base": 87.76},
    {"city": "Ahmedabad", "state": "Gujarat",      "petrol_base": 96.63,  "diesel_base": 92.38},
    {"city": "Pune",      "state": "Maharashtra",  "petrol_base": 104.91, "diesel_base": 91.47},
    {"city": "Bhopal",    "state": "Madhya Pradesh","petrol_base": 108.65, "diesel_base": 93.90},
]

# India macro baseline (2024 estimates)
INDIA_MACRO = {
    "gdp_growth_pct":        6.8,
    "cpi_inflation_pct":     5.1,
    "wpi_inflation_pct":     2.3,
    "trade_deficit_usd_bn":  22.5,
    "forex_reserves_usd_bn": 619.0,
    "inr_usd":               83.9,
    "crude_import_bn_usd":   157.0,
    "crude_import_share_pct": 85.0,
}

# Tax breakdown for Delhi petrol (approx)
PRICE_BREAKDOWN = {
    "base_price":       55.32,
    "freight":           0.23,
    "excise_duty":       19.90,
    "dealer_commission":  3.77,
    "vat":               15.39,
    "total":             94.72,
}

CRUDE_REFERENCE_PRICE = 82.5  # USD/barrel reference for base prices
PASS_THROUGH_RATE     = 0.35  # INR change per $1 crude change (partial pass-through due to taxes)


@router.get("/prices")
async def india_prices():
    """City-wise petrol and diesel prices adjusted for current crude oil price."""
    crude = await get_price_by_id("crude-wti")
    crude_price = crude.price if crude else CRUDE_REFERENCE_PRICE

    deviation   = crude_price - CRUDE_REFERENCE_PRICE
    adjustment  = deviation * PASS_THROUGH_RATE

    cities = []
    for c in CITIES:
        cities.append({
            **c,
            "petrol": round(c["petrol_base"] + adjustment, 2),
            "diesel": round(c["diesel_base"] + adjustment * 0.85, 2),
            "last_updated": datetime.now(timezone.utc).isoformat(),
        })

    return {
        "crude_reference": CRUDE_REFERENCE_PRICE,
        "crude_current":   round(crude_price, 2),
        "crude_deviation": round(deviation, 2),
        "adjustment_inr":  round(adjustment, 2),
        "cities":          cities,
        "note":            "Prices are indicative. Actual prices depend on state taxes and government policy.",
    }


@router.get("/macro")
async def india_macro():
    """India macro indicators + crude oil dependency metrics."""
    crude = await get_price_by_id("crude-wti")
    crude_price = crude.price if crude else CRUDE_REFERENCE_PRICE
    deviation   = crude_price - CRUDE_REFERENCE_PRICE

    # Adjust macro for current crude
    adjusted = {
        **INDIA_MACRO,
        "inr_usd":              round(INDIA_MACRO["inr_usd"] + deviation * 0.045, 2),
        "cpi_inflation_pct":    round(INDIA_MACRO["cpi_inflation_pct"] + deviation * 0.018, 2),
        "trade_deficit_usd_bn": round(INDIA_MACRO["trade_deficit_usd_bn"] + deviation * 0.38, 2),
        "crude_price_usd":      round(crude_price, 2),
    }

    return {
        "macro": adjusted,
        "price_breakdown": PRICE_BREAKDOWN,
        "as_of": datetime.now(timezone.utc).isoformat(),
    }
