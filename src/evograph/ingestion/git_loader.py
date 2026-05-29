"""Git history loader: walk a repository's commits and parse each snapshot.

This is the engine behind the "code documentary" capability — the thing a
static analyzer like GitNexus structurally cannot do. For every commit we
reconstruct the code graph *as it existed at that point in time*, which lets the
downstream layers answer "how did this function evolve?" and "which commit
introduced a breaking change?".

Implementation notes:
- Uses plain `git` via subprocess (no GitPython dependency) so it works
  anywhere git is installed.
- Reads file contents with `git show <rev>:<path>` instead of checking out, so
  it never mutates the working tree and is safe to run on a live repo.
- Parsing reuses the deterministic `code_parser`, so a "snapshot" is just a
  list of ParseResult — the same structure the rest of the pipeline consumes.
"""

from __future__ import annotations

import subprocess
from dataclasses import dataclass, field
from datetime import datetime, timezone

from evograph.ingestion.code_parser import parse_python_source, ParseResult


@dataclass
class CommitInfo:
    sha: str
    short_sha: str
    author: str
    email: str
    timestamp: datetime
    subject: str
    parent_sha: str = ""   # first parent; empty for the root commit


@dataclass
class CommitSnapshot:
    commit: CommitInfo
    parses: list[ParseResult] = field(default_factory=list)
    changed_files: list[str] = field(default_factory=list)  # .py paths touched by this commit


class GitHistoryError(RuntimeError):
    pass


def _run_git(repo_path: str, args: list[str], binary: bool = False) -> str | bytes:
    """Run a git command in repo_path and return stdout (text by default)."""
    try:
        proc = subprocess.run(
            ["git", "-C", repo_path, *args],
            capture_output=True,
            check=True,
        )
    except FileNotFoundError as exc:  # git not installed
        raise GitHistoryError("git executable not found on PATH") from exc
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.decode("utf-8", "replace") if exc.stderr else ""
        raise GitHistoryError(f"git {' '.join(args)} failed: {stderr.strip()}") from exc
    return proc.stdout if binary else proc.stdout.decode("utf-8", "replace")


def list_commits(repo_path: str, max_commits: int | None = None, branch: str = "HEAD") -> list[CommitInfo]:
    """Return commits oldest-first (chronological), so replaying them models
    forward evolution through time."""
    # Unit-separated fields, record-separated rows, to survive odd commit text.
    fmt = "%H%x1f%h%x1f%an%x1f%ae%x1f%aI%x1f%s%x1f%P"
    args = ["log", f"--pretty=format:{fmt}", branch]
    if max_commits:
        args.insert(1, f"-n{max_commits}")
    out = _run_git(repo_path, args)
    commits: list[CommitInfo] = []
    for line in out.splitlines():
        if not line.strip():
            continue
        parts = line.split("\x1f")
        if len(parts) < 6:
            continue
        sha, short, author, email, iso, subject = parts[:6]
        parents = parts[6].split() if len(parts) > 6 and parts[6].strip() else []
        first_parent = parents[0] if parents else ""
        try:
            ts = datetime.fromisoformat(iso)
        except ValueError:
            ts = datetime.now(timezone.utc)
        commits.append(
            CommitInfo(sha=sha, short_sha=short, author=author, email=email,
                       timestamp=ts, subject=subject, parent_sha=first_parent)
        )
    commits.reverse()  # oldest first
    if max_commits:
        commits = commits[-max_commits:]
    return commits


def _list_py_files_at(repo_path: str, rev: str) -> list[str]:
    """All .py files tracked at a given revision."""
    out = _run_git(repo_path, ["ls-tree", "-r", "--name-only", rev])
    return [p for p in out.splitlines() if p.endswith(".py")]


def _read_file_at(repo_path: str, rev: str, path: str) -> str | None:
    """File contents at a revision, or None if unreadable/binary."""
    try:
        raw = _run_git(repo_path, ["show", f"{rev}:{path}"], binary=True)
    except GitHistoryError:
        return None
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return None


def _changed_py_files(repo_path: str, rev: str) -> list[str]:
    """.py files changed by this commit relative to its first parent.
    For the root commit (no parent), returns all .py files."""
    try:
        out = _run_git(
            repo_path,
            ["diff-tree", "--no-commit-id", "--name-only", "-r", rev],
        )
    except GitHistoryError:
        return []
    return [p for p in out.splitlines() if p.endswith(".py")]


def _module_name(path: str, src_prefixes: tuple[str, ...]) -> str:
    """Turn a repo-relative file path into a dotted module name, stripping a
    leading src/-style prefix so module names match across the project."""
    p = path
    for prefix in src_prefixes:
        if p.startswith(prefix):
            p = p[len(prefix):]
            break
    if p.endswith(".py"):
        p = p[:-3]
    if p.endswith("/__init__"):
        p = p[: -len("/__init__")]
    return p.strip("/").replace("/", ".")


def load_commit_snapshot(
    repo_path: str,
    commit: CommitInfo,
    src_prefixes: tuple[str, ...] = ("src/", "lib/"),
    max_files: int | None = None,
) -> CommitSnapshot:
    """Parse every .py file as it existed at `commit`."""
    files = _list_py_files_at(repo_path, commit.sha)
    if max_files:
        files = files[:max_files]
    parses: list[ParseResult] = []
    for path in files:
        source = _read_file_at(repo_path, commit.sha, path)
        if source is None:
            continue
        module = _module_name(path, src_prefixes)
        parses.append(parse_python_source(source, module, path))
    changed = _changed_py_files(repo_path, commit.sha)
    return CommitSnapshot(commit=commit, parses=parses, changed_files=changed)


def iter_history(
    repo_path: str,
    max_commits: int | None = None,
    branch: str = "HEAD",
    src_prefixes: tuple[str, ...] = ("src/", "lib/"),
    max_files: int | None = None,
):
    """Yield CommitSnapshot for each commit, oldest first."""
    for commit in list_commits(repo_path, max_commits=max_commits, branch=branch):
        yield load_commit_snapshot(
            repo_path, commit, src_prefixes=src_prefixes, max_files=max_files
        )

