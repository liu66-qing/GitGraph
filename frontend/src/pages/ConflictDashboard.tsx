import { useEffect, useState } from 'react'
import { AlertTriangle, Eye, AlertCircle, GitCommit } from 'lucide-react'
import { clsx } from 'clsx'
import { api, type BreakingChange } from '../services/api'

// Classify a breaking change by the kind embedded in its description, e.g.
// "[REQUIRED_PARAM_ADDED] pkg.api.get_user: ...". Falls back to the raw type.
function changeKind(bc: BreakingChange): string {
  const m = bc.description?.match(/^\[([A-Z_]+)\]/)
  return m ? m[1] : bc.type || 'SIGNATURE_CHANGED'
}

const KIND_LABELS: Record<string, string> = {
  SIGNATURE_CHANGED: '签名变更',
  REQUIRED_PARAM_ADDED: '必填参数新增',
  SYMBOL_REMOVED: '函数删除',
}

const KIND_COLORS: Record<string, string> = {
  SIGNATURE_CHANGED: 'bg-amber-100 text-amber-700',
  REQUIRED_PARAM_ADDED: 'bg-red-100 text-red-700',
  SYMBOL_REMOVED: 'bg-purple-100 text-purple-700',
}

export default function ConflictDashboard() {
  const [changes, setChanges] = useState<BreakingChange[]>([])
  const [selected, setSelected] = useState<BreakingChange | null>(null)
  const [isSample, setIsSample] = useState(false)
  const [repoId, setRepoId] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    api
      .listRepos()
      .then((res) => {
        const ids = (res.repositories || []).map((r) => r.repo_id)
        if (cancelled) return
        if (ids.length > 0) {
          setRepoId(ids[0])
        } else {
          loadSample()
        }
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
      .getBreakingChanges(repoId)
      .then((res) => {
        if (cancelled) return
        if (!res.breaking_changes || res.breaking_changes.length === 0) {
          loadSample()
          return
        }
        setIsSample(false)
        setChanges(res.breaking_changes)
      })
      .catch(() => loadSample())
    return () => {
      cancelled = true
    }
  }, [repoId])

  function loadSample() {
    setIsSample(true)
    setChanges(SAMPLE_CHANGES)
  }

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 border-b bg-white flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            破坏性变更看板
          </h2>
          <p className="text-sm text-gray-500">
            检测到 {changes.length} 处破坏性变更 —— 函数契约被改动，且仍有调用方依赖
          </p>
        </div>
        {isSample && (
          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
            <AlertCircle className="w-3 h-3" />
            示例数据(后端未连接)
          </span>
        )}
      </header>

      <div className="flex-1 flex">
        <div className="w-1/2 border-r overflow-auto p-4 space-y-2">
          {changes.map((bc, i) => {
            const kind = changeKind(bc)
            return (
              <div
                key={i}
                onClick={() => setSelected(bc)}
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-colors',
                  selected === bc ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={clsx('text-xs px-1.5 py-0.5 rounded', KIND_COLORS[kind] || 'bg-gray-100')}>
                    {KIND_LABELS[kind] || kind}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <GitCommit className="w-3 h-3" />
                    {bc.commit}
                  </span>
                </div>
                <p className="text-sm mt-2 font-mono break-all">{bc.symbol}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {bc.affected_callers?.length || 0} 个调用方受影响
                </p>
              </div>
            )
          })}
        </div>

        <div className="w-1/2 p-4 overflow-auto">
          {selected ? (
            <div>
              <h3 className="font-semibold mb-1 font-mono text-sm break-all">{selected.symbol}</h3>
              <p className="text-xs text-gray-500 mb-4">
                引入于 commit {selected.commit} · {selected.commit_subject}
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-1">变更前签名</p>
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                    {selected.old_signature || '(不存在)'}
                  </pre>
                </div>
                <div className="text-center text-gray-400 text-sm">↓</div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-700 mb-1">变更后签名</p>
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                    {selected.new_signature || '(已删除)'}
                  </pre>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">{selected.description}</p>
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  受影响的调用方 ({selected.affected_callers?.length || 0})
                </p>
                <div className="space-y-1">
                  {(selected.affected_callers || []).map((c, i) => (
                    <div key={i} className="text-xs font-mono bg-red-50 border border-red-100 rounded px-2 py-1 break-all">
                      {c}
                    </div>
                  ))}
                  {(!selected.affected_callers || selected.affected_callers.length === 0) && (
                    <p className="text-xs text-gray-400">无</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-20">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>选择一处破坏性变更查看签名 diff 与受影响调用方</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// === Sample data: code-semantic breaking changes (used when backend is empty) ===
const SAMPLE_CHANGES: BreakingChange[] = [
  {
    symbol: 'pkg.api.get_user',
    type: 'logical_contradiction',
    description: '[REQUIRED_PARAM_ADDED] pkg.api.get_user: required params 1 -> 2; 1 caller(s) may now pass too few arguments',
    old_signature: 'get_user(uid)',
    new_signature: 'get_user(uid, tenant)',
    affected_callers: ['pkg.api.Service.load'],
    commit: '7d917b7',
    commit_subject: 'c2: add tenant param',
  },
  {
    symbol: 'pkg.util.fmt',
    type: 'logical_contradiction',
    description: "[SYMBOL_REMOVED] pkg.util.fmt: function 'pkg.util.fmt' was removed but 1 caller(s) still reference it",
    old_signature: 'fmt(x)',
    new_signature: null,
    affected_callers: ['pkg.legacy.old'],
    commit: 'f1b9f81',
    commit_subject: 'c3: remove fmt',
  },
]
