"""URL content loader: news article URL → extracted text."""

from __future__ import annotations

import hashlib

import httpx
from bs4 import BeautifulSoup
import structlog

logger = structlog.get_logger()


class URLLoader:
    TIMEOUT = 15
    REMOVE_TAGS = ["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"]

    async def load(self, url: str) -> dict:
        async with httpx.AsyncClient(follow_redirects=True, timeout=self.TIMEOUT) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0 PulseGraph/1.0"})
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(self.REMOVE_TAGS):
            tag.decompose()

        title = soup.find("title").get_text(strip=True) if soup.find("title") else ""
        text = soup.get_text(separator="\n", strip=True)
        text = "\n".join(line for line in text.splitlines() if line.strip())

        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]

        return {
            "text": f"标题：{title}\n\n{text}",
            "filename": f"url_{url_hash}.txt",
            "metadata": {
                "source_type": "web_article",
                "source_url": url,
                "title": title,
                "reliability_score": 0.8,
            },
        }
