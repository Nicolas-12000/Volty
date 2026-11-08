from fastapi import APIRouter, HTTPException

from volty.application.planning import interpret_message, run_optimization
from volty.core.schemas import NaturalLanguageRequest, OptimizeRequest, OptimizeResponse, ParsedIntent

router = APIRouter(tags=["planning"])


@router.post("/interpret", response_model=ParsedIntent)
async def interpret(body: NaturalLanguageRequest) -> ParsedIntent:
    try:
        return interpret_message(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/optimize", response_model=OptimizeResponse)
async def optimize(body: OptimizeRequest) -> OptimizeResponse:
    try:
        return await run_optimization(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
