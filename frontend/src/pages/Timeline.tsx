import { useEffect, useMemo, useState } from 'react'
import { GitCommit, AlertTriangle, AlertCircle } from 'lucide-react'
import { api, type RepoCommit } from '../services/api'

export default function Timeline() {
  const [commits, setCommits] = useState<RepoCommit[]>([])
  const [sliderValue, setSliderValue] = useState(100)
  const [isSample, setIsSample] = useState(false)
  const [repoId, setRepoId] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    api
      .listRepos()
      .then((res) => {
        const ids = (res.repositories || []).map((r) => r.repo_id)
        if (cancelled) return
        if (ids.length > 0) setRepoId(ids[0])
        else loadSample()
      })
      .catch(() => loadSample())
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!repoId) return
    let cancelled = false
    api
      .getRepoCommits(repoId)
      .then((res) => {
        if (cancelled) return
        if (!res.commits || res.commits.length === 0) {
          loadSample()
          return
        }
        setIsSample(false)
        setCommits(res.commits)
      })
      .catch(() => loadSample())
    return () => {
      cancelled = true
    }
  }, [repoId])

  function loadSample() {
    setIsSample(true)
    setCommits(SAMPLE_COMMITS)
  }

  // Slider reveals commits oldest -> newest.
  const visibleCount = Math.max(1, Math.ceil((sliderValue / 100) * commits.length))
  const visible = commits.slice(0, visibleCount)

  // Snapshot diff: counts at the start vs. the currently-revealed commit.
  const diff = useMemo(() => {
    if (visible.length === 0) return null
    const first = commits[0]
    const cur = visible[visible.length - 1]
    const breakingSoFar = visible.reduce((sum, c) => sum + (c.breaking_changes || 0), 0)
    return { first, cur, breakingSoFar }
  }, [visible, commits])

  const fmtDate = (ts: string | null) => (ts ? ts.slice(0, 10) : '—')

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 border-b bg-white flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-purple-500" />
            代码演化时间线
          </h2>
          <p className="text-sm text-gray-500">沿 git 历史回放代码图谱的演化，定位破坏性变更引入点</p>
        </div>
        {isSample && (
          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
            <AlertCircle className="w-3 h-3" />
            示例数据(后端未连接)
          </span>
        )}
      </header>

      <div className="p-6 space-y-6 overflow-auto">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{fmtDate(commits[0]?.timestamp ?? null)}</span>
                <span>{fmtDate(commits[commits.length - 1]?.timestamp ?? null)}</span>
              </div>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {visibleCount} / {commits.length} commits
            </span>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> 普通提交
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" /> 引入破坏性变更
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium mb-4">提交历史</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {visible.map((c) => {
                const breaking = (c.breaking_changes || 0) > 0
                return (
                  <div key={c.sha} className="flex items-start gap-4 relative">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        breaking ? 'bg-red-500' : 'bg-blue-500'
                      } ring-4 ring-white relative z-10 mt-1`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500">{c.short_sha}</span>
                        {breaking && (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            {c.breaking_changes} 处破坏性变更
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{c.subject}</p>
                      <p className="text-xs text-gray-400">
                        {fmtDate(c.timestamp)} · {c.callables ?? 0} 个可调用符号 · {c.files ?? 0} 个文件
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {diff && (
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium mb-3">快照对比</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  起点 ({diff.first.short_sha})
                </p>
                <p className="text-sm">
                  {diff.first.callables ?? 0} 个符号 · {diff.first.files ?? 0} 个文件
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  当前 ({diff.cur.short_sha})
                </p>
                <p className="text-sm">
                  {diff.cur.callables ?? 0} 个符号 · {diff.cur.files ?? 0} 个文件 · 累计{' '}
                  {diff.breakingSoFar} 处破坏性变更
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// === Sample data: code-semantic commit history (used when backend is empty) ===
const SAMPLE_COMMITS: RepoCommit[] = [
  { sha: '42231ed', short_sha: '42231ed', subject: 'c1: initial', author: 'dev', timestamp: '2026-05-01T10:00:00', callables: 5, files: 3, breaking_changes: 0 },
  { sha: '7d917b7', short_sha: '7d917b7', subject: 'c2: add tenant param', author: 'dev', timestamp: '2026-05-02T11:00:00', callables: 5, files: 3, breaking_changes: 1 },
  { sha: 'f1b9f81', short_sha: 'f1b9f81', subject: 'c3: remove fmt', author: 'dev', timestamp: '2026-05-03T12:00:00', callables: 4, files: 3, breaking_changes: 1 },
]
