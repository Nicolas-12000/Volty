"""Compositor HTTP: solo enlaza routers de dominio (sin lógica de negocio)."""

from fastapi import APIRouter

from volty.api.auth import router as auth_router
from volty.api.routers import account, market, matias, planning, system

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(account.router)
api_router.include_router(system.router)
api_router.include_router(market.router)
api_router.include_router(matias.router)
api_router.include_router(planning.router)
