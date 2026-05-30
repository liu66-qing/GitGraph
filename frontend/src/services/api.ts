const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export const api = {
  // Documents
  uploadDocument: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${BASE_URL}/documents`, { method: 'POST', body: formData })
    return res.json()
  },
  listDocuments: () => request<any[]>('/documents'),

  // Query
  query: (question: string, includeReasoning = true) =>
    request<any>('/query', {
      method: 'POST',
      body: JSON.stringify({ question, include_reasoning: includeReasoning }),
    }),

  // Graph
  searchEntities: (q: string) => request<any[]>(`/graph/entities?q=${encodeURIComponent(q)}`),
  getNeighborhood: (entityId: string, hops = 2) =>
    request<any>(`/graph/entities/${entityId}/neighborhood?hops=${hops}`),
  getGraphStats: () => request<any>('/graph/stats'),

  // Conflicts
  listConflicts: () => request<any>('/conflicts'),
  resolveConflict: (id: string, resolution: string, note?: string) =>
    request<any>(`/conflicts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution, note }),
    }),

  // Timeline
  getEntityTimeline: (entityId: string) => request<any>(`/timeline/entity/${entityId}`),
  getSnapshot: (timestamp: string) =>
    request<any>(`/timeline/snapshot?timestamp=${encodeURIComponent(timestamp)}`),
  getDiff: (from: string, to: string) =>
    request<any>(`/timeline/diff?from_ts=${encodeURIComponent(from)}&to_ts=${encodeURIComponent(to)}`),

  // === Code repositories (code-evolution analysis) ===
  // List repositories that have been analyzed.
  listRepos: () => request<{ repositories: RepoSummary[]; total: number }>('/repositories'),
  // Kick off analysis of a local git repo path (async on the backend).
  analyzeRepo: (repoPath: string, repoId?: string, maxCommits?: number) =>
    request<any>('/repositories', {
      method: 'POST',
      body: JSON.stringify({ repo_path: repoPath, repo_id: repoId, max_commits: maxCommits }),
    }),
  // Code graph (nodes = symbols, edges = CALLS/IMPORTS/INHERITS/DEFINES).
  getRepoGraph: (repoId: string, limit = 300) =>
    request<RepoGraphResponse>(`/repositories/${encodeURIComponent(repoId)}/graph?limit=${limit}`),
  // Commit history with per-commit counts and breaking-change flag.
  getRepoCommits: (repoId: string) =>
    request<RepoCommitsResponse>(`/repositories/${encodeURIComponent(repoId)}/commits`),
  // Detected breaking changes for a repo.
  getBreakingChanges: (repoId: string) =>
    request<BreakingChangesResponse>(`/repositories/${encodeURIComponent(repoId)}/breaking-changes`),
  // Node/relation/commit/breaking counts.
  getRepoStats: (repoId: string) =>
    request<RepoStats>(`/repositories/${encodeURIComponent(repoId)}/stats`),

  // Admin
  healthCheck: () => request<any>('/admin/health'),
}

// === Code-domain response shapes (match the backend repositories endpoints) ===

export interface RepoSummary {
  repo_id: string
  nodes: number
  commits: number
}

export interface CodeGraphNode {
  id: string
  name: string
  kind: string | null // module | class | function | method
  signature: string | null
  file_path: string | null
}

export interface CodeGraphEdge {
  source: string
  target: string
  type: string // CALLS | IMPORTS | INHERITS | DEFINES
}

export interface RepoGraphResponse {
  repo_id: string
  nodes: CodeGraphNode[]
  edges: CodeGraphEdge[]
}

export interface RepoCommit {
  sha: string
  short_sha: string
  subject: string
  author: string | null
  timestamp: string | null
  callables: number | null
  files: number | null
  breaking_changes: number
}

export interface RepoCommitsResponse {
  repo_id: string
  commits: RepoCommit[]
  total: number
}

export interface BreakingChange {
  symbol: string
  type: string // SIGNATURE_CHANGED | REQUIRED_PARAM_ADDED | SYMBOL_REMOVED (in description)
  description: string
  old_signature: string | null
  new_signature: string | null
  affected_callers: string[] | null
  commit: string
  commit_subject: string
}

export interface BreakingChangesResponse {
  repo_id: string
  breaking_changes: BreakingChange[]
  total: number
}

export interface RepoStats {
  repo_id: string
  nodes: number
  relations: number
  commits: number
  breaking_changes: number
}
