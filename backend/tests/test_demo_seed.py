from volty.application.demo_seed import (
    _MARKER_THREAD,
    ensure_demo_presentation_seed,
)
from volty.assistant.memory import memory_store as ms
from volty.core.config import settings

OWNER = settings.demo_user_email.lower()


def test_demo_presentation_seed_idempotent(monkeypatch) -> None:
    monkeypatch.setattr(
        "volty.application.demo_seed.check_database_connection",
        lambda: True,
    )
    monkeypatch.setattr(
        "volty.application.demo_seed.ensure_demo_user_seeded",
        lambda: None,
    )
    ms._STORE.clear()
    ms._store = None

    ensure_demo_presentation_seed()
    store = ms.get_thread_store()
    assert store.get(_MARKER_THREAD) is not None
    count = len(store.list_for_owner(OWNER))
    assert count >= 5

    ensure_demo_presentation_seed()
    assert len(store.list_for_owner(OWNER)) == count
