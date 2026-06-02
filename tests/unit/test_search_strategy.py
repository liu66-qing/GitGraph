"""Unit tests for search strategy components."""

import pytest

from codegraph.agent.search_strategy import RelevanceScorer, SaturationDetector


class TestRelevanceScorer:
    @pytest.fixture
    def scorer(self):
        return RelevanceScorer()

    def test_high_relevance(self, scorer):
        text = "伊朗向以色列发射导弹，美国协助拦截"
        context = {
            "entities": ["伊朗", "以色列", "美国"],
            "keywords": ["导弹", "拦截"],
        }
        score = scorer.score(text, context)
        assert score > 0.7

    def test_low_relevance(self, scorer):
        text = "今天天气晴朗，适合户外运动"
        context = {
            "entities": ["伊朗", "以色列", "美国"],
            "keywords": ["导弹", "冲突"],
        }
        score = scorer.score(text, context)
        assert score < 0.3

    def test_partial_relevance(self, scorer):
        text = "美国总统发表讲话，讨论经济政策"
        context = {
            "entities": ["美国", "伊朗", "以色列"],
            "keywords": ["制裁", "冲突"],
        }
        score = scorer.score(text, context)
        assert 0.1 < score < 0.6

    def test_empty_context(self, scorer):
        text = "任何文本"
        context = {"entities": [], "keywords": []}
        score = scorer.score(text, context)
        assert score == 0.0

    def test_threshold(self, scorer):
        assert scorer.RELEVANCE_THRESHOLD == 0.5


class TestSaturationDetector:
    def test_initial_state(self):
        detector = SaturationDetector()
        should_stop, reason = detector.should_stop(
            new_entities=["伊朗", "以色列", "美国"],
            new_relations=["伊朗-CONFLICT_WITH-以色列"],
        )
        assert not should_stop

    def test_stops_after_stale_rounds(self):
        detector = SaturationDetector()
        detector.should_stop(["A", "B"], ["A-R-B"])
        detector.should_stop([], [])
        should_stop, reason = detector.should_stop([], [])
        assert should_stop
        assert "饱和" in reason

    def test_stops_at_content_limit(self):
        detector = SaturationDetector()
        detector.MAX_CONTENT = 3
        detector.should_stop(["A"], ["R1"])
        detector.should_stop(["B"], ["R2"])
        should_stop, reason = detector.should_stop(["C"], ["R3"])
        assert should_stop
        assert "上限" in reason

    def test_resets_stale_counter_on_new_info(self):
        detector = SaturationDetector()
        detector.should_stop(["A"], [])
        detector.should_stop([], [])  # stale 1
        detector.should_stop(["B"], ["R1"])  # new info resets
        should_stop, _ = detector.should_stop([], [])  # stale 1 again
        assert not should_stop

    def test_core_dimensions_covered(self):
        detector = SaturationDetector()
        should_stop, reason = detector.should_stop(
            new_entities=["A", "B", "C"],
            new_relations=["R1", "R2", "R3", "R4", "R5"],
        )
        assert should_stop
        assert "覆盖" in reason
