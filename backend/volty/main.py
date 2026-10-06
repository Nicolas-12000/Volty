from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from volty import __version__
from volty.api.routes import router
from volty.config import settings

app = FastAPI(
    title="Volty API",
    description="Planificación y optimización de consumo eléctrico",
    version=__version__,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": "Volty", "version": __version__, "docs": "/docs"}
