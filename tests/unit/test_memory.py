"""Unit tests for SessionMemory."""

import pytest

from evograph.agent.memory import SessionMemory, get_session


class TestSessionMemory:
    @pytest.fixture
    def memory(self):
        return SessionMemory(session_id="test-session")

    def test_add_turn(self, memory):
        memory.add_turn("伊朗和以色列什么关系？", "他们是对立关系", ["伊朗", "以色列"])
        assert len(memory.conversation_history) == 1
        assert memory.entity_focus["伊朗"] == 1
        assert memory.entity_focus["以色列"] == 1

    def test_entity_focus_accumulates(self, memory):
        memory.add_turn("Q1", "A1", ["伊朗", "以色列"])
        memory.add_turn("Q2", "A2", ["伊朗", "美国"])
        assert memory.entity_focus["伊朗"] == 2
        assert memory.entity_focus["以色列"] == 1
        assert memory.entity_focus["美国"] == 1

    def test_coreference_resolution(self, memory):
        memory.add_turn("伊朗做了什么？", "发射导弹", ["伊朗"])
        resolved = memory.resolve_coreference("他为什么这么做？")
        assert "伊朗" in resolved

    def test_coreference_no_pronouns(self, memory):
        memory.add_turn("Q", "A", ["伊朗"])
        resolved = memory.resolve_coreference("美国的立场是什么？")
        assert resolved == "美国的立场是什么？"

    def test_context_for_planning(self, memory):
        memory.add_turn("Q1", "A1", [])
        memory.add_turn("Q2", "A2", [])
        context = memory.get_context_for_planning()
        assert "Q1" in context
        assert "Q2" in context

    def test_empty_context(self, memory):
        assert memory.get_context_for_planning() == ""

    def test_recent_entities(self, memory):
        memory.add_turn("Q", "A", ["伊朗", "以色列"])
        assert memory.recent_entities == ["伊朗", "以色列"]


class TestGetSession:
    def test_creates_new_session(self):
        session = get_session("new-id-123")
        assert session.session_id == "new-id-123"

    def test_returns_existing_session(self):
        s1 = get_session("shared-id")
        s1.add_turn("Q", "A", ["X"])
        s2 = get_session("shared-id")
        assert len(s2.conversation_history) == 1
