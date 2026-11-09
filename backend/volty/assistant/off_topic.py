"""Desvío suave cuando el mensaje no va de cargas (sin sustituir el bloqueo anti-injection)."""

from __future__ import annotations

import re
import unicodedata
from random import choice

# Siempre mencionan Volty y el rol; tono cercano sin chistes literales aleatorios.
_GENERAL_REDIRECTS = (
    "Eso va fuera de mi rol. Soy MATIAS en Volty: planifico cargas del hogar "
    "(kWh, hora límite, coste o renovables). ¿Qué aparato quieres programar?",
    "No puedo ayudarte con eso. En Volty solo armo borradores de consumo eléctrico "
    "flexible. Cuéntame qué cargar y antes de qué hora.",
    "Mi tema es la energía en casa — precios, horarios y cargas como el coche o la lavadora. "
    "¿Qué quieres optimizar en Volty?",
)

_COOKING_HINTS = (
    "cocinar",
    "milanesa",
    "receta",
    "hornear",
    "pasta ",
    "pizza",
    "asado",
    "cena ",
    "almuerzo",
    "desayuno",
    "comida",
    "restaurante",
)

_ENERGY_HINTS = (
    "kwh",
    " kw",
    "carga",
    "cargar",
    "lavadora",
    "secadora",
    "lavavajillas",
    "coche",
    "vehic",
    "volty",
    "luz",
    "electr",
    "precio",
    "renovable",
    "plazo",
    "antes de",
    "optimiz",
    "wallbox",
    "acs",
    "bomba",
    "matias",
    "hogar",
    "energ",
    "enchuf",
    "minimiz",
    "barato",
    "tarifa",
    "mercado",
    "berlin",
    "berlín",
)

_LIFE_TOPICS = (
    *_COOKING_HINTS,
    "futbol",
    "fútbol",
    "partido",
    "messi",
    "horoscop",
    "horóscop",
    "pelicula",
    "película",
    "netflix",
    "serie ",
    "spotify",
    "viaje ",
    "hotel",
    "tinder",
    "novia",
    "novio",
    "politica",
    "política",
    "bitcoin",
    "cripto",
)

_OFF_TOPIC_PATTERNS = (
    re.compile(r"(?i)\b(escrib\w+|genera|hazme|dame)\b.{0,40}\b(c[oó]digo|code|script|programa|python)\b"),
    re.compile(r"(?i)\b(python|javascript)\b.{0,40}\b(script|c[oó]digo|lista|ordenar)\b"),
    re.compile(
        r"(?i)\b(python|javascript|typescript|react|next\.js|sql|html|css)\b.{0,50}"
        r"\b(ejemplo|tutorial|funci[oó]n|clase|api)\b"
    ),
    re.compile(r"(?i)\b(no\s+quiero|prefiero|mejor)\b.{0,30}\b(cocinar|comer|ver\s+la)\b"),
    re.compile(r"(?i)\b(resuelve|soluciona)\b.{0,40}\b(tarea|examen|deberes|problema\s+\d+)\b"),
    re.compile(r"(?i)\b(qu[eé]\s+es\s+chatgpt|openai\s+vs|ignora\s+volty)\b"),
)


def _fold(text: str) -> str:
    folded = unicodedata.normalize("NFKD", text.lower())
    return "".join(ch for ch in folded if not unicodedata.combining(ch))


def _is_off_topic(text: str) -> bool:
    return any(pat.search(text) for pat in _OFF_TOPIC_PATTERNS) or any(
        topic in text for topic in _LIFE_TOPICS
    )


def off_topic_reply(message: str) -> str | None:
    """None = seguir con MATIAS; str = redirigir sin Gemini."""
    text = _fold(message.strip())
    if len(text) < 3:
        return None
    if any(hint in text for hint in _ENERGY_HINTS):
        return None
    if not _is_off_topic(text):
        return None

    body = choice(_GENERAL_REDIRECTS)
    if any(h in text for h in _COOKING_HINTS):
        return f"Je, de cocina no sé — {body[0].lower() + body[1:]}"
    return body
