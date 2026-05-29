"""Breaking-change detector across git history.

This is the project's signature capability: by diffing the code graph between
consecutive commits, it pinpoints the exact commit where a function's contract
changed *while callers still depended on it* — an automatically located
breaking change. A static, single-snapshot analyzer cannot do this; it requires
the temporal dimension git history provides.

A change is only "breaking" if the symbol is still referenced by other symbols
in the repo. A signature change to a function nobody calls is harmless, so we
suppress it to keep signal high.

Output reuses the existing KnowledgeConflict domain model, so breaking changes
flow through the same conflict store, API, and UI the document pipeline uses.
"""

from __future__ import annotations

from dataclasses import dataclass

from evograph.ingestion.code_parser import ParseResult, CodeNode


@dataclass
class SymbolSnapshot:
    """A function/method's contract at one commit."""
    qualified_name: str
    signature: str
    kind: str            # function | method
    file_path: str


@dataclass
class BreakingChange:
    kind: str            # SIGNATURE_CHANGED | SYMBOL_REMOVED | REQUIRED_PARAM_ADDED
    qualified_name: str
    commit_sha: str
    commit_short: str
    commit_subject: str
    detail: str
    callers: list[str]   # qualified names of symbols that still call/reference it
    old_signature: str = ""
    new_signature: str = ""


def _index_callables(parses: list[ParseResult]) -> dict[str, SymbolSnapshot]:
    """Map qualified_name -> SymbolSnapshot for every function/method."""
    out: dict[str, SymbolSnapshot] = {}
    for p in parses:
        if p.parse_error:
            continue
        for n in p.nodes:
            if n.kind in ("function", "method"):
                out[n.qualified_name] = SymbolSnapshot(
                    qualified_name=n.qualified_name,
                    signature=n.signature,
                    kind=n.kind,
                    file_path=n.file_path,
                )
    return out


def _index_callers(parses: list[ParseResult]) -> dict[str, list[str]]:
    """Map a called qualified_name -> list of caller qualified_names.

    Relies on the resolved CALLS edges produced later by the adapter? No — here
    we work directly off raw edges, matching call targets by their *simple* name
    against known callables, because at history-replay time we want a cheap,
    snapshot-local notion of "is anyone calling this".
    """
    # Build simple-name -> qualified-name(s) for callables in this snapshot.
    simple_to_q: dict[str, list[str]] = {}
    for p in parses:
        if p.parse_error:
            continue
        for n in p.nodes:
            if n.kind in ("function", "method"):
                simple_to_q.setdefault(n.simple_name, []).append(n.qualified_name)

    callers: dict[str, list[str]] = {}
    for p in parses:
        if p.parse_error:
            continue
        for e in p.edges:
            if e.kind != "CALLS":
                continue
            target_simple = e.target.rsplit(".", 1)[-1]
            for q in simple_to_q.get(target_simple, []):
                if q == e.source:
                    continue  # ignore self-recursion noise
                callers.setdefault(q, [])
                if e.source not in callers[q]:
                    callers[q].append(e.source)
    return callers


def _required_param_count(signature: str) -> int:
    """Count required positional params in a signature string like
    'f(a, b=..., *args)'. Required = no default, not *args/**kwargs/markers,
    and not 'self'/'cls'."""
    inner = signature[signature.find("(") + 1 : signature.rfind(")")]
    if not inner.strip():
        return 0
    count = 0
    for raw in inner.split(","):
        tok = raw.strip()
        if not tok or tok in ("/", "*"):
            continue
        if tok.startswith("*"):
            continue
        if "=" in tok:
            continue
        if tok in ("self", "cls"):
            continue
        count += 1
    return count


def diff_snapshots(
    old_parses: list[ParseResult],
    new_parses: list[ParseResult],
    commit_sha: str,
    commit_short: str,
    commit_subject: str,
) -> list[BreakingChange]:
    """Compare two consecutive snapshots and return breaking changes detected
    in the transition old -> new. Callers are evaluated in the NEW snapshot —
    those are the dependents that would actually break going forward."""
    old_syms = _index_callables(old_parses)
    new_syms = _index_callables(new_parses)
    new_callers = _index_callers(new_parses)
    # For removed symbols, callers must be looked up in the OLD snapshot
    # (they may have been removed too, but a still-present caller is the danger).
    old_callers = _index_callers(old_parses)

    changes: list[BreakingChange] = []

    for qname, old in old_syms.items():
        new = new_syms.get(qname)

        # --- Case 1: symbol removed entirely ---
        if new is None:
            callers = [c for c in old_callers.get(qname, []) if c in new_syms or c in old_syms]
            # Only breaking if something still references it.
            still_calling = old_callers.get(qname, [])
            if still_calling:
                changes.append(BreakingChange(
                    kind="SYMBOL_REMOVED",
                    qualified_name=qname,
                    commit_sha=commit_sha,
                    commit_short=commit_short,
                    commit_subject=commit_subject,
                    detail=f"{old.kind} '{qname}' was removed but {len(still_calling)} caller(s) still reference it",
                    callers=still_calling,
                    old_signature=old.signature,
                    new_signature="",
                ))
            continue

        # --- Case 2 & 3: signature changed ---
        if old.signature != new.signature:
            callers = new_callers.get(qname, [])
            if not callers:
                continue  # signature changed but nobody calls it -> not breaking

            old_req = _required_param_count(old.signature)
            new_req = _required_param_count(new.signature)
            if new_req > old_req:
                kind = "REQUIRED_PARAM_ADDED"
                detail = (
                    f"required params {old_req} -> {new_req}; "
                    f"{len(callers)} caller(s) may now pass too few arguments"
                )
            else:
                kind = "SIGNATURE_CHANGED"
                detail = (
                    f"signature changed; {len(callers)} caller(s) depend on the old contract"
                )
            changes.append(BreakingChange(
                kind=kind,
                qualified_name=qname,
                commit_sha=commit_sha,
                commit_short=commit_short,
                commit_subject=commit_subject,
                detail=detail,
                callers=callers,
                old_signature=old.signature,
                new_signature=new.signature,
            ))

    return changes


def scan_history(snapshots) -> list[BreakingChange]:
    """Walk an ordered (oldest-first) iterable of CommitSnapshot and collect all
    breaking changes across the full history.

    `snapshots` items must expose `.commit` (with sha/short_sha/subject) and
    `.parses`. Kept loosely typed to avoid a hard import cycle with git_loader.
    """
    all_changes: list[BreakingChange] = []
    prev = None
    for snap in snapshots:
        if prev is not None:
            all_changes.extend(diff_snapshots(
                prev.parses,
                snap.parses,
                commit_sha=snap.commit.sha,
                commit_short=snap.commit.short_sha,
                commit_subject=snap.commit.subject,
            ))
        prev = snap
    return all_changes

