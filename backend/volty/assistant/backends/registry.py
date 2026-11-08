from volty.assistant.backends.gemini_backend import GeminiAssistantBackend
from volty.assistant.backends.rules import RulesAssistantBackend
from volty.assistant.ports import AssistantBackend
from volty.core.config import settings


def get_assistant_backend() -> AssistantBackend:
    backend = settings.matias_backend.lower()
    if backend == "gemini" and settings.gemini_api_key:
        return GeminiAssistantBackend()
    return RulesAssistantBackend()
