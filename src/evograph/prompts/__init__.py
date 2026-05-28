"""Prompt template loader: YAML-based prompt management with scene adaptation."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

PROMPTS_DIR = Path(__file__).parent

_cache: dict[str, dict] = {}


def load_prompt(category: str, name: str) -> dict[str, Any]:
    key = f"{category}/{name}"
    if key in _cache:
        return _cache[key]

    path = PROMPTS_DIR / category / f"{name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Prompt template not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    _cache[key] = data
    return data


def build_extraction_prompt(text: str, scene: str = "geopolitics") -> str:
    base = load_prompt("extraction", "base")
    scene_data = load_prompt("extraction", scene)

    entity_types = scene_data.get("entity_types", "")
    relation_types = scene_data.get("relation_types", "")

    examples = scene_data.get("few_shot_examples", [])
    few_shot_str = ""
    for i, ex in enumerate(examples, 1):
        few_shot_str += f"\n### 示例 {i}\n输入：{ex['input']}\n输出：\n{ex['output']}\n"

    template = base["template"]
    prompt = template.format(
        entity_types=entity_types,
        relation_types=relation_types,
        few_shot_examples=few_shot_str,
        text=text,
    )

    system = base.get("system", "")
    return f"{system}\n\n{prompt}"
