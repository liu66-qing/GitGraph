import type { Dict } from '../translations'

export const analyze: Dict = {
  'analyze.header.title': { en: 'Analyze Code Repository', zh: '分析代码仓库' },
  'analyze.header.subtitle': {
    en: 'Paste a GitHub URL to automatically clone it and lay out the architecture, graph, tour and learning path.',
    zh: '粘贴一个 GitHub 链接,自动克隆并梳理出架构、图谱、导览与学习路径。',
  },

  'analyze.field.urlLabel': { en: 'GitHub repo URL', zh: 'GitHub 仓库链接' },
  'analyze.field.subdirLabel': {
    en: 'Subdirectory (optional, analyze only a sub-app inside the repo)',
    zh: '子目录(可选,仅分析仓库内某个子应用)',
  },
  'analyze.field.maxCommitsLabel': {
    en: 'Max commits (optional, speeds up large repos)',
    zh: '最大提交数(可选,加速大仓库)',
  },
  'analyze.field.maxCommitsPlaceholder': { en: 'e.g. 50', zh: '例如 50' },

  'analyze.button.start': { en: 'Start Analysis', zh: '开始分析' },
  'analyze.button.analyzing': { en: 'Analyzing', zh: '分析中' },
  'analyze.advanced.toggle': { en: 'Advanced options', zh: '高级选项' },

  'analyze.action.openInGraph': { en: 'Open in code graph', zh: '在代码图谱中打开' },
  'analyze.action.refresh': { en: 'Refresh', zh: '刷新' },

  'analyze.repos.title': { en: 'Analyzed repos', zh: '已分析的仓库' },
  'analyze.repos.empty': {
    en: 'No analyzed repos yet. Paste a URL to get started.',
    zh: '还没有分析过的仓库。粘贴一个链接开始吧。',
  },
  'analyze.repos.symbols': { en: 'symbols', zh: '符号' },
  'analyze.repos.commits': { en: 'commits', zh: '提交' },
  'analyze.repos.hint': {
    en: 'Tip: the first analysis clones the repo into a local cache (re-analyzing the same repo reuses it). For large repos, fill in "Subdirectory" or "Max commits" to speed things up.',
    zh: '提示:首次分析会把仓库克隆到本地缓存(后续再分析同一仓库会复用)。大型仓库建议填写"子目录"或"最大提交数"以加快速度。',
  },

  'analyze.status.dispatching': {
    en: 'Dispatching the analysis task (the first run clones the repo and may take a moment)…',
    zh: '正在派发分析任务(首次会克隆仓库,可能需要一会儿)…',
  },
  'analyze.status.analyzing': {
    en: 'Started analyzing {id} —— cloning, parsing, building the graph and running the understanding Agents…',
    zh: '已开始分析 {id} —— 正在克隆、解析、构建图谱并运行理解 Agent…',
  },
  'analyze.status.done': {
    en: 'Analysis complete: {nodes} symbols and {commits} commits added to the graph.',
    zh: '分析完成:{nodes} 个符号、{commits} 个提交已入图。',
  },

  'analyze.error.invalidUrl': {
    en: 'Please enter a valid Git repo URL, e.g. https://github.com/owner/repo',
    zh: '请输入有效的 Git 仓库链接,例如 https://github.com/owner/repo',
  },
  'analyze.error.dispatchFailed': {
    en: 'Dispatch failed. Please check the URL or whether the backend is running.',
    zh: '派发失败,请检查链接或后端是否在运行。',
  },
  'analyze.error.timeout': {
    en: "Analysis is taking longer than expected and hasn't finished. The repo may be large or the backend busy, you can check the list below later.",
    zh: '分析耗时较长仍未完成。仓库可能较大或后端繁忙,可稍后在下方列表查看。',
  },
}
