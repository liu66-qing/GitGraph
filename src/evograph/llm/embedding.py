"""Embedding client supporting DashScope and OpenAI-compatible APIs."""

from __future__ import annotations

from openai import AsyncOpenAI
import structlog

from evograph.config import settings

logger = structlog.get_logger()


class EmbeddingClient:
    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            api_key=settings.embed_api_key,
            base_url=settings.embed_base_url,
        )
        self._model = settings.embed_model_name
        self._dimensions = settings.embed_dimensions

    async def embed(self, texts: list[str]) -> list[list[float]]:
        response = await self._client.embeddings.create(
            model=self._model,
            input=texts,
            dimensions=self._dimensions,
        )
        return [item.embedding for item in response.data]

    async def embed_single(self, text: str) -> list[float]:
        embeddings = await self.embed([text])
        return embeddings[0]


embedding_client = EmbeddingClient()
