"""Code repository analysis endpoints.

Accepts a local git repository path, walks its history, builds the code graph,
and detects breaking changes. This is the code-assistant entry point, parallel
to the document ingestion endpoints.
"""

from __future__ import annotations

import os
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import structlog

from evograph.graph.neo4j_client import neo4j_client

logger = structlog.get_logger()
router = APIRouter()


class AnalyzeRepoRequest(BaseModel):
    repo_path: str
    repo_id: str | None = None
    max_commits: int | None = None


class AnalyzeRepoResponse(BaseModel):
    repo_id: str
    status: str
    repo_path: str


@router.post("", response_model=AnalyzeRepoResponse)
async def analyze_repository(req: AnalyzeRepoRequest) -> AnalyzeRepoResponse:
    """Dispatch async analysis of a local git repository."""
    if not os.path.isdir(req.repo_path):
        raise HTTPException(status_code=400, detail=f"Path not found: {req.repo_path}")
    if not os.path.isdir(os.path.join(req.repo_path, ".git")):
        raise HTTPException(status_code=400, detail="Path is not a git repository (.git not found)")

    repo_id = req.repo_id or f"repo_{uuid.uuid4().hex[:8]}"

    from evograph.tasks.code_tasks import analyze_repository_task
    analyze_repository_task.delay(repo_id, req.repo_path, req.max_commits)

    logger.info("repo_analysis_started", repo_id=repo_id, repo_path=req.repo_path)
    return AnalyzeRepoResponse(repo_id=repo_id, status="processing", repo_path=req.repo_path)


@router.get("")
async def list_repositories() -> dict:
    """List repositories that have been analyzed (have code entities or commits)."""
    try:
        rows = await neo4j_client.execute_query(
            """
            MATCH (e:Entity)
            WHERE e.repo_id IS NOT NULL
            WITH e.repo_id AS repo_id, count(e) AS nodes
            OPTIONAL MATCH (cm:Commit {repo_id: repo_id})
            WITH repo_id, nodes, count(cm) AS commits
            RETURN repo_id, nodes, commits
            ORDER BY nodes DESC
            LIMIT 100
            """
        )
        return {"repositories": rows, "total": len(rows)}
    except Exception as exc:  # Neo4j down — degrade gracefully, never 500.
        logger.warning("list_repositories_failed", error=str(exc))
        return {"repositories": [], "total": 0}


@router.get("/{repo_id}/graph")
async def get_repo_graph(repo_id: str, limit: int = 300) -> dict:
    """Return the code graph (nodes + edges) for a repo, shaped for the frontend
    force-directed view. Nodes are code symbols; edges are CALLS/IMPORTS/etc."""
    try:
        nodes = await neo4j_client.execute_query(
            """
            MATCH (e:Entity {repo_id: $repo_id})
            RETURN e.id AS id, e.name AS name, e.code_kind AS kind,
                   e.signature AS signature, e.file_path AS file_path
            LIMIT $limit
            """,
            {"repo_id": repo_id, "limit": limit},
        )
        edges = await neo4j_client.execute_query(
            """
            MATCH (s:Entity {repo_id: $repo_id})-[r:RELATION]->(t:Entity {repo_id: $repo_id})
            RETURN s.name AS source, t.name AS target, r.type AS type
            LIMIT $limit
            """,
            {"repo_id": repo_id, "limit": limit},
        )
        return {"repo_id": repo_id, "nodes": nodes, "edges": edges}
    except Exception as exc:
        logger.warning("get_repo_graph_failed", repo_id=repo_id, error=str(exc))
        return {"repo_id": repo_id, "nodes": [], "edges": []}


@router.get("/{repo_id}/commits")
async def get_repo_commits(repo_id: str) -> dict:
    """Return the commit history (oldest-first) with per-commit counts and a flag
    for whether the commit introduced any breaking change — drives the Timeline."""
    try:
        rows = await neo4j_client.execute_query(
            """
            MATCH (cm:Commit {repo_id: $repo_id})
            OPTIONAL MATCH (cf:Conflict {kind: 'breaking_change'})-[:INTRODUCED_IN]->(cm)
            WITH cm, count(cf) AS breaking
            RETURN cm.sha AS sha, cm.short_sha AS short_sha, cm.subject AS subject,
                   cm.author AS author, cm.timestamp AS timestamp,
                   cm.callable_count AS callables, cm.file_count AS files,
                   breaking AS breaking_changes
            ORDER BY cm.timestamp ASC
            LIMIT 500
            """,
            {"repo_id": repo_id},
        )
        return {"repo_id": repo_id, "commits": rows, "total": len(rows)}
    except Exception as exc:
        logger.warning("get_repo_commits_failed", repo_id=repo_id, error=str(exc))
        return {"repo_id": repo_id, "commits": [], "total": 0}


@router.get("/{repo_id}/breaking-changes")
async def get_breaking_changes(repo_id: str) -> dict:
    """List detected breaking changes for a repo, newest commit first."""
    try:
        rows = await neo4j_client.execute_query(
            """
            MATCH (cf:Conflict {kind: 'breaking_change', repo_id: $repo_id})-[:INTRODUCED_IN]->(cm:Commit)
            RETURN cf.qualified_name AS symbol, cf.type AS type, cf.description AS description,
                   cf.old_signature AS old_signature, cf.new_signature AS new_signature,
                   cf.callers AS affected_callers, cm.short_sha AS commit, cm.subject AS commit_subject
            ORDER BY cm.short_sha
            LIMIT 200
            """,
            {"repo_id": repo_id},
        )
        return {"repo_id": repo_id, "breaking_changes": rows, "total": len(rows)}
    except Exception as exc:
        logger.warning("get_breaking_changes_failed", repo_id=repo_id, error=str(exc))
        return {"repo_id": repo_id, "breaking_changes": [], "total": 0}


@router.get("/{repo_id}/stats")
async def get_repo_stats(repo_id: str) -> dict:
    """Node/relation/commit/breaking-change counts for a repo's code graph."""
    empty = {"repo_id": repo_id, "nodes": 0, "relations": 0, "commits": 0, "breaking_changes": 0}
    try:
        rows = await neo4j_client.execute_query(
            """
            OPTIONAL MATCH (e:Entity {repo_id: $repo_id})
            WITH count(e) AS nodes
            OPTIONAL MATCH (:Entity {repo_id: $repo_id})-[r:RELATION]->(:Entity {repo_id: $repo_id})
            WITH nodes, count(r) AS relations
            OPTIONAL MATCH (cm:Commit {repo_id: $repo_id})
            WITH nodes, relations, count(cm) AS commits
            OPTIONAL MATCH (cf:Conflict {kind: 'breaking_change', repo_id: $repo_id})
            RETURN nodes, relations, commits, count(cf) AS breaking_changes
            """,
            {"repo_id": repo_id},
        )
        if not rows:
            return empty
        out = dict(rows[0])
        out["repo_id"] = repo_id
        return out
    except Exception as exc:
        logger.warning("get_repo_stats_failed", repo_id=repo_id, error=str(exc))
        return empty
