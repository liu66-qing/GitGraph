import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Copy,
  ExternalLink,
  FileCode2,
  Flag,
  GitBranch,
  Lightbulb,
  MapPin,
  Search,
  Star,
} from 'lucide-react'
import { stageAssets, stageBackgrounds, overviewAssets } from '../assets/pixel/stage-library'
import { PixelAsset } from '../components/common/PixelStageKit'
import type { StageAssetKey } from '../assets/pixel/stage-library'
import { useLanguage } from '../i18n/LanguageContext'

interface SourcePoint {
  file: string
  symbol: string
  whyKey: string
  takeawayKey: string
  url: string
}

interface Highlight {
  id: number
  title: string
  crystal: StageAssetKey
  summary: string
  problem: string
  naive: string
  solution: string
  readingPath: SourcePoint[]
  code: {
    title: string
    file: string
    url: string
    lines: string[]
    noteKeys: string[]
  }
}

const highlights: Highlight[] = [
  {
    id: 1,
    title: 'showcase.h1.title',
    crystal: 'crystalMemoryPurple',
    summary: 'showcase.h1.summary',
    problem: 'showcase.h1.problem',
    naive: 'showcase.h1.naive',
    solution: 'showcase.h1.solution',
    readingPath: [
      {
        file: 'letta/memory.py',
        symbol: 'Memory / Block',
        whyKey: 'showcase.h1.read1.why',
        takeawayKey: 'showcase.h1.read1.takeaway',
        url: 'https://github.com/letta-ai/letta/blob/main/letta/memory.py',
      },
      {
        file: 'letta/schemas/state.py',
        symbol: 'AgentState',
        whyKey: 'showcase.h1.read2.why',
        takeawayKey: 'showcase.h1.read2.takeaway',
        url: 'https://github.com/letta-ai/letta/blob/main/letta/schemas/state.py',
      },
      {
        file: 'letta/agent.py',
        symbol: 'context build',
        whyKey: 'showcase.h1.read3.why',
        takeawayKey: 'showcase.h1.read3.takeaway',
        url: 'https://github.com/letta-ai/letta/blob/main/letta/agent.py',
      },
    ],
    code: {
      title: 'showcase.h1.code.title',
      file: 'letta/memory.py',
      url: 'https://github.com/letta-ai/letta/blob/main/letta/memory.py',
      lines: [
        'class Memory(BaseModel):',
        '    blocks: List[Block] = Field(default_factory=list)',
        '',
        '    def compile(self) -> str:',
        '        return "\\n".join(block.render() for block in self.blocks)',
        '',
        'class Block(BaseModel):',
        '    label: str',
        '    value: str',
        '    limit: int',
      ],
      noteKeys: [
        'showcase.h1.code.note1',
        'showcase.h1.code.note2',
        'showcase.h1.code.note3',
      ],
    },
  },
  {
    id: 2,
    title: 'showcase.h2.title',
    crystal: 'crystalAgentBlue',
    summary: 'showcase.h2.summary',
    problem: 'showcase.h2.problem',
    naive: 'showcase.h2.naive',
    solution: 'showcase.h2.solution',
    readingPath: [
      {
        file: 'letta/agent.py',
        symbol: 'Agent',
        whyKey: 'showcase.h2.read1.why',
        takeawayKey: 'showcase.h2.read1.takeaway',
        url: 'https://github.com/letta-ai/letta/blob/main/letta/agent.py',
      },
      {
        file: 'letta/orm/agent.py',
        symbol: 'Agent ORM',
        whyKey: 'showcase.h2.read2.why',
        takeawayKey: 'showcase.h2.read2.takeaway',
        url: 'https://github.com/letta-ai/letta/blob/main/letta/orm/agent.py',
      },
      {
        file: 'letta/server/server.py',
        symbol: 'load_agent',
        whyKey: 'showcase.h2.read3.why',
        takeawayKey: 'showcase.h2.read3.takeaway',
        url: 'https://github.com/letta-ai/letta/blob/main/letta/server/server.py',
      },
    ],
    code: {
      title: 'showcase.h2.code.title',
      file: 'letta/agent.py',
      url: 'https://github.com/letta-ai/letta/blob/main/letta/agent.py',
      lines: [
        'class Agent:',
        '    def __init__(self, agent_state, interface, tools):',
        '        self.agent_state = agent_state',
        '        self.interface = interface',
        '        self.tools = tools',
        '',
        '    def step(self, input_message):',
        '        context = self._build_context(self.agent_state)',
        '        response = self._run_llm(context, input_message)',
        '        self._persist_state()',
        '        return response',
      ],
      noteKeys: [
        'showcase.h2.code.note1',
        'showcase.h2.code.note2',
        'showcase.h2.code.note3',
      ],
    },
  },
  {
    id: 3,
    title: 'showcase.h3.title',
    crystal: 'crystalLoopGreen',
    summary: 'showcase.h3.summary',
    problem: 'showcase.h3.problem',
    naive: 'showcase.h3.naive',
    solution: 'showcase.h3.solution',
    readingPath: [
      {
        file: 'letta/agent.py',
        symbol: 'step / inner_step',
        whyKey: 'showcase.h3.read1.why',
        takeawayKey: 'showcase.h3.read1.takeaway',
        url: 'https://github.com/letta-ai/letta/blob/main/letta/agent.py',
      },
      {
        file: 'letta/tools/',
        symbol: 'Tool execution',
        whyKey: 'showcase.h3.read2.why',
        takeawayKey: 'showcase.h3.read2.takeaway',
        url: 'https://github.com/letta-ai/letta/tree/main/letta/tools',
      },
      {
        file: 'letta/memory.py',
        symbol: 'memory update',
        whyKey: 'showcase.h3.read3.why',
        takeawayKey: 'showcase.h3.read3.takeaway',
        url: 'https://github.com/letta-ai/letta/blob/main/letta/memory.py',
      },
    ],
    code: {
      title: 'showcase.h3.code.title',
      file: 'letta/agent.py',
      url: 'https://github.com/letta-ai/letta/blob/main/letta/agent.py',
      lines: [
        'def step(self, user_message):',
        '    context = self.memory.compile()',
        '    decision = self.llm.call(context, user_message)',
        '',
        '    if decision.tool_call:',
        '        result = self.tools.run(decision.tool_call)',
        '        self.memory.update(result)',
        '        self.state.save()',
        '        return self.step(user_message)',
        '',
        '    return decision.message',
      ],
      noteKeys: [
        'showcase.h3.code.note1',
        'showcase.h3.code.note2',
        'showcase.h3.code.note3',
      ],
    },
  },
]

const decodeSteps = [
  { icon: 'badgeMap' as StageAssetKey, labelKey: 'showcase.decode1.label', titleKey: 'showcase.decode1.title', bodyKey: 'showcase.decode1.body' },
  { icon: 'badgeClipboard' as StageAssetKey, labelKey: 'showcase.decode2.label', titleKey: 'showcase.decode2.title', bodyKey: 'showcase.decode2.body' },
  { icon: 'routeArrowBlue' as StageAssetKey, labelKey: 'showcase.decode3.label', titleKey: 'showcase.decode3.title', bodyKey: 'showcase.decode3.body' },
]

const PROGRESS = 79

export default function Showcase() {
  const { t } = useLanguage()
  const [active, setActive] = useState(0)
  const current = highlights[active]
  const codeText = useMemo(() => current.code.lines.join('\n'), [current])

  function copyPath(path: string) {
    navigator.clipboard.writeText(path).catch(() => {})
  }

  return (
    <div className="sc-page">
      <section className="sc-hero" style={{ backgroundImage: `url(${stageBackgrounds.showcase})` }}>
        <button type="button" className="sc-back-btn"><ArrowLeft size={18} />{t('showcase.back')}</button>
        <div className="sc-progress-card">
          <img src={stageAssets.mentorMiner} alt="" className="sc-progress-avatar" />
          <div className="sc-progress-body"><strong>{t('showcase.progressLabel')}</strong><div className="sc-progress-track"><i style={{ width: `${PROGRESS}%` }} /></div></div>
          <b>{PROGRESS}%</b>
        </div>
        <h1 className="sc-hero-title"><PixelAsset asset="badgeClipboard" alt="" style={{ width: 42, height: 42 }} />{t('showcase.heroTitle')}</h1>
        <p className="sc-hero-subtitle">{t('showcase.heroSubtitle')}</p>
        <div className="sc-hero-dialog">{t('showcase.heroDialog1')}<br />{t('showcase.heroDialog2')}<br />{t('showcase.heroDialog3')}</div>
        <img src={stageAssets.mentorMiner} alt={t('showcase.heroCharacterAlt')} className="sc-hero-character" />
        <img src={stageAssets.mineEntrance} alt="" className="sc-mine-entrance" />
        <div className="sc-hero-crystals">
          <PixelAsset asset="crystalMemoryPurple" alt="" style={{ width: 68 }} />
          <PixelAsset asset="crystalAgentBlue" alt="" style={{ width: 62 }} />
          <PixelAsset asset="crystalLoopGreen" alt="" style={{ width: 65 }} />
        </div>
        <div className="sc-hero-sign"><img src={overviewAssets.sign} alt="" /><span>letta-ai<br />/letta</span></div>
      </section>

      <section className="sc-decode-strip" aria-label={t('showcase.decodeAria')}>
        <header><span>{t('showcase.decodeOrder')}</span><strong>{t('showcase.decodeIntro')}</strong></header>
        <div className="sc-decode-steps">
          {decodeSteps.map((step, index) => (
            <article key={step.titleKey} className="sc-decode-step">
              <PixelAsset asset={step.icon} alt="" style={{ width: 42, height: 42 }} />
              <em>{index + 1}</em>
              <div><small>{t(step.labelKey)}</small><h3>{t(step.titleKey)}</h3><p>{t(step.bodyKey)}</p></div>
            </article>
          ))}
        </div>
      </section>

      <div className="sc-highlight-grid">
        {highlights.map((item, index) => (
          <button key={item.id} type="button" className={`sc-highlight-card ${index === active ? 'is-active' : ''}`} onClick={() => setActive(index)}>
            <PixelAsset asset={item.crystal} alt="" style={{ width: 78, height: 78 }} />
            <div><h3>{t(item.title)}</h3><p>{t(item.summary)}</p></div>
          </button>
        ))}
      </div>

      <section className="sc-source-workbench">
        <div className="sc-story-panel">
          <header><Search size={20} /><h2>{t(current.title)}</h2></header>
          <div className="sc-story-block"><strong>{t('showcase.problemLabel')}</strong><p>{t(current.problem)}</p></div>
          <div className="sc-story-block is-warn"><strong>{t('showcase.naiveLabel')}</strong><p>{t(current.naive)}</p></div>
          <div className="sc-story-block is-good"><strong>{t('showcase.solutionLabel')}</strong><p>{t(current.solution)}</p></div>
        </div>

        <div className="sc-reading-panel">
          <header><GitBranch size={20} /><h2>{t('showcase.readingTitle')}</h2><small>{t('showcase.readingHint')}</small></header>
          <ol className="sc-source-list">
            {current.readingPath.map((point, index) => (
              <li key={point.file}>
                <span>{index + 1}</span>
                <div>
                  <strong>{point.file}</strong>
                  <em>{point.symbol}</em>
                  <p>{t(point.whyKey)}</p>
                  <small>{t(point.takeawayKey)}</small>
                </div>
                <div className="sc-source-actions">
                  <button type="button" onClick={() => copyPath(point.file)} title={t('showcase.copyPathTitle')}><Copy size={15} /></button>
                  <a href={point.url} target="_blank" rel="noreferrer" title={t('showcase.openGithubTitle')}><ExternalLink size={15} /></a>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="sc-code-panel">
          <header>
            <FileCode2 size={20} />
            <div><h2>{t(current.code.title)}</h2><small>{current.code.file}</small></div>
            <a href={current.code.url} target="_blank" rel="noreferrer">GitHub <ExternalLink size={14} /></a>
          </header>
          <pre>{current.code.lines.map((line, index) => `${String(index + 1).padStart(2, '0')}  ${line}`).join('\n')}</pre>
        </div>

        <div className="sc-notes-panel">
          <header><Lightbulb size={20} /><h2>{t('showcase.notesTitle')}</h2></header>
          <ul>
            {current.code.noteKeys.map((noteKey) => <li key={noteKey}><CheckCircle2 size={16} />{t(noteKey)}</li>)}
          </ul>
          <button type="button" onClick={() => copyPath(codeText)}>{t('showcase.copySnippet')}</button>
        </div>
      </section>

      <div className="sc-bottom-grid">
        <section className="sc-card sc-evidence-card">
          <header className="sc-card-header"><ClipboardList size={18} /><h2>{t('showcase.evidenceTitle')}</h2></header>
          {current.readingPath.map((point) => (
            <a key={point.file} href={point.url} target="_blank" rel="noreferrer"><MapPin size={15} /><span>{point.file}</span><ChevronRight size={15} /></a>
          ))}
        </section>
        <section className="sc-card sc-reward-card">
          <header className="sc-card-header"><Star size={18} /><h2>{t('showcase.rewardTitle')}</h2></header>
          <ul className="sc-task-list compact">
            <li><CheckCircle2 size={16} />{t('showcase.reward1')}</li>
            <li><CheckCircle2 size={16} />{t('showcase.reward2')}</li>
            <li><CheckCircle2 size={16} />{t('showcase.reward3')}</li>
          </ul>
        </section>
        <section className="sc-card sc-task-card">
          <header className="sc-card-header"><ClipboardList size={18} /><h2>{t('showcase.taskTitle')}</h2></header>
          <ul className="sc-task-list">
            <li><CheckCircle2 size={16} />{t('showcase.task1')}</li>
            <li><CheckCircle2 size={16} />{t('showcase.task2')}</li>
            <li><CheckCircle2 size={16} />{t('showcase.task3')}</li>
          </ul>
        </section>
        <section className="sc-card sc-next-card">
          <header className="sc-card-header"><Flag size={18} /><h2>{t('showcase.nextTitle')}</h2><em className="sc-next-badge">4</em></header>
          <p>{t('showcase.nextDesc')}</p>
          <img src={stageAssets.campfireCrates} alt="" />
          <button type="button">{t('showcase.nextButton')} <ArrowRight size={18} /></button>
        </section>
      </div>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
.sc-page{width:100%;min-height:100vh;overflow:auto;background:#f4f7fb;padding:0 22px 28px;color:#071832}.sc-hero{position:relative;height:370px;background-size:cover;background-position:center;image-rendering:pixelated;overflow:hidden}.sc-back-btn,.sc-progress-card{position:absolute;z-index:6;top:26px;border:2px solid #93aef5;border-radius:10px;background:rgba(255,255,255,.9);box-shadow:0 3px 0 rgba(33,72,130,.18);font-weight:900;color:#0d2f70}.sc-back-btn{left:28px;height:48px;padding:0 18px;display:flex;align-items:center;gap:8px;cursor:pointer}.sc-progress-card{right:26px;width:290px;height:56px;display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:12px;padding:0 14px}.sc-progress-avatar{width:34px;height:34px;image-rendering:pixelated}.sc-progress-body strong{font-size:12px}.sc-progress-track{height:7px;margin-top:4px;background:#dbe7f3;border-radius:999px;overflow:hidden}.sc-progress-track i{display:block;height:100%;background:#62bd55}.sc-progress-card b{font-size:16px}.sc-hero-title{position:absolute;z-index:7;top:20px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:14px;margin:0;color:#0e1630;font-size:clamp(38px,4.5vw,64px);font-weight:950;line-height:1;text-shadow:2px 2px 0 rgba(255,255,255,.5);white-space:nowrap}.sc-hero-subtitle{position:absolute;z-index:7;top:100px;left:50%;transform:translateX(-50%);margin:0;color:#fff;font-size:18px;font-weight:800;text-shadow:1px 1px 5px rgba(0,0,0,.7);white-space:nowrap}.sc-hero-dialog{position:absolute;left:180px;top:145px;z-index:5;width:170px;min-height:100px;padding:12px 14px;border:3px solid #5d4b43;border-radius:6px;background:#fff9ef;box-shadow:3px 3px 0 rgba(0,0,0,.15);font-size:13px;font-weight:800;line-height:1.6}.sc-hero-character{position:absolute;left:340px;top:150px;z-index:4;width:180px;image-rendering:pixelated;filter:drop-shadow(0 5px 0 rgba(0,0,0,.24))}.sc-mine-entrance{position:absolute;right:240px;top:130px;z-index:2;width:160px;image-rendering:pixelated;opacity:.86}.sc-hero-crystals{position:absolute;left:500px;top:220px;z-index:3;display:flex;gap:14px}.sc-hero-sign{position:absolute;right:70px;top:185px;z-index:5;width:110px}.sc-hero-sign img{width:100%;image-rendering:pixelated}.sc-hero-sign span{position:absolute;top:32%;left:50%;transform:translateX(-50%);font-size:12px;font-weight:950;color:#3a2008;text-align:center;line-height:1.4;white-space:nowrap}
.sc-decode-strip{position:relative;z-index:10;margin:16px 0 0;padding:14px 16px 16px;border:1px solid #c6d7ea;border-radius:12px;background:linear-gradient(180deg,rgba(255,252,242,.97),rgba(239,247,255,.96));box-shadow:0 8px 20px rgba(15,39,74,.08)}.sc-decode-strip header{display:flex;align-items:center;gap:12px;margin-bottom:12px}.sc-decode-strip header span{padding:7px 12px;border-radius:6px;background:#4a9a3f;color:#fff;font-size:13px;font-weight:950;box-shadow:0 2px 0 #2d6f28}.sc-decode-strip header strong{font-size:16px;font-weight:950}.sc-decode-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.sc-decode-step{display:grid;grid-template-columns:44px 28px 1fr;gap:10px;align-items:center;min-height:82px;padding:10px 12px;border:1px solid #d7c48d;border-radius:10px;background:rgba(255,255,255,.75)}.sc-decode-step:nth-child(2){border-color:#b8d1ef;background:#f2f8ff}.sc-decode-step:nth-child(3){border-color:#b6d9a8;background:#f4fcee}.sc-decode-step em{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;border:2px solid #fff;background:#58ad48;color:#fff;font-style:normal;font-weight:950}.sc-decode-step small{color:#6c4d13;font-size:12px;font-weight:950}.sc-decode-step h3{margin:2px 0 3px;font-size:15px}.sc-decode-step p{margin:0;color:#4a596b;font-size:12px;font-weight:750;line-height:1.4}
.sc-highlight-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:18px}.sc-highlight-card{min-height:170px;display:grid;grid-template-columns:78px 1fr;gap:18px;align-items:center;width:100%;padding:20px 22px;border-radius:12px;border:1px solid #bfd5ef;background:#f8fbff;text-align:left;font-family:inherit;cursor:pointer;transition:.15s}.sc-highlight-card:first-child{background:#fbf3ff;border-color:#d5b3f4}.sc-highlight-card:nth-child(3){background:#f0fff4;border-color:#a8e6b8}.sc-highlight-card:hover{transform:translateY(-2px)}.sc-highlight-card.is-active{box-shadow:0 0 0 3px rgba(91,184,255,.26),0 10px 22px rgba(15,39,74,.12)}.sc-highlight-card h3{margin:0 0 10px;font-size:18px;font-weight:950}.sc-highlight-card p{margin:0;color:#334155;font-size:13.5px;line-height:1.7;font-weight:700}
.sc-source-workbench{display:grid;grid-template-columns:1.05fr 1.05fr 1.25fr;grid-template-areas:"story reading code" "notes reading code";gap:16px;margin-top:18px}.sc-story-panel,.sc-reading-panel,.sc-code-panel,.sc-notes-panel{border-radius:12px;border:1px solid #c7d8ee;background:rgba(255,255,255,.94);box-shadow:0 8px 20px rgba(15,39,74,.06);padding:16px}.sc-story-panel{grid-area:story;background:#fffaf0;border-color:#e8ca89}.sc-reading-panel{grid-area:reading;background:#f7fbff}.sc-code-panel{grid-area:code;background:#eef7ff}.sc-notes-panel{grid-area:notes;background:#f4f9e9;border-color:#c9dfa2}.sc-source-workbench header{display:flex;align-items:center;gap:8px;margin-bottom:12px}.sc-source-workbench h2{margin:0;font-size:17px;font-weight:950}.sc-source-workbench header small{display:block;color:#667085;font-size:12px;font-weight:800}.sc-story-block{padding:12px 14px;border-radius:8px;background:#fff;border:1px solid #ead7a3;margin-top:10px}.sc-story-block strong{display:block;margin-bottom:6px;color:#6e4a0c}.sc-story-block p{margin:0;color:#3d2d13;font-size:13px;line-height:1.65;font-weight:750}.sc-story-block.is-warn{background:#fff4ef;border-color:#efb5aa}.sc-story-block.is-good{background:#eff9e8;border-color:#b8d79a}
.sc-source-list{list-style:none;margin:0;padding:0;display:grid;gap:10px}.sc-source-list li{display:grid;grid-template-columns:30px 1fr 62px;gap:10px;align-items:start;padding:12px;border-radius:9px;border:1px solid #d4e3f3;background:#fff}.sc-source-list li>span{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:#5fa34b;color:#fff;font-weight:950}.sc-source-list strong,.sc-source-list em,.sc-source-list small{display:block}.sc-source-list strong{font-family:Consolas,monospace;font-size:13px;color:#143866}.sc-source-list em{margin-top:2px;color:#7c4a13;font-size:12px;font-style:normal;font-weight:850}.sc-source-list p{margin:7px 0;color:#334155;font-size:12px;line-height:1.55}.sc-source-list small{color:#2f7a43;font-size:12px;font-weight:850}.sc-source-actions{display:flex;gap:6px}.sc-source-actions button,.sc-source-actions a{display:grid;place-items:center;width:28px;height:28px;border:1px solid #b8d1ef;border-radius:7px;background:#f8fbff;color:#164081;cursor:pointer}
.sc-code-panel header{justify-content:space-between}.sc-code-panel header>div{flex:1}.sc-code-panel header a{display:flex;align-items:center;gap:5px;color:#164081;text-decoration:none;font-size:12px;font-weight:950}.sc-code-panel pre{margin:0;padding:16px;border-radius:10px;background:#101927;color:#d8e8ff;font-size:12px;line-height:1.65;overflow:auto;max-height:390px}.sc-notes-panel ul{display:grid;gap:9px;margin:0 0 12px;padding:0;list-style:none}.sc-notes-panel li{display:flex;gap:8px;color:#2a3a1a;font-size:13px;line-height:1.55;font-weight:750}.sc-notes-panel li svg{flex:0 0 auto;color:#2b8a3e;margin-top:2px}.sc-notes-panel button{height:38px;padding:0 16px;border:0;border-radius:8px;background:#58a744;color:#fff;font-weight:950;cursor:pointer;box-shadow:0 2px 0 #357a2d}
.sc-bottom-grid{display:grid;grid-template-columns:1.25fr 1fr 1fr 1.1fr;gap:16px;margin-top:18px}.sc-card{position:relative;min-height:170px;padding:16px;border-radius:12px;border:1px solid #c7d8ee;background:#fff;overflow:hidden}.sc-card-header{display:flex;align-items:center;gap:8px;margin-bottom:12px}.sc-card-header h2{flex:1;margin:0;font-size:15px;font-weight:950}.sc-evidence-card{background:#f8fbff}.sc-evidence-card a{display:grid;grid-template-columns:18px 1fr 18px;gap:8px;align-items:center;min-height:34px;padding:7px 9px;border-radius:7px;color:#164081;text-decoration:none;font-size:12px;font-weight:850}.sc-evidence-card a:hover{background:#eaf3ff}.sc-reward-card{background:#f4f9e9;border-color:#c9dfa2}.sc-task-card{background:#fff7e7;border-color:#edcb88}.sc-task-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.sc-task-list li{display:flex;gap:8px;color:#4a3a18;font-size:12.5px;line-height:1.45;font-weight:800}.sc-task-list.compact li{color:#2a3a1a}.sc-next-card{background:#eef6ff;border-color:#bdd6f0}.sc-next-badge{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#5fa34b;color:#fff;font-style:normal}.sc-next-card p{max-width:62%;margin:0;color:#1f3a60;font-size:13px;line-height:1.55}.sc-next-card img{position:absolute;right:6px;top:42px;width:96px;image-rendering:pixelated}.sc-next-card button{position:absolute;left:16px;bottom:14px;height:40px;padding:0 18px;border:0;border-radius:8px;background:#62aa47;color:#fff;font-weight:950;display:flex;align-items:center;gap:6px}
@media(max-width:1280px){.sc-source-workbench{grid-template-columns:1fr;grid-template-areas:"story" "reading" "code" "notes"}.sc-bottom-grid,.sc-highlight-grid,.sc-decode-steps{grid-template-columns:1fr}.sc-hero-title{font-size:42px}}
`
