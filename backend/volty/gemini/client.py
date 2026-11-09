"""Cliente HTTP único para Google Gemini (chat e intent estructurado)."""

from __future__ import annotations

from typing import Any

import httpx

from volty.core.config import settings

_API_ROOT = "https://generativelanguage.googleapis.com/v1beta"


def generation_config(
    *,
    temperature: float | None,
    max_output_tokens: int,
    model: str | None = None,
) -> dict[str, Any]:
    """Gemini 3 piensa en alto por defecto y ese razonamiento comparte maxOutputTokens.

    Con el cupo de un chat (~900), el pensamiento se come casi todo y la frase
    visible se corta a mitad (p. ej. en la primera carga). MINIMAL deja el cupo
    para el texto. Temperatura < 1 en Gemini 3 también alarga o corta la salida.
    """
    chosen = model if model is not None else settings.gemini_model
    config: dict[str, Any] = {"maxOutputTokens": max_output_tokens}
    if "gemini-3" in chosen:
        config["thinkingConfig"] = {"thinkingLevel": "MINIMAL"}
        config["temperature"] = 1.0
        return config
    config["temperature"] = temperature if temperature is not None else settings.gemini_temperature
    if "2.5" in chosen:
        config["thinkingConfig"] = {"thinkingBudget": 0}
    return config


def text_from_candidate(candidate: dict[str, Any]) -> str | None:
    """Texto visible. Ignora partes de pensamiento y descarta cortes por MAX_TOKENS."""
    if candidate.get("finishReason") == "MAX_TOKENS":
        return None
    parts = (candidate.get("content") or {}).get("parts") or []
    chunks: list[str] = []
    for part in parts:
        if not isinstance(part, dict) or part.get("thought"):
            continue
        text = part.get("text")
        if isinstance(text, str) and text.strip():
            chunks.append(text.strip())
    if not chunks:
        return None
    return "\n".join(chunks)


def generate_content(
    *,
    system_instruction: str,
    contents: list[dict[str, Any]],
    temperature: float | None = None,
    max_output_tokens: int = 900,
) -> str | None:
    if not settings.gemini_api_key:
        return None

    url = f"{_API_ROOT}/models/{settings.gemini_model}:generateContent"
    payload: dict[str, Any] = {
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "contents": contents,
        "generationConfig": generation_config(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
        ),
    }
    try:
        with httpx.Client(timeout=45.0) as client:
            resp = client.post(url, params={"key": settings.gemini_api_key}, json=payload)
            resp.raise_for_status()
            return text_from_candidate(resp.json()["candidates"][0])
    except (httpx.HTTPError, KeyError, IndexError, TypeError):
        return None
