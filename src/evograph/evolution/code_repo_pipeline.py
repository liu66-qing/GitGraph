"""Code repository pipeline: git repo -> code graph + breaking changes in Neo4j.

This is the orchestrator that ties the deterministic parser, the git-history
loader, and the breaking-change detector into the existing graph store. It is
the code-side analogue of `evolution/pipeline.py` (which handles documents).

Flow:
    1. Walk git history (oldest -> newest) via git_loader.
    2. For the LATEST snapshot, build the current code graph and merge it into
       Neo4j as :Entity nodes + :RELATION edges (reusing GraphMerger).
    3. Across ALL consecutive snapshots, detect breaking changes and persist
       them as :Conflict nodes (reusing the conflict store shape), each linked
       to the commit that introduced it.

The current-state graph powers "what calls this / what does this depend on",
and the breaking-change history powers "which commit broke this contract".
"""

from __future__ import annotations

import structlog

from evograph.ingestion.git_loader import iter_history, CommitSnapshot
from evograph.ingestion.code_graph_adapter import build_extraction_from_parses
from evograph.evolution.breaking_change_detector import scan_history, BreakingChange
from evograph.evolution.merger import graph_merger
from evograph.graph.neo4j_client import neo4j_client

logger = structlog.get_logger()


class CodeRepoPipeline:
    async def process_repository(
        self,
        repo_id: str,
        repo_path: str,
        max_commits: int | None = None,
        src_prefixes: tuple[str, ...] = ("src/", "lib/"),
    ) -> dict:
        logger.info("code_pipeline_start", repo_id=repo_id, repo_path=repo_path)

        # Stage 1: walk full history once, materialize snapshots.
        snapshots: list[CommitSnapshot] = list(
            iter_history(repo_path, max_commits=max_commits, src_prefixes=src_prefixes)
        )
        if not snapshots:
            return {"repo_id": repo_id, "error": "no commits found", "commits": 0}

        latest = snapshots[-1]
        logger.info(
            "code_pipeline_history_loaded",
            repo_id=repo_id,
            commits=len(snapshots),
            latest=latest.commit.short_sha,
        )

        # Stage 2: merge the current code graph into Neo4j.
        extraction, adapter_stats = build_extraction_from_parses(
            latest.parses, document_id=repo_id
        )
        # Entities are pre-canonicalized (qualified names are unique), so the
        # resolver step is unnecessary — pass an identity mapping.
        identity_map = {e.name: e.name for e in extraction.entities}
        merge_stats = await graph_merger.merge_extraction(extraction, identity_map)

        # Stage 3: detect breaking changes across the whole history.
        breaking = scan_history(snapshots)
        await self._store_breaking_changes(repo_id, breaking)

        # Stage 4: persist the full commit chain (every commit, not just the
        # ones with breaking changes) so the Timeline can replay evolution.
        await self._store_commit_history(repo_id, snapshots)

        result = {
            "repo_id": repo_id,
            "commits": len(snapshots),
            "latest_commit": latest.commit.short_sha,
            "nodes": adapter_stats["nodes"],
            "relations_merged": merge_stats.get("relations_created", 0),
            "breaking_changes": len(breaking),
            "adapter_stats": adapter_stats,
        }
        logger.info("code_pipeline_complete", **{k: v for k, v in result.items() if k != "adapter_stats"})
        return result

    async def _store_breaking_changes(
        self, repo_id: str, changes: list[BreakingChange]
    ) -> None:
        """Persist each breaking change as a :Conflict node, linked to the
        :Commit that introduced it and the affected :Entity symbol.

        Reuses the :Conflict label so breaking changes surface in the same
        conflicts API/dashboard the document pipeline already feeds.
        """
        for bc in changes:
            await neo4j_client.execute_write(
                """
                MERGE (cm:Commit {sha: $sha})
                  ON CREATE SET cm.short_sha = $short, cm.subject = $subject, cm.repo_id = $repo_id
                MERGE (cf:Conflict {id: $conflict_id})
                  ON CREATE SET cf.type = $type,
                                cf.status = 'open',
                                cf.kind = 'breaking_change',
                                cf.description = $description,
                                cf.qualified_name = $qname,
                                cf.old_signature = $old_sig,
                                cf.new_signature = $new_sig,
                                cf.callers = $callers,
                                cf.repo_id = $repo_id,
                                cf.detected_at = datetime()
                MERGE (cf)-[:INTRODUCED_IN]->(cm)
                """,
                {
                    "sha": bc.commit_sha,
                    "short": bc.commit_short,
                    "subject": bc.commit_subject,
                    "repo_id": repo_id,
                    "conflict_id": f"{repo_id}:{bc.commit_sha}:{bc.qualified_name}:{bc.kind}",
                    "type": "logical_contradiction",  # maps onto existing ConflictType
                    "description": f"[{bc.kind}] {bc.qualified_name}: {bc.detail}",
                    "qname": bc.qualified_name,
                    "old_sig": bc.old_signature,
                    "new_sig": bc.new_signature,
                    "callers": bc.callers,
                },
            )
            # Link the conflict to the affected symbol entity if present.
            await neo4j_client.execute_write(
                """
                MATCH (cf:Conflict {id: $conflict_id})
                MATCH (e:Entity {name: $qname})
                MERGE (cf)-[:AFFECTS]->(e)
                """,
                {
                    "conflict_id": f"{repo_id}:{bc.commit_sha}:{bc.qualified_name}:{bc.kind}",
                    "qname": bc.qualified_name,
                },
            )

        if changes:
            logger.info("breaking_changes_stored", repo_id=repo_id, count=len(changes))

    async def _store_commit_history(
        self, repo_id: str, snapshots: list[CommitSnapshot]
    ) -> None:
        """Persist every commit as a :Commit node with PARENT edges and per-commit
        counts, so the Timeline can step through the repo's evolution.

        Counts are cheap snapshot-local tallies: how many callables and how many
        .py files existed at that commit. The PARENT edge mirrors git's first-parent
        chain, which is also what the breaking-change detector diffs against.
        """
        for snap in snapshots:
            c = snap.commit
            callables = sum(
                1
                for p in snap.parses
                if not p.parse_error
                for n in p.nodes
                if n.kind in ("function", "method")
            )
            files = sum(1 for p in snap.parses if not p.parse_error)
            await neo4j_client.execute_write(
                """
                MERGE (cm:Commit {sha: $sha})
                  SET cm.short_sha = $short,
                      cm.subject = $subject,
                      cm.author = $author,
                      cm.timestamp = $ts,
                      cm.repo_id = $repo_id,
                      cm.callable_count = $callables,
                      cm.file_count = $files
                """,
                {
                    "sha": c.sha,
                    "short": c.short_sha,
                    "subject": c.subject,
                    "author": c.author,
                    "ts": c.timestamp.isoformat() if c.timestamp else None,
                    "repo_id": repo_id,
                    "callables": callables,
                    "files": files,
                },
            )
            if c.parent_sha:
                await neo4j_client.execute_write(
                    """
                    MATCH (cm:Commit {sha: $sha})
                    MERGE (parent:Commit {sha: $parent})
                      ON CREATE SET parent.repo_id = $repo_id
                    MERGE (cm)-[:PARENT]->(parent)
                    """,
                    {"sha": c.sha, "parent": c.parent_sha, "repo_id": repo_id},
                )
        logger.info("commit_history_stored", repo_id=repo_id, commits=len(snapshots))


code_repo_pipeline = CodeRepoPipeline()

