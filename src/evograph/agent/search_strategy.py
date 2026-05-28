"""Active information completion: generate search plans from seed content."""

from __future__ import annotations

import json

import structlog

from evograph.llm.client import llm_client

logger = structlog.get_logger()

SEARCH_STRATEGY_PROMPT = """你是一个信息检索规划器。用户提供了一条关于某事件的信息，你需要规划搜索策略来补全事件全貌。

种子内容摘要：{seed_summary}
已提取的核心实体：{entities}
已提取的核心事件：{events}

请生成搜索计划，目标是覆盖以下维度：
1. 事件本身的权威报道
2. 核心人物的相关动态
3. 事件的前因（背景/导火索）
4. 事件的后续发展
5. 各方立场和回应

输出 JSON：
{{
  "queries": [
    {{"keywords": "搜索关键词", "purpose": "搜索目的", "source_type": "news", "priority": 1}}
  ]
}}

规则：
- 最多生成 8 条搜索查询
- priority 1-3，1 最高
- 优先搜索权威来源
- 只输出 JSON，不要其他内容"""


class SearchStrategyGenerator:
    async def generate(self, seed_content: dict) -> list[dict]:
        prompt = SEARCH_STRATEGY_PROMPT.format(
            seed_summary=seed_content.get("summary", ""),
            entities=seed_content.get("entities", []),
            events=seed_content.get("events", []),
        )
        try:
            response = await llm_client.chat_json(
                messages=[{"role": "user", "content": prompt}]
            )
            data = json.loads(response)
            queries = data.get("queries", [])
            return sorted(queries, key=lambda q: q.get("priority", 3))
        except (json.JSONDecodeError, Exception) as e:
            logger.error("search_strategy_generation_failed", error=str(e))
            return []


class RelevanceScorer:
    """Score candidate content relevance to the seed event."""

    RELEVANCE_THRESHOLD = 0.5

    def score(self, candidate_text: str, seed_context: dict) -> float:
        entities = seed_context.get("entities", [])
        keywords = seed_context.get("keywords", [])

        entity_overlap = self._entity_overlap(candidate_text, entities)
        keyword_match = self._keyword_match(candidate_text, keywords)

        return 0.5 * entity_overlap + 0.5 * keyword_match

    def _entity_overlap(self, text: str, entities: list[str]) -> float:
        if not entities:
            return 0.0
        matches = sum(1 for e in entities if e in text)
        return matches / len(entities)

    def _keyword_match(self, text: str, keywords: list[str]) -> float:
        if not keywords:
            return 0.0
        matches = sum(1 for k in keywords if k in text)
        return min(matches / max(len(keywords), 1), 1.0)


class SaturationDetector:
    """Determine when to stop searching based on information gain."""

    MAX_CONTENT = 15
    MAX_ROUNDS = 4
    STALE_THRESHOLD = 2
    TIMEOUT_SECONDS = 180

    def __init__(self):
        self.known_entities: set[str] = set()
        self.known_relations: set[str] = set()
        self.rounds_without_gain = 0
        self.total_processed = 0

    def should_stop(self, new_entities: list[str], new_relations: list[str]) -> tuple[bool, str]:
        fresh_entities = set(new_entities) - self.known_entities
        fresh_relations = set(new_relations) - self.known_relations

        self.known_entities.update(fresh_entities)
        self.known_relations.update(fresh_relations)
        self.total_processed += 1

        info_gain = len(fresh_entities) + len(fresh_relations)

        if info_gain == 0:
            self.rounds_without_gain += 1
        else:
            self.rounds_without_gain = 0

        if self.rounds_without_gain >= self.STALE_THRESHOLD:
            return True, "信息饱和：连续2轮无新发现"
        if self.total_processed >= self.MAX_CONTENT:
            return True, f"达到内容上限：{self.MAX_CONTENT}条"
        if len(self.known_entities) >= 3 and len(self.known_relations) >= 5:
            return True, "核心维度已覆盖"

        return False, ""
