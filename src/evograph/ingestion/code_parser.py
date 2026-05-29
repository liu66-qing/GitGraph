"""Deterministic Python code parser using the built-in `ast` module.

This is the structural backbone of the code-assistant pivot. Unlike the
LLM-based `extractor.py` (probabilistic, for natural-language documents), this
parser derives the code graph *deterministically* from the syntax tree — fast,
reproducible, and exact.

Extracted graph:
    Nodes  : Module / Class / Function / Method
    Edges  : DEFINES (module->class/func, class->method)
             IMPORTS (module->imported module)
             INHERITS (class->base class)
             CALLS   (function->called name)

Call targets are recorded as raw dotted names (e.g. "os.path.join"); resolving
them to fully-qualified node ids is a later phase and is intentionally kept out
of the parser so this stays pure and unit-testable without any database.
"""

from __future__ import annotations

import ast
from dataclasses import dataclass, field


# === Output data structures (database-agnostic, pure-Python) ===


@dataclass
class CodeNode:
    qualified_name: str          # "pkg.module.ClassName.method"
    simple_name: str             # "method"
    kind: str                    # module | class | function | method
    file_path: str
    line_start: int = 0
    line_end: int = 0
    signature: str = ""          # functions/methods only
    docstring: str = ""
    decorators: list[str] = field(default_factory=list)


@dataclass
class CodeEdge:
    source: str                  # qualified name of the source node
    target: str                  # qualified name OR raw dotted call/import name
    kind: str                    # DEFINES | IMPORTS | INHERITS | CALLS
    line: int = 0
    resolved: bool = False       # True once target maps to a known node id


@dataclass
class ParseResult:
    module_name: str
    file_path: str
    nodes: list[CodeNode] = field(default_factory=list)
    edges: list[CodeEdge] = field(default_factory=list)
    parse_error: str | None = None


# === Helpers ===


def _decorator_name(node: ast.expr) -> str:
    """Best-effort dotted name for a decorator expression."""
    return _dotted_name(node)


def _dotted_name(node: ast.expr | None) -> str:
    """Flatten an attribute/name chain into a dotted string.

    `os.path.join` -> "os.path.join"; `obj.method` -> "obj.method";
    `func` -> "func". Returns "" for things we can't statically name
    (subscripts, calls as the callee base, etc.).
    """
    if node is None:
        return ""
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        base = _dotted_name(node.value)
        return f"{base}.{node.attr}" if base else node.attr
    if isinstance(node, ast.Call):
        return _dotted_name(node.func)
    return ""


def _build_signature(fn: ast.FunctionDef | ast.AsyncFunctionDef) -> str:
    """Render a function signature string for diff/version comparison.

    The signature is the contract that downstream callers depend on, so it is
    the unit the conflict detector later watches for breaking changes.
    """
    a = fn.args
    parts: list[str] = []

    posonly = getattr(a, "posonlyargs", [])
    # `defaults` aligns to the right of the combined (posonlyargs + args) list.
    positional = list(posonly) + list(a.args)
    defaults_offset = len(positional) - len(a.defaults)
    rendered: list[str] = []
    for i, arg in enumerate(positional):
        if i >= defaults_offset:
            rendered.append(f"{arg.arg}=...")
        else:
            rendered.append(arg.arg)

    # Re-insert the positional-only marker "/" after the posonly group.
    if posonly:
        parts.extend(rendered[: len(posonly)])
        parts.append("/")
        parts.extend(rendered[len(posonly):])
    else:
        parts.extend(rendered)

    if a.vararg:
        parts.append(f"*{a.vararg.arg}")
    elif a.kwonlyargs:
        parts.append("*")

    for i, arg in enumerate(a.kwonlyargs):
        if a.kw_defaults[i] is not None:
            parts.append(f"{arg.arg}=...")
        else:
            parts.append(arg.arg)

    if a.kwarg:
        parts.append(f"**{a.kwarg.arg}")

    return f"{fn.name}({', '.join(parts)})"


def _iter_calls_excluding_nested_scopes(
    fn: ast.FunctionDef | ast.AsyncFunctionDef,
):
    """Yield ast.Call nodes in a function body, skipping nested def/class
    bodies so calls are attributed to the function that lexically contains
    them (not an enclosing one)."""
    boundary = (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)

    def _walk(node: ast.AST):
        for child in ast.iter_child_nodes(node):
            if isinstance(child, ast.Call):
                yield child
                # still descend into the call's arguments for nested calls
                for arg in ast.iter_child_nodes(child):
                    if not isinstance(arg, boundary):
                        yield from _walk(arg)
            elif isinstance(child, boundary):
                continue  # nested scope: handled separately
            else:
                yield from _walk(child)

    yield from _walk(fn)


# === Core visitor ===


class _CodeVisitor(ast.NodeVisitor):
    """Walks a module AST and emits CodeNode/CodeEdge records.

    Maintains a scope stack so nested defs get correct qualified names and
    DEFINES edges link to their lexical parent.
    """

    def __init__(self, module_name: str, file_path: str) -> None:
        self.module_name = module_name
        self.file_path = file_path
        self.nodes: list[CodeNode] = []
        self.edges: list[CodeEdge] = []
        self._scope: list[str] = [module_name]   # qualified-name stack
        self._kind_stack: list[str] = ["module"]  # parent kind stack

    @property
    def _current_qname(self) -> str:
        return self._scope[-1]

    def _qualify(self, name: str) -> str:
        return f"{self._current_qname}.{name}"

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            self.edges.append(
                CodeEdge(
                    source=self.module_name,
                    target=alias.name,
                    kind="IMPORTS",
                    line=node.lineno,
                )
            )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        module = node.module or ""
        prefix = "." * (node.level or 0)
        base = f"{prefix}{module}" if module else prefix
        for alias in node.names:
            target = f"{base}.{alias.name}" if base and not base.endswith(".") else f"{base}{alias.name}"
            self.edges.append(
                CodeEdge(
                    source=self.module_name,
                    target=target,
                    kind="IMPORTS",
                    line=node.lineno,
                )
            )
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        qname = self._qualify(node.name)
        self.nodes.append(
            CodeNode(
                qualified_name=qname,
                simple_name=node.name,
                kind="class",
                file_path=self.file_path,
                line_start=node.lineno,
                line_end=getattr(node, "end_lineno", node.lineno) or node.lineno,
                docstring=ast.get_docstring(node) or "",
                decorators=[_decorator_name(d) for d in node.decorator_list],
            )
        )
        self.edges.append(
            CodeEdge(source=self._current_qname, target=qname, kind="DEFINES", line=node.lineno)
        )
        for base in node.bases:
            base_name = _dotted_name(base)
            if base_name:
                self.edges.append(
                    CodeEdge(source=qname, target=base_name, kind="INHERITS", line=node.lineno)
                )

        self._scope.append(qname)
        self._kind_stack.append("class")
        self.generic_visit(node)
        self._kind_stack.pop()
        self._scope.pop()

    def _handle_function(self, node: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
        qname = self._qualify(node.name)
        kind = "method" if self._kind_stack[-1] == "class" else "function"
        self.nodes.append(
            CodeNode(
                qualified_name=qname,
                simple_name=node.name,
                kind=kind,
                file_path=self.file_path,
                line_start=node.lineno,
                line_end=getattr(node, "end_lineno", node.lineno) or node.lineno,
                signature=_build_signature(node),
                docstring=ast.get_docstring(node) or "",
                decorators=[_decorator_name(d) for d in node.decorator_list],
            )
        )
        self.edges.append(
            CodeEdge(source=self._current_qname, target=qname, kind="DEFINES", line=node.lineno)
        )

        # CALLS edges: scan the body for call expressions, but do NOT descend
        # into nested function/class bodies — those calls belong to the nested
        # scope and are captured when we recurse into them below.
        self._scope.append(qname)
        self._kind_stack.append(kind)
        for child in _iter_calls_excluding_nested_scopes(node):
            callee = _dotted_name(child.func)
            if callee:
                self.edges.append(
                    CodeEdge(
                        source=qname,
                        target=callee,
                        kind="CALLS",
                        line=getattr(child, "lineno", node.lineno),
                    )
                )
        # Recurse for nested defs/classes so they get their own nodes/edges.
        for stmt in node.body:
            self.visit(stmt)
        self._kind_stack.pop()
        self._scope.pop()

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._handle_function(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._handle_function(node)


# === Public API ===


def parse_python_source(
    source: str, module_name: str, file_path: str = ""
) -> ParseResult:
    """Parse Python source into a ParseResult. Never raises on bad syntax;
    instead returns a ParseResult with `parse_error` set."""
    result = ParseResult(module_name=module_name, file_path=file_path or module_name)

    # The module node itself.
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        result.parse_error = f"{exc.__class__.__name__}: {exc}"
        return result

    result.nodes.append(
        CodeNode(
            qualified_name=module_name,
            simple_name=module_name.rsplit(".", 1)[-1],
            kind="module",
            file_path=file_path or module_name,
            line_start=1,
            line_end=len(source.splitlines()) or 1,
            docstring=ast.get_docstring(tree) or "",
        )
    )

    visitor = _CodeVisitor(module_name, file_path or module_name)
    visitor.visit(tree)
    result.nodes.extend(visitor.nodes)
    result.edges.extend(visitor.edges)
    return result
