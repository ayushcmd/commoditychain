import asyncio
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.prices      import router as prices_router
from routers.websocket   import router as ws_router, _broadcast_loop
from routers.news        import router as news_router
from routers.fx          import router as fx_router
from routers.analyst     import router as analyst_router
from routers.simulator   import router as simulator_router
from routers.export      import router as export_router
from routers.india       import router as india_router
from routers.correlation import router as correlation_router

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("main")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "*",
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CommodityChain backend v4")
    from services.commodity_service import get_all_prices
    try:
        data = await get_all_prices()
        logger.info("Warm cache: %d commodities loaded", len(data))
    except Exception as exc:
        logger.warning("Cache warm failed: %s", exc)
    task = asyncio.create_task(_broadcast_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="CommodityChain API", version="4.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in [
    prices_router, ws_router, news_router, fx_router,
    analyst_router, simulator_router, export_router,
    india_router, correlation_router,
]:
    app.include_router(r)


@app.get("/", include_in_schema=False)
async def root():
    return {"service": "CommodityChain API", "version": "4.0.0", "docs": "/docs"}