"""Auth JWT — login y dependencia current_user."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from volty.application import account as account_app
from volty.core.config import settings
from volty.core.schemas import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"
TOKEN_HOURS = 24 * 7


class LoginBody(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=1)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


def _issue_token(user: UserOut) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS)
    return jwt.encode(
        {"sub": user.email.lower(), "name": user.name, "exp": exp},
        settings.jwt_secret,
        algorithm=ALGORITHM,
    )


def _user_from_token(token: str) -> UserOut:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
        email = payload["sub"]
        row = account_app.get_user(email)
        if row is not None:
            return account_app.user_out_from_row(row)
        return UserOut(email=email, name=payload.get("name", "Usuario Volty"))
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada.") from exc


async def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> UserOut:
    if credentials is None:
        raise HTTPException(status_code=401, detail="No has iniciado sesión.")
    return _user_from_token(credentials.credentials)


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginBody) -> LoginResponse:
    user = account_app.authenticate(body.email, body.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")
    token = _issue_token(user)
    return LoginResponse(access_token=token, user=user)


@router.get("/me", response_model=UserOut)
async def me(user: UserOut = Depends(current_user)) -> UserOut:
    return user
