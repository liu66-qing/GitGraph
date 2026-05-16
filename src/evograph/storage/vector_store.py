"""Vector store abstraction over Qdrant."""

from __future__ import annotations

from typing import Any

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchAny,
    PointStruct,
    VectorParams,
)
import structlog

from evograph.config import settings

logger = structlog.get_logger()

_DISTANCE_MAP = {
    "cosine": Distance.COSINE,
    "euclid": Distance.EUCLID,
    "dot": Distance.DOT,
}


class VectorStore:
    def __init__(self) -> None:
        self._client: QdrantClient | None = None

    def connect(self) -> None:
        if settings.qdrant_api_key:
            self._client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                timeout=settings.qdrant_timeout,
            )
        else:
            self._client = QdrantClient(
                url=settings.qdrant_url,
                timeout=settings.qdrant_timeout,
            )
        self._ensure_collection()
        logger.info("qdrant_connected", url=settings.qdrant_url)

    @property
    def client(self) -> QdrantClient:
        if not self._client:
            self.connect()
        return self._client  # type: ignore

    def _ensure_collection(self) -> None:
        collections = self.client.get_collections().collections
        names = [c.name for c in collections]
        if settings.qdrant_collection not in names:
            distance = _DISTANCE_MAP.get(settings.qdrant_distance, Distance.COSINE)
            self.client.create_collection(
                collection_name=settings.qdrant_collection,
                vectors_config=VectorParams(
                    size=settings.qdrant_vector_size,
                    distance=distance,
                ),
            )
            logger.info("qdrant_collection_created", name=settings.qdrant_collection)

    def add_documents(
        self,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict[str, Any]] | None = None,
    ) -> None:
        points = []
        for i, (doc_id, doc, emb) in enumerate(zip(ids, documents, embeddings)):
            payload: dict[str, Any] = {"text": doc}
            if metadatas and i < len(metadatas):
                payload.update(metadatas[i])
            points.append(PointStruct(id=doc_id, vector=emb, payload=payload))

        batch_size = 100
        for i in range(0, len(points), batch_size):
            self.client.upsert(
                collection_name=settings.qdrant_collection,
                points=points[i : i + batch_size],
            )

    def query(
        self,
        query_embedding: list[float],
        n_results: int = 10,
        where: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        query_filter = None
        if where:
            conditions = []
            for key, value in where.items():
                if isinstance(value, dict) and "$in" in value:
                    conditions.append(
                        FieldCondition(key=key, match=MatchAny(any=value["$in"]))
                    )
            if conditions:
                query_filter = Filter(must=conditions)

        results = self.client.search(
            collection_name=settings.qdrant_collection,
            query_vector=query_embedding,
            limit=n_results,
            query_filter=query_filter,
            with_payload=True,
        )

        return [
            {
                "id": str(hit.id),
                "text": hit.payload.get("text", "") if hit.payload else "",
                "score": hit.score,
                "metadata": {k: v for k, v in (hit.payload or {}).items() if k != "text"},
            }
            for hit in results
        ]

    def get_all_documents(self, limit: int = 1000) -> list[dict[str, Any]]:
        """Scroll through all documents for BM25 keyword search."""
        results = self.client.scroll(
            collection_name=settings.qdrant_collection,
            limit=limit,
            with_payload=True,
            with_vectors=False,
        )
        points = results[0]
        return [
            {
                "id": str(point.id),
                "text": point.payload.get("text", "") if point.payload else "",
                "metadata": {k: v for k, v in (point.payload or {}).items() if k != "text"},
            }
            for point in points
        ]

    def delete(self, ids: list[str]) -> None:
        from qdrant_client.models import PointIdsList
        self.client.delete(
            collection_name=settings.qdrant_collection,
            points_selector=PointIdsList(points=ids),
        )

    def health_check(self) -> bool:
        try:
            if self._client:
                self._client.get_collections()
                return True
            return False
        except Exception:
            return False


vector_store = VectorStore()
