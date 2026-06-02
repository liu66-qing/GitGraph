"""Unit tests for DouyinLoader text merging and reliability calculation."""

import pytest

from codegraph.ingestion.douyin_loader import DouyinLoader


@pytest.fixture
def loader():
    return DouyinLoader()


class TestDouyinMergeText:
    def test_full_metadata(self, loader):
        metadata = {
            "title": "重大突发",
            "description": "伊朗宣布反击",
            "author": "央视新闻",
            "publish_time": "20240414",
        }
        result = loader._merge_text(metadata, "这是口播内容")
        assert "【标题】重大突发" in result
        assert "【文案】伊朗宣布反击" in result
        assert "【视频口播内容】" in result
        assert "这是口播内容" in result
        assert "@央视新闻" in result

    def test_no_transcript(self, loader):
        metadata = {"title": "测试", "author": "用户A", "publish_time": "20240101"}
        result = loader._merge_text(metadata, "")
        assert "口播" not in result
        assert "【标题】测试" in result

    def test_empty_metadata(self, loader):
        result = loader._merge_text({}, "口播文本")
        assert "【视频口播内容】" in result
        assert "@未知" in result


class TestDouyinReliability:
    def test_verified_account(self, loader):
        metadata = {"is_verified": True, "like_count": 0}
        assert loader._calc_reliability(metadata) == 0.7

    def test_high_likes(self, loader):
        metadata = {"is_verified": False, "like_count": 200000}
        assert loader._calc_reliability(metadata) == 0.6

    def test_regular_account(self, loader):
        metadata = {"is_verified": False, "like_count": 500}
        assert loader._calc_reliability(metadata) == 0.4

    def test_empty_metadata(self, loader):
        assert loader._calc_reliability({}) == 0.4
