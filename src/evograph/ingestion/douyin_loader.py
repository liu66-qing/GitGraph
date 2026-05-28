"""Douyin video content extractor: link → metadata + ASR transcript."""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

import structlog

logger = structlog.get_logger()


class DouyinLoader:
    """
    Pipeline: parse link → get metadata (title + description + author)
    → download video → extract audio → ASR → merge all text.
    """

    async def extract(self, douyin_url: str) -> dict:
        metadata = await self._get_metadata(douyin_url)

        audio_path = await self._download_and_extract_audio(douyin_url)

        transcript = ""
        if audio_path:
            transcript = await self._transcribe(audio_path)
            try:
                audio_path.unlink(missing_ok=True)
                audio_path.parent.rmdir()
            except OSError:
                pass

        full_text = self._merge_text(metadata, transcript)

        return {
            "text": full_text,
            "filename": f"douyin_{metadata.get('video_id', 'unknown')}.txt",
            "metadata": {
                "source_type": "douyin",
                "source_url": douyin_url,
                "author": metadata.get("author", ""),
                "publish_time": metadata.get("publish_time", ""),
                "reliability_score": self._calc_reliability(metadata),
            },
        }

    async def _get_metadata(self, url: str) -> dict:
        """Use yt-dlp to get video metadata without downloading."""
        try:
            cmd = ["yt-dlp", "--dump-json", "--no-download", url]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                return {
                    "video_id": data.get("id", ""),
                    "title": data.get("title", ""),
                    "description": data.get("description", ""),
                    "author": data.get("uploader", ""),
                    "publish_time": data.get("upload_date", ""),
                    "duration": data.get("duration", 0),
                    "like_count": data.get("like_count", 0),
                    "is_verified": False,
                }
        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError) as e:
            logger.warning("douyin_metadata_failed", url=url, error=str(e))
        return {}

    async def _download_and_extract_audio(self, url: str) -> Path | None:
        """Download video and extract audio track."""
        tmp_dir = tempfile.mkdtemp(prefix="pulsegraph_audio_")
        audio_base = Path(tmp_dir) / "audio"

        try:
            cmd = [
                "yt-dlp", "-x",
                "--audio-format", "wav",
                "--audio-quality", "0",
                "-o", str(audio_base),
                url,
            ]
            subprocess.run(cmd, capture_output=True, timeout=120)
        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            logger.warning("douyin_audio_download_failed", url=url, error=str(e))
            return None

        for f in Path(tmp_dir).glob("audio.*"):
            return f
        return None

    async def _transcribe(self, audio_path: Path) -> str:
        """ASR speech-to-text via DashScope compatible API."""
        # Uses OpenAI-compatible whisper endpoint if configured,
        # otherwise returns empty (graceful degradation)
        try:
            from evograph.config import settings
            if not settings.embed_api_key:
                return ""

            import httpx
            async with httpx.AsyncClient(timeout=60) as client:
                with open(audio_path, "rb") as f:
                    resp = await client.post(
                        f"{settings.embed_base_url}/audio/transcriptions",
                        headers={"Authorization": f"Bearer {settings.embed_api_key}"},
                        files={"file": (audio_path.name, f, "audio/wav")},
                        data={"model": "whisper-1", "language": "zh"},
                    )
                if resp.status_code == 200:
                    return resp.json().get("text", "")
        except Exception as e:
            logger.warning("asr_transcription_failed", error=str(e))
        return ""

    def _merge_text(self, metadata: dict, transcript: str) -> str:
        parts = []
        if metadata.get("title"):
            parts.append(f"【标题】{metadata['title']}")
        if metadata.get("description"):
            parts.append(f"【文案】{metadata['description']}")
        if transcript:
            parts.append(f"【视频口播内容】\n{transcript}")
        parts.append(f"【来源】抖音 @{metadata.get('author', '未知')}")
        parts.append(f"【发布时间】{metadata.get('publish_time', '未知')}")
        return "\n\n".join(parts)

    def _calc_reliability(self, metadata: dict) -> float:
        if metadata.get("is_verified"):
            return 0.7
        if metadata.get("like_count", 0) > 100000:
            return 0.6
        return 0.4
