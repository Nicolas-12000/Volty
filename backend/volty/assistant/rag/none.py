"""Sin RAG — retriever nulo (default)."""


class NullKnowledgeRetriever:
    def retrieve(self, query: str, *, limit: int = 5) -> list[str]:
        return []
