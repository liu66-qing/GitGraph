"""Vector-based retriever using Qdrant."""

from __future__ import annotations

from typing import Any

import structlog

from codegraph.llm.embedding import embedding_client
from codegraph.storage.vector_store import vector_store

logger = structlog.get_logger()


class VectorRetriever:
    async def retrieve(
        self,
        query: str,
        n_results: int = 10,
        document_ids: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        query_embedding = await embedding_client.embed_single(query)

        where_filter = None
        if document_ids:
            where_filter = {"document_id": {"$in": document_ids}}

        results = vector_store.query(
            query_embedding=query_embedding,
            n_results=n_results,
            where=where_filter,
        )

        retrieved = []
        for hit in results:
            retrieved.append({
                "chunk_id": hit["id"],
                "text": hit["text"],
                "document_id": hit["metadata"].get("document_id", ""),
                "position": hit["metadata"].get("position", 0),
                "score": hit["score"],
            })

        logger.info("vector_retriever", query_len=len(query), results=len(retrieved))
        return retrieved


vector_retriever = VectorRetriever()
