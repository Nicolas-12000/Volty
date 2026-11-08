from fastapi import APIRouter, Depends, HTTPException

from volty.api.auth import current_user
from volty.application import account as account_app
from volty.core.schemas import (
    ChangePasswordRequest,
    MeSummaryResponse,
    ProfilePatchRequest,
    UserOut,
)

router = APIRouter(prefix="/me", tags=["account"])


@router.get("/summary", response_model=MeSummaryResponse)
async def me_summary(user: UserOut = Depends(current_user)) -> MeSummaryResponse:
    return account_app.personal_summary(user.email)


@router.patch("/profile", response_model=UserOut)
async def me_profile_patch(
    body: ProfilePatchRequest,
    user: UserOut = Depends(current_user),
) -> UserOut:
    try:
        return account_app.update_profile(user.email, body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/password", status_code=204)
async def me_password(
    body: ChangePasswordRequest,
    user: UserOut = Depends(current_user),
) -> None:
    try:
        account_app.change_password(user.email, body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
