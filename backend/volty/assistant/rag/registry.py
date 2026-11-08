from volty.assistant.rag.none import NullKnowledgeRetriever
from volty.core.config import settings


def get_retriever():
    if settings.matias_rag == "none":
        return NullKnowledgeRetriever()
    raise ValueError(f"MATIAS_RAG no soportado: {settings.matias_rag}")
