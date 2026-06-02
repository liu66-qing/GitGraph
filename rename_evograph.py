#!/usr/bin/env python3
"""Batch replace codegraph -> codegraph in all source files."""
import os
from pathlib import Path

ROOT = Path(__file__).parent
EXTENSIONS = {".py", ".ts", ".tsx", ".json", ".md", ".txt", ".toml", ".yaml", ".yml"}
EXCLUDE_DIRS = {".git", ".cache", ".chrome-temp", ".chrome-temp2", ".chrome-temp3",
                ".chrome-temp4", "node_modules", "__pycache__", ".claude"}

def should_process(path: Path) -> bool:
    if any(excl in path.parts for excl in EXCLUDE_DIRS):
        return False
    return path.suffix in EXTENSIONS

def replace_in_file(path: Path):
    try:
        content = path.read_text(encoding="utf-8")
        if "codegraph" not in content.lower():
            return

        new_content = content.replace("codegraph", "codegraph").replace("CodeGraph", "CodeGraph")

        if new_content != content:
            path.write_text(new_content, encoding="utf-8")
            print(f"OK {path.relative_to(ROOT)}")
    except Exception as e:
        print(f"FAIL {path.relative_to(ROOT)}: {e}")

def main():
    count = 0
    for path in ROOT.rglob("*"):
        if path.is_file() and should_process(path):
            replace_in_file(path)
            count += 1
    print(f"\nProcessed {count} files")

if __name__ == "__main__":
    main()
