from fastapi import APIRouter, Depends, HTTPException

from volty.api.auth import current_user
from volty.core.schemas import UserOut
from volty.assistant.engine import (
    ThreadAccessError,
    create_thread,
    get_thread,
    handle_chat,
    list_threads,
    reset_thread,
    update_draft,
)
from volty.core.schemas import (
    MatiasChatRequest,
    MatiasChatResponse,
    MatiasThreadListResponse,
    MatiasThreadResponse,
    ParsedIntent,
)

router = APIRouter(tags=["matias"])


@router.get("/chat/threads", response_model=MatiasThreadListResponse)
async def chat_threads(user: UserOut = Depends(current_user)) -> MatiasThreadListResponse:
    return list_threads(user.email.lower())


@router.post("/chat/threads", response_model=MatiasThreadResponse)
async def chat_threads_create(user: UserOut = Depends(current_user)) -> MatiasThreadResponse:
    return create_thread(user.email.lower())


@router.post("/chat", response_model=MatiasChatResponse)
async def chat(body: MatiasChatRequest, user: UserOut = Depends(current_user)) -> MatiasChatResponse:
    try:
        return handle_chat(body, owner_email=user.email.lower(), user_name=user.name)
    except ThreadAccessError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/chat/threads/{thread_id}", response_model=MatiasThreadResponse)
async def chat_thread(thread_id: str, user: UserOut = Depends(current_user)) -> MatiasThreadResponse:
    try:
        return get_thread(thread_id, user.email.lower())
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/chat/threads/{thread_id}/draft", response_model=ParsedIntent)
async def chat_draft(
    thread_id: str,
    draft: ParsedIntent,
    user: UserOut = Depends(current_user),
) -> ParsedIntent:
    try:
        return update_draft(thread_id, user.email.lower(), draft)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/chat/threads/{thread_id}", status_code=204)
async def chat_reset(thread_id: str, user: UserOut = Depends(current_user)) -> None:
    try:
        reset_thread(thread_id, user.email.lower())
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
