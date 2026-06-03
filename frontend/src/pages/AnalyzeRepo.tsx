import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Github, Loader2, CheckCircle, AlertCircle, ArrowRight, FolderGit2, Settings2 } from 'lucide-react'
import { api, type RepoSummary } from '../services/api'
import { useLanguage } from '../i18n/LanguageContext'

type Phase = 'idle' | 'dispatching' | 'analyzing' | 'done' | 'error'

// Loose client-side check; the backend does the authoritative validation.
function looksLikeGitUrl(s: string): boolean {
  return /^(https?:\/\/|git@)[\w.@:/\-~]+$/.test(s.trim()) && /github\.com|gitlab\.com|\.git$|\//.test(s)
}

export default function AnalyzeRepo() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [url, setUrl] = useState('')
  const [subdir, setSubdir] = useState('')
  const [maxCommits, setMaxCommits] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('')
  const [newRepoId, setNewRepoId] = useState('')
  const [repos, setRepos] = useState<RepoSummary[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep the "已分析仓库" list fresh.
  function refreshRepos() {
    api
      .listRepos()
      .then((res) => setRepos(res.repositories || []))
      .catch(() => {})
  }
  useEffect(() => {
    refreshRepos()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  async function startAnalysis() {
    const trimmed = url.trim()
    if (!looksLikeGitUrl(trimmed)) {
      setPhase('error')
      setMessage(t('analyze.error.invalidUrl'))
      return
    }
    setPhase('dispatching')
    setMessage(t('analyze.status.dispatching'))
    setNewRepoId('')

    try {
      const res = await api.analyzeRepo({
        repoUrl: trimmed,
        subdir: subdir.trim() || undefined,
        maxCommits: maxCommits.trim() ? Number(maxCommits.trim()) : undefined,
      })
      const expectedId = res.repo_id
      setNewRepoId(expectedId)
      setPhase('analyzing')
      setMessage(t('analyze.status.analyzing').replace('{id}', expectedId))
      pollForCompletion(expectedId)
    } catch (e) {
      setPhase('error')
      setMessage(e instanceof Error ? e.message : t('analyze.error.dispatchFailed'))
    }
  }

  // Poll the repo list until the new repo shows up with nodes (= analysis landed).
  function pollForCompletion(expectedId: string) {
    if (pollRef.current) clearInterval(pollRef.current)
    let elapsed = 0
    pollRef.current = setInterval(async () => {
      elapsed += 4
      try {
        const res = await api.listRepos()
        setRepos(res.repositories || [])
        const found = (res.repositories || []).find((r) => r.repo_id === expectedId && r.nodes > 0)
        if (found) {
          if (pollRef.current) clearInterval(pollRef.current)
          setPhase('done')
          setMessage(
            t('analyze.status.done')
              .replace('{nodes}', String(found.nodes))
              .replace('{commits}', String(found.commits))
          )
        } else if (elapsed >= 180) {
          if (pollRef.current) clearInterval(pollRef.current)
          setPhase('error')
          setMessage(t('analyze.error.timeout'))
        }
      } catch {
        /* keep polling */
      }
    }, 4000)
  }

  function openInGraph(repoId: string) {
    navigate(`/?repo=${encodeURIComponent(repoId)}`)
  }

  const busy = phase === 'dispatching' || phase === 'analyzing'

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Github className="w-5 h-5 text-indigo-500" />
          {t('analyze.header.title')}
        </h2>
        <p className="text-sm text-gray-500">{t('analyze.header.subtitle')}</p>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* URL input */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <label className="text-sm font-medium text-gray-700">{t('analyze.field.urlLabel')}</label>
            <div className="mt-2 flex gap-2">
              <div className="flex-1 relative">
                <Github className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !busy && startAnalysis()}
                  placeholder="https://github.com/datawhalechina/hello-agents"
                  disabled={busy}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                />
              </div>
              <button
                onClick={startAnalysis}
                disabled={busy}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {busy ? t('analyze.button.analyzing') : t('analyze.button.start')}
              </button>
            </div>

            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {t('analyze.advanced.toggle')}{showAdvanced ? ' ▲' : ' ▼'}
            </button>
            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">{t('analyze.field.subdirLabel')}</label>
                  <input
                    value={subdir}
                    onChange={(e) => setSubdir(e.target.value)}
                    placeholder="code/chapter13/helloagents-trip-planner/backend"
                    disabled={busy}
                    className="mt-1 w-full px-3 py-1.5 border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">{t('analyze.field.maxCommitsLabel')}</label>
                  <input
                    value={maxCommits}
                    onChange={(e) => setMaxCommits(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={t('analyze.field.maxCommitsPlaceholder')}
                    disabled={busy}
                    className="mt-1 w-full px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          {phase !== 'idle' && (
            <div
              className={`rounded-xl p-4 border flex items-start gap-3 ${
                phase === 'error'
                  ? 'bg-red-50 border-red-200'
                  : phase === 'done'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-indigo-50 border-indigo-200'
              }`}
            >
              {phase === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              ) : phase === 'done' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Loader2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-700">{message}</p>
                {phase === 'done' && newRepoId && (
                  <button
                    onClick={() => openInGraph(newRepoId)}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    {t('analyze.action.openInGraph')} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Already-analyzed repos */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-gray-400" />
                {t('analyze.repos.title')} ({repos.length})
              </h3>
              <button onClick={refreshRepos} className="text-xs text-gray-400 hover:text-gray-600">
                {t('analyze.action.refresh')}
              </button>
            </div>
            {repos.length === 0 && <p className="text-sm text-gray-400">{t('analyze.repos.empty')}</p>}
            <div className="space-y-1.5">
              {repos.map((r) => (
                <button
                  key={r.repo_id}
                  onClick={() => openInGraph(r.repo_id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border hover:bg-gray-50 text-left"
                >
                  <span className="font-mono text-sm text-gray-700 truncate">{r.repo_id}</span>
                  <span className="text-xs text-gray-400 shrink-0 ml-3">
                    {r.nodes} {t('analyze.repos.symbols')} · {r.commits} {t('analyze.repos.commits')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">
            {t('analyze.repos.hint')}
          </p>
        </div>
      </div>
    </div>
  )
}
