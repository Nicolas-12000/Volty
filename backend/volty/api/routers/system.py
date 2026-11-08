from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from volty.core.db.session import check_database_connection

router = APIRouter(tags=["system"])


@router.get("/health")
async def health() -> dict[str, str]:
    db_ok = check_database_connection()
    status = "ok" if db_ok else "degraded"
    return {
        "status": status,
        "service": "volty",
        "assistant": "MATIAS",
        "database": "up" if db_ok else "down",
    }


@router.get("/schemas/optimize-request")
async def optimize_request_schema() -> FileResponse:
    path = Path(__file__).resolve().parents[4] / "docs" / "schemas" / "optimize-request.schema.json"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Schema file missing")
    return FileResponse(path, media_type="application/schema+json")
