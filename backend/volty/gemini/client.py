"""Cliente HTTP único para Google Gemini (chat e intent estructurado)."""

from __future__ import annotations

from typing import Any

import httpx

from volty.core.config import settings

_API_ROOT = "https://generativelanguage.googleapis.com/v1beta"


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
        "generationConfig": {
            "temperature": temperature if temperature is not None else settings.gemini_temperature,
            "maxOutputTokens": max_output_tokens,
        },
    }
    try:
        with httpx.Client(timeout=45.0) as client:
            resp = client.post(url, params={"key": settings.gemini_api_key}, json=payload)
            resp.raise_for_status()
            parts = resp.json()["candidates"][0]["content"]["parts"]
            return parts[0]["text"].strip()
    except (httpx.HTTPError, KeyError, IndexError, TypeError):
        return None
