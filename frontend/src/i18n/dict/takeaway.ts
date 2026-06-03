import type { Dict } from '../translations'

export const takeaway: Dict = {
  'takeaway.backToMap': { en: 'Back to learning map', zh: '返回学习地图' },
  'takeaway.progressLabel': { en: 'Current progress', zh: '当前进度' },
  'takeaway.heroTitle': { en: 'Stage 4 · Takeaway', zh: 'Stage 4 · 抄走一招' },
  'takeaway.heroSubtitle': {
    en: 'The real gain is not having seen it, but being able to take its methods with you and turn them into your own ability.',
    zh: '真正的收获不是看过，而是能把它的方法带走，变成你自己的能力。',
  },
  'takeaway.bubble': {
    en: "Pack the useful bits into your backpack — you'll put them to use on the next leg of the journey!",
    zh: '把有用的装进背包，下一段旅程就能用上！',
  },
  'takeaway.boardTitle': { en: 'What to take from this stop', zh: '这一站带走什么' },
  'takeaway.boardText': {
    en: "These aren't tricks specific to one repo, but reusable patterns for building agents. Taking them with you is the real reward.",
    zh: '这不是某个仓库的特定技巧，而是可以复用的智能体构建模式。把它们带走，才是真正的收获。',
  },

  'takeaway.pattern1.sub': { en: 'Hot / cold memory layering', zh: '冷热记忆分层' },
  'takeaway.pattern1.body': {
    en: 'Keep recent conversations in hot storage and long-term information in cold storage, retrieving on demand to cut costs and improve relevance.',
    zh: '把近期对话放在热存，长期信息放在冷存，按需检索，降低成本并提升相关性。',
  },
  'takeaway.pattern1.scene': {
    en: 'Assistants that need to remember preferences, history and conversation threads over the long term.',
    zh: '需要长期记住偏好、历史与对话线索的助手。',
  },
  'takeaway.pattern2.sub': { en: 'Persistent, stateful agent entities', zh: '持久化有状态的智能体实体' },
  'takeaway.pattern2.body': {
    en: 'Each agent has its own configuration, memory, tool permissions and state, persisted to storage to guarantee continuity.',
    zh: '每个智能体都有自己的配置、记忆、工具权限与状态，持久化存储，保证连续性。',
  },
  'takeaway.pattern2.scene': {
    en: 'Multi-turn, continuous interactions that need to remember user habits and context.',
    zh: '多轮连续提交互、需要记住用户习惯和上下文的场景。',
  },
  'takeaway.pattern3.sub': { en: 'Tool call + state update loop', zh: '工具调用 + 状态更新循环' },
  'takeaway.pattern3.body': {
    en: 'Use tools to gain external capabilities and write the results back to state/memory, forming a loop from action to update and back to action.',
    zh: '通过工具获取外部能力，并将结果写回状态/记忆，形成行动到更新再行动的闭环。',
  },
  'takeaway.pattern3.scene': {
    en: 'Agents that need to perform tasks, retrieve external data or trigger workflows.',
    zh: '需要执行任务、检索外部数据或触发流程的智能体。',
  },

  'takeaway.patternsTitle': {
    en: 'Three reusable building patterns (from letta-ai/letta)',
    zh: '三大可复用构建模式（来自 letta-ai/letta）',
  },
  'takeaway.bestFor': { en: 'Best for: ', zh: '适合场景：' },
  'takeaway.goodTitle': { en: 'When to use it', zh: '适用场景' },
  'takeaway.goodText': {
    en: 'Long-lived agents, multi-turn complex tasks and workflows, and scenarios that need personalization and long-term memory.',
    zh: '长期存在的智能体、多轮复杂任务与工作流、需要个性化与长期记忆的场景。',
  },
  'takeaway.badTitle': { en: 'When not to use it', zh: '不适用场景' },
  'takeaway.badText': {
    en: 'One-off Q&A, very simple script or command-line tools, and throwaway tasks that need no memory or state.',
    zh: '一次性问答、极其简单的脚本命令工具、无需记忆或状态的临时任务。',
  },

  'takeaway.codeTitle': { en: 'Minimal implementation snippet', zh: '最小实现片段' },

  'takeaway.rewardsTitle': { en: "What you've earned", zh: '你已经收获' },
  'takeaway.reward1': { en: 'Reusable patterns x3', zh: '可复用模式 x3' },
  'takeaway.reward2': { en: 'Minimal implementation snippet', zh: '最小实现片段' },
  'takeaway.reward3': { en: 'Judging when it fits', zh: '适用边界判断' },
  'takeaway.reward4': { en: 'An engineering perspective', zh: '工程化视角' },

  'takeaway.completeTitle': { en: 'Journey complete', zh: '旅程完成' },
  'takeaway.completeText': {
    en: "You've gone from spotting the tricks to taking a skill home!",
    zh: '你已经从看门道走到能带走一招！',
  },

  'takeaway.tryAnother': { en: 'Try another repo', zh: '再换一个仓库' },

  'takeaway.tasksTitle': { en: 'Stage tasks (3/3)', zh: '本关任务（3/3）' },
  'takeaway.task1': { en: 'Understand the three reusable patterns', zh: '理解三种可复用模式' },
  'takeaway.task2': { en: 'Know when to use them and when not to', zh: '知道什么时候该用/不该用' },
  'takeaway.task3': { en: 'Apply the patterns to your own project', zh: '能把模式迁移到自己的项目' },
}
