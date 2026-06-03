import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  api,
  type ArchitectureSummary,
  type QuickstartInfo,
  type ModuleMap,
  type LearningPath,
  type RepoSummary,
} from '../services/api'
import './Overview.css'
import overviewBg from '../assets/pixel/backgrounds/overview-morning.png'
import { useLanguage } from '../i18n/LanguageContext'
import {
  overviewAssets,
  stageAssets,
} from '../assets/pixel/stage-library'

interface MentalModelItem {
  title: string
  description: string
  iconChar: string
}

interface ReadingStep {
  step: number
  title: string
  description: string
  filePath?: string
  githubUrl?: string
}

export default function Overview() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [repos, setRepos] = useState<RepoSummary[]>([])
  const [repoId, setRepoId] = useState('')
  const [arch, setArch] = useState<ArchitectureSummary | null>(null)
  const [quickstart, setQuickstart] = useState<QuickstartInfo | null>(null)
  const [moduleMap, setModuleMap] = useState<ModuleMap | null>(null)
  const [learning, setLearning] = useState<LearningPath | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.listRepos().then((r) => {
      const list = r.repositories || []
      setRepos(list)
      const wanted = searchParams.get('repo')
      const ids = list.map((x) => x.repo_id)
      setRepoId(wanted && ids.includes(wanted) ? wanted : ids[0] || '')
    }).catch(() => {})
  }, [searchParams])

  useEffect(() => {
    if (!repoId) return
    setLoading(true)
    Promise.all([
      api.getArchitecture(repoId).catch(() => null),
      api.getQuickstart(repoId).catch(() => null),
      api.getModules(repoId).catch(() => null),
      api.getLearningPath(repoId).catch(() => null),
    ]).then(([ar, qs, mm, lp]) => {
      setArch(ar?.architecture || null)
      setQuickstart(qs?.quickstart || null)
      setModuleMap(mm?.module_map || null)
      setLearning(lp?.learning_path || null)
    }).finally(() => setLoading(false))
  }, [repoId])

  const positioning = useMemo(() => {
    if (arch?.summary) return arch.summary
    if (loading) return t('overview.positioningLoading')
    return t('overview.positioningFallback')
  }, [arch, loading, t])

  const coreProblem = useMemo(() => {
    if (arch?.patterns?.length) {
      const p = arch.patterns[0]
      return `${p.name}: ${p.evidence}`
    }
    if (arch?.summary) return arch.summary
    return t('overview.problemFallback')
  }, [arch, t])

  const mentalModel = useMemo((): MentalModelItem[] => {
    const layers = arch?.layers || []
    const stack = quickstart?.stack?.join(' / ') || arch?.patterns?.[0]?.name || t('overview.mental.howFallback')
    const layerNames = layers.slice(0, 3).map((l) => l.name).join(' -> ') || 'data -> logic -> interface'
    return [
      {
        title: t('overview.mental.whatTitle'),
        description: arch?.summary?.split('。')[0] || t('overview.mental.whatFallback').replace('{stack}', stack),
        iconChar: '▣',
      },
      {
        title: t('overview.mental.whoTitle'),
        description: layers[0]?.description || t('overview.mental.whoFallback'),
        iconChar: '♟',
      },
      {
        title: t('overview.mental.howTitle'),
        description: t('overview.mental.howDesc')
          .replace('{count}', String(arch?.module_count ?? (layers.length || t('overview.mental.howFallback'))))
          .replace('{layers}', layerNames),
        iconChar: '⚙',
      },
    ]
  }, [arch, quickstart, t])

  const readingOrder = useMemo((): ReadingStep[] => {
    const steps: ReadingStep[] = [
      { step: 1, title: t('overview.reading.step1Title'), description: t('overview.reading.step1Desc') },
    ]
    if (moduleMap?.cards?.length) {
      steps.push({
        step: 2,
        title: t('overview.reading.step2Title'),
        description: t('overview.reading.step2Desc')
          .replace('{cards}', String(moduleMap.meta.cards))
          .replace('{layers}', String(moduleMap.meta.layers)),
      })
    } else {
      steps.push({ step: 2, title: t('overview.reading.step2Title'), description: t('overview.reading.step2Fallback') })
    }
    const entry = quickstart?.entrypoints?.[0]
    steps.push({
      step: 3,
      title: t('overview.reading.step3Title'),
      description: entry ? t('overview.reading.step3Desc').replace('{entry}', entry) : t('overview.reading.step3Fallback'),
      filePath: entry,
    })
    const firstStep = learning?.steps?.[0]
    steps.push({
      step: 4,
      title: t('overview.reading.step4Title'),
      description: firstStep ? t('overview.reading.step4Desc').replace('{symbol}', firstStep.symbol) : t('overview.reading.step4Fallback'),
      filePath: firstStep?.file_path,
    })
    return steps
  }, [quickstart, moduleMap, learning, t])

  const repoMeta = useMemo(() => {
    const summary = repos.find((r) => r.repo_id === repoId)
    return {
      fullName: repoId || 'letta-ai/letta',
      nodes: summary?.nodes ?? 0,
      commits: summary?.commits ?? 0,
    }
  }, [repos, repoId])

  const tasks = [
    { text: t('overview.quest1'), completed: !!arch?.summary || !loading },
    { text: t('overview.quest2'), completed: !!arch?.patterns?.length },
    { text: t('overview.quest3'), completed: readingOrder.length >= 4 },
  ]
  const completedCount = tasks.filter((t) => t.completed).length
  const stageProgress = Math.round((completedCount / tasks.length) * 100)
  const filledBlocks = Math.round((stageProgress / 100) * 6)

  return (
    <div className="ov-page">
      {repos.length > 1 && (
        <div className="ov-repo-row">
          <span>{t('overview.repoLabel')}</span>
          <select value={repoId} onChange={(e) => setRepoId(e.target.value)}>
            {repos.map((r) => (
              <option key={r.repo_id} value={r.repo_id}>{r.repo_id}</option>
            ))}
          </select>
        </div>
      )}

      <section className="ov-hero" style={{ backgroundImage: `url(${overviewBg})` }}>
        <div className="ov-hero-overlay" />
        <div className="ov-topbar">
          <button className="ov-back" onClick={() => navigate('/')}>
            <span className="ov-back-arrow">←</span>
            <span>{t('overview.backToMap')}</span>
          </button>
          <div className="ov-stage-title">
            <img className="ov-stage-sign" src={stageAssets.woodArrowSign} alt="" />
            <h1><span>{t('overview.stageTitle')}</span><b>·</b><span>{t('overview.stageName')}</span></h1>
            <p className="ov-subtitle">{t('overview.stageSubtitle')}</p>
          </div>
          <div className="ov-progress-pill">
            <img className="ov-progress-avatar" src={overviewAssets.mentor} alt="" />
            <span className="ov-progress-label">{t('overview.progressLabel')}</span>
            <div className="ov-progress-bar">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={i < filledBlocks ? 'on' : ''} />
              ))}
            </div>
            <strong>{stageProgress}%</strong>
          </div>
        </div>

        <div className="ov-hero-ground">
          <div className="ov-hero-mentor">
            <div className="ov-bubble">
              <strong>{t('overview.mentorGreeting')}</strong>
              <span>{t('overview.mentorText')}</span>
            </div>
            <img className="ov-farm-mentor" src={overviewAssets.mentor} alt={t('overview.mentorAlt')} />
          </div>
          <div className="ov-board">
            <img className="ov-board-art" src={overviewAssets.woodBoard} alt="" />
            <div className="ov-board-content">
              <div className="ov-board-tag">{t('overview.boardTag')}</div>
              <p className="ov-board-text">{positioning}</p>
              <div className="ov-board-meta">
                <span>{repoMeta.fullName}</span>
                <span>{repoMeta.nodes} {t('overview.boardMetaNodes')} · {repoMeta.commits} {t('overview.boardMetaCommits')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ov-grid ov-grid--top">
        <article className="ov-card ov-card--problem">
          <img className="ov-card-decor ov-card-decor--stones" src={overviewAssets.stones} alt="" />
          <header>
            <span className="ov-icon ov-icon--problem">◎</span>
            <h2>{t('overview.problemTitle')}</h2>
          </header>
          <p>{coreProblem}</p>
        </article>

        <article className="ov-card ov-card--mental">
          <img className="ov-card-decor ov-card-decor--flowers" src={overviewAssets.flowers} alt="" />
          <header>
            <span className="ov-icon ov-icon--mental">✦</span>
            <h2>{t('overview.mentalTitle')}</h2>
          </header>
          <div className="ov-mental">
            {mentalModel.map((m) => (
              <div className="ov-mental-item" key={m.title}>
                <span className="ov-mental-icon">{m.iconChar}</span>
                <strong>{m.title}</strong>
                <small>{m.description}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="ov-card ov-card--reading">
          <img className="ov-card-decor ov-card-decor--sign" src={overviewAssets.sign} alt="" />
          <header>
            <span className="ov-icon ov-icon--reading">↳</span>
            <h2>{t('overview.readingTitle')}</h2>
          </header>
          <ol className="ov-route">
            {readingOrder.map((s, i) => (
              <li key={s.step} className={i === readingOrder.length - 1 ? 'last' : ''}>
                <span className="ov-route-num">{s.step}</span>
                <div className="ov-route-body">
                  <strong>{s.title}</strong>
                  <small>{s.description}</small>
                </div>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="ov-grid ov-grid--bottom">
        <article className="ov-card ov-card--gain">
          <img className="ov-card-decor ov-card-decor--grass" src={overviewAssets.grass} alt="" />
          <header>
            <span className="ov-icon ov-icon--gain">★</span>
            <h2>{t('overview.gainTitle')}</h2>
          </header>
          <div className="ov-gain">
            <div className="ov-gain-item"><img src={stageAssets.badgeMap} alt="" /><strong>{t('overview.gain1')}</strong></div>
            <div className="ov-gain-item"><span>◎</span><strong>{t('overview.gain2')}</strong></div>
            <div className="ov-gain-item"><img src={stageAssets.badgeClipboard} alt="" /><strong>{t('overview.gain3')}</strong></div>
          </div>
        </article>

        <article className="ov-card ov-card--quest">
          <img className="ov-card-decor ov-card-decor--chest" src={overviewAssets.chest} alt="" />
          <header>
            <span className="ov-icon ov-icon--quest">▣</span>
            <h2>{t('overview.questTitle').replace('{completed}', String(completedCount)).replace('{total}', String(tasks.length))}</h2>
          </header>
          <ul className="ov-quest">
            {tasks.map((task) => (
              <li key={task.text} className={task.completed ? 'done' : ''}>
                <span className="ov-quest-dot">{task.completed ? '✓' : ''}</span>
                <span>{task.text}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="ov-card ov-card--next">
          <img className="ov-card-decor ov-card-decor--bridge" src={overviewAssets.bridge} alt="" />
          <img className="ov-card-decor ov-card-decor--flag" src={overviewAssets.flag} alt="" />
          <div className="ov-next-badge">2</div>
          <header>
            <span className="ov-icon ov-icon--next">▶</span>
            <h2>{t('overview.nextTitle')}</h2>
          </header>
          <p>{t('overview.nextDesc')}</p>
          <button
            className="ov-cta"
            onClick={() => navigate(`/mainflow${repoId ? `?repo=${encodeURIComponent(repoId)}` : ''}`)}
          >
            {t('overview.nextButton')}
          </button>
        </article>
      </section>
    </div>
  )
}
