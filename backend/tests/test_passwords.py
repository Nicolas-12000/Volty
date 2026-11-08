from volty.application.passwords import hash_password, verify_password


def test_password_roundtrip() -> None:
    stored = hash_password("valle-0700")
    assert verify_password("valle-0700", stored)
    assert not verify_password("wrong", stored)
