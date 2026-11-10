"""Dispositivos reconocidos en chat (colaquial → nombre de carga)."""

from __future__ import annotations

from volty.assistant.normalize import normalize_user_text

DEVICE_KEYWORDS: tuple[tuple[str, str], ...] = (
    ("lavavajillas", "Lavavajillas"),
    ("lavadora", "Lavadora"),
    ("secadora", "Secadora"),
    ("bomba de calor", "Bomba de calor / ACS"),
    ("acs", "Bomba de calor / ACS"),
    ("movil", "Cargador móvil"),
    ("móvil", "Cargador móvil"),
    ("celular", "Cargador móvil"),
    ("smartphone", "Cargador móvil"),
    ("telefono", "Cargador móvil"),
    ("pc", "PC / ordenador"),
    ("ordenador", "PC / ordenador"),
    ("portatil", "PC / ordenador"),
    ("portátil", "PC / ordenador"),
    ("laptop", "PC / ordenador"),
    ("computadora", "PC / ordenador"),
    ("coche", "Vehículo eléctrico"),
    ("vehiculo", "Vehículo eléctrico"),
    ("wallbox", "Vehículo eléctrico"),
)


def device_name_in_text(text: str) -> str | None:
    folded = normalize_user_text(text)
    for token, name in DEVICE_KEYWORDS:
        if token in folded:
            return name
    return None
