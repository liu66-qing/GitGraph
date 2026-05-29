"""Quick verification harness for code_parser (no DB, no pytest needed)."""

import sys
sys.path.insert(0, "/sessions/magical-confident-noether/mnt/RAG/src")

from evograph.ingestion.code_parser import parse_python_source

SAMPLE = '''
"""Sample module docstring."""
import os
from typing import List, Optional
from .utils import helper

GLOBAL = 1


class Animal:
    """Base animal."""

    def __init__(self, name):
        self.name = name

    def speak(self) -> str:
        return helper(self.name)


class Dog(Animal):
    def speak(self, loud=False, *args, **kwargs) -> str:
        result = os.path.join("a", "b")
        return self.bark(result)

    def bark(self):
        def _inner():
            return helper("inner")
        return _inner()


def top_level(a, b=2, /, c=3, *, d):
    return Dog(a).speak()
'''


def main():
    r = parse_python_source(SAMPLE, module_name="pkg.sample", file_path="pkg/sample.py")
    assert r.parse_error is None, r.parse_error

    print("=== NODES ===")
    for n in r.nodes:
        sig = f"  sig={n.signature}" if n.signature else ""
        print(f"[{n.kind:8}] {n.qualified_name}{sig}")

    print("\n=== EDGES ===")
    for e in r.edges:
        print(f"{e.kind:9} {e.source}  ->  {e.target}")

    # --- assertions ---
    names = {(n.kind, n.qualified_name) for n in r.nodes}
    assert ("module", "pkg.sample") in names
    assert ("class", "pkg.sample.Animal") in names
    assert ("class", "pkg.sample.Dog") in names
    assert ("method", "pkg.sample.Dog.speak") in names
    assert ("method", "pkg.sample.Dog.bark") in names
    assert ("function", "pkg.sample.top_level") in names
    # nested function inside bark should be a function node
    assert ("function", "pkg.sample.Dog.bark._inner") in names, "nested def missing"

    edges = {(e.kind, e.source, e.target) for e in r.edges}
    # imports
    assert ("IMPORTS", "pkg.sample", "os") in edges
    assert any(e[0] == "IMPORTS" and "helper" in e[2] for e in edges), "from-import missing"
    # inheritance
    assert ("INHERITS", "pkg.sample.Dog", "Animal") in edges
    # defines
    assert ("DEFINES", "pkg.sample", "pkg.sample.Dog") in edges
    assert ("DEFINES", "pkg.sample.Dog", "pkg.sample.Dog.speak") in edges
    # calls: Dog.speak calls os.path.join and self.bark
    assert ("CALLS", "pkg.sample.Dog.speak", "os.path.join") in edges
    assert ("CALLS", "pkg.sample.Dog.speak", "self.bark") in edges
    # the nested _inner's call to helper must be attributed to _inner, NOT bark
    assert ("CALLS", "pkg.sample.Dog.bark._inner", "helper") in edges, "nested call misattributed"
    assert ("CALLS", "pkg.sample.Dog.bark", "helper") not in edges, "leaked nested call into parent"
    # bark calls _inner()
    assert ("CALLS", "pkg.sample.Dog.bark", "_inner") in edges

    # signature check for breaking-change detection
    speak = next(n for n in r.nodes if n.qualified_name == "pkg.sample.Dog.speak")
    assert speak.signature == "speak(self, loud=..., *args, **kwargs)", speak.signature
    top = next(n for n in r.nodes if n.qualified_name == "pkg.sample.top_level")
    assert top.signature == "top_level(a, b=..., /, c=..., *, d)", top.signature

    # syntax error handling
    bad = parse_python_source("def (:\n  pass", "broken")
    assert bad.parse_error is not None

    print("\nALL ASSERTIONS PASSED")


if __name__ == "__main__":
    main()
