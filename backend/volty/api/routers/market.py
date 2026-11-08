from datetime import datetime

from fastapi import APIRouter, HTTPException

from volty.application import market as market_app
from volty.core.schemas import PriceSeriesResponse

router = APIRouter(tags=["market"])


@router.get("/smard/filters")
async def smard_filters() -> dict[int, str]:
    return market_app.smard_filter_map()


@router.get("/smard/series")
async def smard_series(
    filter_id: int,
    region: str = "DE",
    resolution: str = "quarterhour",
    timestamp_ms: int | None = None,
) -> dict:
    try:
        return await market_app.fetch_smard_series(
            filter_id=filter_id,
            region=region,
            resolution=resolution,
            timestamp_ms=timestamp_ms,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/prices", response_model=PriceSeriesResponse)
async def get_prices(
    start: datetime | None = None,
    end: datetime | None = None,
    bidding_zone: str | None = None,
) -> PriceSeriesResponse:
    try:
        return await market_app.fetch_prices(start=start, end=end, bidding_zone=bidding_zone)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/renewable-share")
async def renewable_share() -> dict:
    try:
        return await market_app.fetch_renewable_share()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
