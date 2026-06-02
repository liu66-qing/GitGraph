"""LLM-based entity and relation extraction with Chinese prompts and scene adaptation."""

from __future__ import annotations

import json
import re

import structlog

from codegraph.llm.client import llm_client
from codegraph.models.domain import ExtractedEntity, ExtractedRelation, ExtractionResult, EntityType
from codegraph.prompts import build_extraction_prompt

logger = structlog.get_logger()


class RobustJsonParser:
    """Parse LLM output that may not be clean JSON."""

    def parse(self, raw: str) -> dict | None:
        # Attempt 1: direct parse
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass

        # Attempt 2: extract ```json``` code block
        match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # Attempt 3: find outermost { ... }
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(raw[start:end + 1])
            except json.JSONDecodeError:
                pass

        return None


_parser = RobustJsonParser()


async def extract_from_chunk(
    chunk_text: str, document_id: str, chunk_id: str, scene: str = "geopolitics"
) -> ExtractionResult:
    prompt = build_extraction_prompt(chunk_text, scene=scene)

    try:
        response = await llm_client.chat_json(
            messages=[{"role": "user", "content": prompt}]
        )
        data = _parser.parse(response)
        if data is None:
            logger.warning("extraction_parse_failed", chunk_id=chunk_id, raw=response[:200])
            return ExtractionResult(entities=[], relations=[], document_id=document_id, chunk_id=chunk_id)
    except Exception as e:
        logger.error("extraction_failed", chunk_id=chunk_id, error=str(e))
        return ExtractionResult(entities=[], relations=[], document_id=document_id, chunk_id=chunk_id)

    entities = []
    for ent in data.get("entities", []):
        try:
            entity_type = EntityType(ent.get("type", "concept").lower())
        except ValueError:
            entity_type = EntityType.CONCEPT
        entities.append(ExtractedEntity(
            name=ent["name"],
            type=entity_type,
            aliases=ent.get("aliases", []),
            description=ent.get("description", ""),
        ))

    relations = []
    for rel in data.get("relations", []):
        relations.append(ExtractedRelation(
            source_entity=rel["source_entity"],
            target_entity=rel["target_entity"],
            relation_type=rel["relation_type"].upper(),
            temporal_start=rel.get("temporal_start"),
            temporal_end=rel.get("temporal_end"),
            confidence=float(rel.get("confidence", 0.8)),
        ))

    logger.info(
        "extraction_complete",
        chunk_id=chunk_id,
        entities=len(entities),
        relations=len(relations),
    )

    return ExtractionResult(
        entities=entities,
        relations=relations,
        document_id=document_id,
        chunk_id=chunk_id,
    )


async def extract_from_document(
    chunks: list[dict], document_id: str, scene: str = "geopolitics"
) -> list[ExtractionResult]:
    results = []
    for chunk in chunks:
        result = await extract_from_chunk(
            chunk_text=chunk["text"],
            document_id=document_id,
            chunk_id=chunk["id"],
            scene=scene,
        )
        results.append(result)
    return results
