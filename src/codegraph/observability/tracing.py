"""Observability: OpenTelemetry tracing + Agent execution trace."""

from __future__ import annotations

import uuid
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Any, Generator

import structlog

logger = structlog.get_logger()


class SpanTracer:
    """Lightweight tracing for agent reasoning steps."""

    def __init__(self) -> None:
        self.spans: list[dict] = []

    @contextmanager
    def span(self, name: str, attributes: dict | None = None) -> Generator[dict, None, None]:
        span_data = {
            "name": name,
            "start_time": time.time(),
            "attributes": attributes or {},
            "status": "ok",
        }
        try:
            yield span_data
        except Exception as e:
            span_data["status"] = "error"
            span_data["error"] = str(e)
            raise
        finally:
            span_data["duration_ms"] = int((time.time() - span_data["start_time"]) * 1000)
            self.spans.append(span_data)
            logger.debug(
                "span_complete",
                span=name,
                duration_ms=span_data["duration_ms"],
                status=span_data["status"],
            )

    def get_trace(self) -> list[dict]:
        return self.spans.copy()

    def reset(self) -> None:
        self.spans.clear()


@dataclass
class ToolCallTrace:
    tool_name: str
    input_params: dict[str, Any]
    output_summary: str
    duration_ms: int
    success: bool


@dataclass
class LLMCallTrace:
    model: str
    prompt_tokens: int
    completion_tokens: int
    duration_ms: int
    has_tool_calls: bool


@dataclass
class AgentTrace:
    trace_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    question: str = ""
    state_transitions: list[str] = field(default_factory=list)
    tool_calls: list[ToolCallTrace] = field(default_factory=list)
    llm_calls: list[LLMCallTrace] = field(default_factory=list)
    final_answer: str = ""
    confidence: float = 0.0
    total_duration_ms: int = 0
    total_tokens: int = 0
    replan_count: int = 0

    def add_tool_call(self, name: str, params: dict, output: str, duration_ms: int, success: bool):
        self.tool_calls.append(ToolCallTrace(
            tool_name=name,
            input_params=params,
            output_summary=output[:200],
            duration_ms=duration_ms,
            success=success,
        ))

    def add_llm_call(self, model: str, prompt_tokens: int, completion_tokens: int, duration_ms: int, has_tool_calls: bool):
        self.llm_calls.append(LLMCallTrace(
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            duration_ms=duration_ms,
            has_tool_calls=has_tool_calls,
        ))
        self.total_tokens += prompt_tokens + completion_tokens

    def to_dict(self) -> dict[str, Any]:
        return {
            "trace_id": self.trace_id,
            "question": self.question,
            "state_transitions": self.state_transitions,
            "tool_calls": [
                {"name": t.tool_name, "duration_ms": t.duration_ms, "success": t.success}
                for t in self.tool_calls
            ],
            "llm_calls_count": len(self.llm_calls),
            "total_tokens": self.total_tokens,
            "total_duration_ms": self.total_duration_ms,
            "confidence": self.confidence,
            "replan_count": self.replan_count,
        }


_traces: dict[str, AgentTrace] = {}


def create_trace(question: str) -> AgentTrace:
    trace = AgentTrace(question=question)
    _traces[trace.trace_id] = trace
    return trace


def get_trace(trace_id: str) -> AgentTrace | None:
    return _traces.get(trace_id)
