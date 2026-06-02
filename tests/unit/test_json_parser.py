"""Unit tests for RobustJsonParser."""

import pytest

from codegraph.evolution.extractor import RobustJsonParser


@pytest.fixture
def parser():
    return RobustJsonParser()


class TestRobustJsonParser:
    def test_valid_json(self, parser):
        raw = '{"entities": [], "relations": []}'
        result = parser.parse(raw)
        assert result == {"entities": [], "relations": []}

    def test_json_in_code_block(self, parser):
        raw = '```json\n{"entities": [{"name": "伊朗"}], "relations": []}\n```'
        result = parser.parse(raw)
        assert result["entities"][0]["name"] == "伊朗"

    def test_json_with_surrounding_text(self, parser):
        raw = 'Here is the result:\n{"entities": [], "relations": [{"source_entity": "A", "target_entity": "B"}]}\nDone.'
        result = parser.parse(raw)
        assert len(result["relations"]) == 1

    def test_completely_invalid(self, parser):
        raw = "This is not JSON at all"
        result = parser.parse(raw)
        assert result is None

    def test_nested_braces(self, parser):
        raw = '{"entities": [{"name": "test", "aliases": ["a", "b"]}], "relations": []}'
        result = parser.parse(raw)
        assert result["entities"][0]["aliases"] == ["a", "b"]

    def test_code_block_without_json_tag(self, parser):
        raw = '```\n{"entities": [], "relations": []}\n```'
        result = parser.parse(raw)
        assert result == {"entities": [], "relations": []}
