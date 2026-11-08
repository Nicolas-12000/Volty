from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from volty import __version__
from volty.api.router import api_router
from volty.application.account import ensure_demo_user_seeded
from volty.config import settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_demo_user_seeded()
    yield


app = FastAPI(
    title="Volty API",
    description="Planificación y optimización de consumo eléctrico",
    version=__version__,
    lifespan=lifespan,
)

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
