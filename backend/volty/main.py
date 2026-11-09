import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from volty import __version__
from volty.api.router import api_router
from volty.application.account import ensure_demo_user_seeded
from volty.application.demo_seed import ensure_demo_presentation_seed
from volty.config import settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_demo_user_seeded()
    try:
        ensure_demo_presentation_seed()
    except Exception:
        pass
    yield


app = FastAPI(
    title="Volty API",
    description="Planificación y optimización de consumo eléctrico",
    version=__version__,
    lifespan=lifespan,
)

# En Lambda la CORS la define la Function URL (evita cabeceras duplicadas en el navegador).
if not os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": "Volty", "version": __version__, "docs": "/docs"}
