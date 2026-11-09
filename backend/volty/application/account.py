"""Cuenta de usuario: solo campos seguros (nunca zonas de mercado ni backends)."""

from __future__ import annotations

from volty.application.passwords import hash_password, verify_password
from volty.assistant.memory.memory_store import get_thread_store
from volty.core.config import settings
from volty.core.db.models import UserAccount
from volty.core.db.session import get_session_factory
from volty.core.schemas import (
    ChangePasswordRequest,
    MatiasAccountSummary,
    MeMatiasBlock,
    MeSummaryResponse,
    ProfilePatchRequest,
    ServerContextOut,
    UserOut,
)


def user_out_from_row(row: UserAccount) -> UserOut:
    return UserOut(email=row.email, name=row.name, assistant="MATIAS")


def get_user(email: str) -> UserAccount | None:
    key = email.strip().lower()
    with get_session_factory()() as session:
        return session.get(UserAccount, key)


def authenticate(email: str, password: str) -> UserOut | None:
    key = email.strip().lower()
    row = get_user(key)
    if row is not None:
        if verify_password(password, row.password_hash):
            return user_out_from_row(row)
        return None
    if key == settings.demo_user_email.lower() and password == settings.demo_user_password:
        return UserOut(email=settings.demo_user_email, name=settings.demo_user_name)
    return None


def ensure_demo_user_seeded() -> None:
    """Crea el usuario demo en BD si hay Postgres y aún no existe."""
    if not get_user(settings.demo_user_email):
        try:
            with get_session_factory()() as session:
                session.add(
                    UserAccount(
                        email=settings.demo_user_email.lower(),
                        name=settings.demo_user_name,
                        password_hash=hash_password(settings.demo_user_password),
                    )
                )
                session.commit()
        except Exception:
            pass


def update_profile(email: str, body: ProfilePatchRequest) -> UserOut:
    key = email.strip().lower()
    row = get_user(key)
    if row is None:
        if key != settings.demo_user_email.lower():
            raise ValueError("Cuenta no encontrada.")
        ensure_demo_user_seeded()
        row = get_user(key)
        if row is None:
            raise ValueError(
                "No pudimos sincronizar tu cuenta. Cierra sesión y vuelve a entrar."
            )
    with get_session_factory()() as session:
        db_row = session.get(UserAccount, key)
        if db_row is None:
            raise ValueError("Cuenta no encontrada.")
        db_row.name = body.name.strip()
        session.commit()
        session.refresh(db_row)
        return user_out_from_row(db_row)


def change_password(email: str, body: ChangePasswordRequest) -> None:
    if body.new_password != body.new_password_confirm:
        raise ValueError("La confirmación no coincide.")
    if len(body.new_password) < 8:
        raise ValueError("La nueva contraseña debe tener al menos 8 caracteres.")
    key = email.strip().lower()
    row = get_user(key)
    if row is None:
        raise ValueError("No encontramos esa cuenta en Volty.")
    if not verify_password(body.current_password, row.password_hash):
        raise ValueError("Contraseña actual incorrecta.")
    with get_session_factory()() as session:
        db_row = session.get(UserAccount, key)
        if db_row is None:
            raise ValueError("Cuenta no encontrada.")
        db_row.password_hash = hash_password(body.new_password)
        session.commit()


def personal_summary(email: str) -> MeSummaryResponse:
    key = email.strip().lower()
    if key == settings.demo_user_email.lower():
        ensure_demo_user_seeded()
        try:
            from volty.application.demo_seed import ensure_demo_presentation_seed

            ensure_demo_presentation_seed()
        except Exception:
            pass
    row = get_user(key)
    if row is not None:
        user = user_out_from_row(row)
        can_change_password = True
    else:
        user = UserOut(email=email, name=email.split("@")[0], assistant="MATIAS")
        can_change_password = False

    store = get_thread_store()
    threads = store.list_for_owner(key)
    with_draft = sum(1 for t in threads if t.draft is not None)
    recent = [
        MatiasAccountSummary(
            thread_id=t.thread_id,
            title=t.title,
            updated_at=t.updated_at,
            message_count=len(t.messages),
            has_draft=t.draft is not None,
        )
        for t in threads[:5]
    ]

    server = ServerContextOut(
        bidding_zone=settings.bidding_zone,
        timezone=settings.timezone,
        assistant="MATIAS",
        note="Zona y motor los fija el servidor; no se editan desde tu perfil.",
    )

    return MeSummaryResponse(
        user=user,
        matias=MeMatiasBlock(
            thread_count=len(threads),
            threads_with_draft=with_draft,
            recent_threads=recent,
        ),
        server=server,
        can_change_password=can_change_password,
    )
