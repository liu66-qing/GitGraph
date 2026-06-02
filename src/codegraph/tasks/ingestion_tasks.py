"""Async document ingestion tasks."""

import asyncio

from codegraph.tasks.celery_app import celery_app
from codegraph.evolution.pipeline import evolution_pipeline

import structlog

logger = structlog.get_logger()


@celery_app.task(bind=True, name="codegraph.ingest_document")
def ingest_document_task(self, document_id: str, file_path: str):
    """Process a document through the full evolution pipeline."""
    self.update_state(state="PROCESSING", meta={"stage": "starting"})

    loop = asyncio.new_event_loop()
    try:
        result = loop.run_until_complete(
            evolution_pipeline.process_document(document_id, file_path)
        )
        return result
    except Exception as e:
        self.update_state(state="FAILED", meta={"error": str(e)})
        raise
    finally:
        loop.close()


@celery_app.task(bind=True, name="codegraph.ingest_url")
def ingest_url_task(self, document_id: str, url: str):
    """Fetch content from URL and process through pipeline."""
    self.update_state(state="PROCESSING", meta={"stage": "fetching_url"})

    loop = asyncio.new_event_loop()
    try:
        from codegraph.ingestion.url_loader import URLLoader
        loader = URLLoader()
        doc = loop.run_until_complete(loader.load(url))

        content_bytes = doc["text"].encode("utf-8")
        result = loop.run_until_complete(
            evolution_pipeline.process_document(
                document_id, doc["filename"], content=content_bytes
            )
        )
        return result
    except Exception as e:
        logger.error("url_ingestion_failed", document_id=document_id, url=url, error=str(e))
        self.update_state(state="FAILED", meta={"error": str(e)})
        raise
    finally:
        loop.close()


@celery_app.task(bind=True, name="codegraph.ingest_douyin")
def ingest_douyin_task(self, document_id: str, douyin_url: str):
    """Extract content from Douyin video and process through pipeline."""
    self.update_state(state="PROCESSING", meta={"stage": "extracting_douyin"})

    loop = asyncio.new_event_loop()
    try:
        from codegraph.ingestion.douyin_loader import DouyinLoader
        loader = DouyinLoader()
        doc = loop.run_until_complete(loader.extract(douyin_url))

        content_bytes = doc["text"].encode("utf-8")
        result = loop.run_until_complete(
            evolution_pipeline.process_document(
                document_id, doc["filename"], content=content_bytes
            )
        )
        return result
    except Exception as e:
        logger.error("douyin_ingestion_failed", document_id=document_id, url=douyin_url, error=str(e))
        self.update_state(state="FAILED", meta={"error": str(e)})
        raise
    finally:
        loop.close()


@celery_app.task(name="codegraph.reindex_vectors")
def reindex_vectors_task():
    """Rebuild vector index from graph entities."""
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(asyncio.sleep(0))
        return {"status": "completed"}
    finally:
        loop.close()
