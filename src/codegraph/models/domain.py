"""Core domain entities for CodeGraph."""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class EntityType(str, Enum):
    PERSON = "person"
    ORGANIZATION = "organization"
    COUNTRY = "country"
    LOCATION = "location"
    EVENT = "event"
    WORK = "work"
    MILITARY = "military"
    CONCEPT = "concept"
    MEDIA = "media"
    PRODUCT = "product"
    TECHNOLOGY = "technology"
    # === Code-assistant entity types (deterministic AST extraction) ===
    MODULE = "module"
    CLASS = "class"
    FUNCTION = "function"
    METHOD = "method"


class ConflictType(str, Enum):
    TEMPORAL_OVERLAP = "temporal_overlap"
    LOGICAL_CONTRADICTION = "logical_contradiction"
    SOURCE_DISAGREEMENT = "source_disagreement"


class ConflictStatus(str, Enum):
    OPEN = "open"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class QueryIntent(str, Enum):
    FACTUAL = "factual"
    TEMPORAL = "temporal"
    CAUSAL = "causal"
    COMPARATIVE = "comparative"
    EXPLORATORY = "exploratory"


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    EXTRACTING = "extracting"
    MERGING = "merging"
    COMPLETED = "completed"
    FAILED = "failed"


class SourceType(str, Enum):
    WEB_ARTICLE = "web_article"
    DOUYIN = "douyin"
    FILE_UPLOAD = "file_upload"
    MANUAL_INPUT = "manual_input"


SOURCE_RELIABILITY = {
    "official_statement": 0.95,
    "major_news_agency": 0.9,
    "mainstream_media": 0.8,
    "regional_media": 0.7,
    "douyin_verified_media": 0.7,
    "douyin_kol": 0.5,
    "douyin_personal": 0.4,
    "social_media": 0.3,
}

UNIVERSAL_RELATIONS = {
    "CAUSED", "RESPONDED_TO", "PRECEDED_BY", "RELATED_TO",
}

PERSON_RELATIONS = {
    "LEADER_OF", "MEMBER_OF", "ALLIED_WITH", "CONFLICT_WITH",
    "FAMILY_OF", "DATING", "EX_PARTNER", "MENTORED_BY",
}

GEOPOLITICS_RELATIONS = {
    "SANCTIONED", "SUPPLIED_WEAPONS_TO", "NEGOTIATED_WITH",
    "CONDEMNED", "SUPPORTS", "OPPOSES", "ESCALATED_TO",
}

FICTION_RELATIONS = {
    "PLAYED_BY", "ADAPTED_FROM", "APPEARS_IN",
}

# === Code-assistant relation types (deterministic AST extraction) ===
CODE_RELATIONS = {
    "DEFINES",   # module defines class/function; class defines method
    "IMPORTS",   # module imports another module/symbol
    "INHERITS",  # class inherits from base class
    "CALLS",     # function/method calls another callable
}

ALL_RELATION_TYPES = UNIVERSAL_RELATIONS | PERSON_RELATIONS | GEOPOLITICS_RELATIONS | FICTION_RELATIONS

SINGULAR_RELATIONS = {"LEADER_OF", "DATING", "MARRIED_TO"}

INVERSE_PAIRS = {
    "ALLIED_WITH": "CONFLICT_WITH",
    "SUPPORTS": "OPPOSES",
    "SANCTIONED": "SUPPLIED_WEAPONS_TO",
}


# === Graph Domain Models ===


class GraphEntity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: EntityType
    aliases: list[str] = Field(default_factory=list)
    description: str = ""
    properties: dict[str, str | int | float | bool] = Field(default_factory=dict)
    first_seen: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class GraphRelation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_id: str
    target_id: str
    relation_type: str
    properties: dict[str, str | int | float | bool] = Field(default_factory=dict)
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    observed_at: datetime = Field(default_factory=datetime.utcnow)
    confidence: float = 1.0
    source_ids: list[str] = Field(default_factory=list)
    is_active: bool = True


class KnowledgeConflict(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: ConflictType
    status: ConflictStatus = ConflictStatus.OPEN
    description: str
    fact_a: GraphRelation
    fact_b: GraphRelation
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: datetime | None = None
    resolution_note: str | None = None


class ProvenanceRecord(BaseModel):
    fact_id: str
    document_id: str
    chunk_id: str
    chunk_text: str
    confidence: float
    extracted_at: datetime


# === Agent Domain Models ===


class ReasoningStep(BaseModel):
    step_id: int
    action: str
    tool: str
    input_params: dict[str, str | int | float | bool | list[str]] = Field(default_factory=dict)
    output_summary: str = ""
    confidence: float = 0.0
    duration_ms: int = 0


class AgentResponse(BaseModel):
    answer: str
    confidence: float
    reasoning_trace: list[ReasoningStep] = Field(default_factory=list)
    sources: list[ProvenanceRecord] = Field(default_factory=list)
    conflicts: list[KnowledgeConflict] = Field(default_factory=list)
    entities_referenced: list[str] = Field(default_factory=list)



# === Extraction Models ===


class ExtractedEntity(BaseModel):
    name: str
    type: EntityType
    aliases: list[str] = Field(default_factory=list)
    description: str = ""
    # Optional extra node properties (e.g. repo_id, signature for code nodes).
    # Document extraction leaves this empty; the code pipeline fills it so code
    # nodes can be queried per-repo and rendered with their signature.
    metadata: dict = Field(default_factory=dict)


class ExtractedRelation(BaseModel):
    source_entity: str
    target_entity: str
    relation_type: str
    temporal_start: str | None = None
    temporal_end: str | None = None
    confidence: float = 1.0


class ExtractionResult(BaseModel):
    entities: list[ExtractedEntity]
    relations: list[ExtractedRelation]
    document_id: str
    chunk_id: str
