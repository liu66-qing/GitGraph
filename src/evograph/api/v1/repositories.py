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


@router.get("/{repo_id}/breaking-changes")
async def get_breaking_changes(repo_id: str) -> dict:
    """List detected breaking changes for a repo, newest commit first."""
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


@router.get("/{repo_id}/stats")
async def get_repo_stats(repo_id: str) -> dict:
    """Basic counts for a repo's code graph."""
    rows = await neo4j_client.execute_query(
        """
        MATCH (cf:Conflict {kind: 'breaking_change', repo_id: $repo_id})
        RETURN count(cf) AS breaking_changes
        """,
        {"repo_id": repo_id},
    )
    return rows[0] if rows else {"breaking_changes": 0}
