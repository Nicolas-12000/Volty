from volty.gemini.client import generation_config, text_from_candidate


def test_gemini3_reserves_output_budget_for_the_answer() -> None:
    config = generation_config(temperature=0.1, max_output_tokens=900, model="gemini-3-flash-preview")
    assert config["thinkingConfig"] == {"thinkingLevel": "MINIMAL"}
    assert config["temperature"] == 1.0
    assert config["maxOutputTokens"] == 900


def test_truncated_reply_is_dropped() -> None:
    cut = text_from_candidate(
        {
            "finishReason": "MAX_TOKENS",
            "content": {
                "parts": [
                    {"text": "Hola. He actualizado el borrador con las 4 cargas:\n\n1. Coche eléctrico: 12 kWh ("}
                ]
            },
        }
    )
    assert cut is None


def test_visible_text_skips_thought_parts() -> None:
    text = text_from_candidate(
        {
            "finishReason": "STOP",
            "content": {
                "parts": [
                    {"thought": True, "text": "razonamiento interno"},
                    {"text": "Borrador con lavadora, secadora, coche y lavavajillas."},
                ]
            },
        }
    )
    assert text == "Borrador con lavadora, secadora, coche y lavavajillas."
