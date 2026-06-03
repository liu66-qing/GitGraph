import type { Dict } from '../translations'

export const showcase: Dict = {
  // Hero + general UI
  'showcase.back': { en: 'Back to learning map', zh: '返回学习地图' },
  'showcase.progressLabel': { en: 'Current progress', zh: '当前进度' },
  'showcase.heroTitle': { en: 'Stage 3 · Dissect the Magic', zh: 'Stage 3 · 拆它绝活' },
  'showcase.heroSubtitle': {
    en: "By now you're not just figuring out how it runs, but why it's brilliant.",
    zh: '走到这里，不只是看懂它怎么跑，还要看懂它为什么厉害。',
  },
  'showcase.heroDialog1': { en: "So the real reason it's so good", zh: '原来它厉害的根本，' },
  'showcase.heroDialog2': { en: 'is hidden in these elegant', zh: '就藏在这些精妙的' },
  'showcase.heroDialog3': { en: 'source-code designs!', zh: '源码设计里！' },
  'showcase.heroCharacterAlt': { en: 'Miner mentor', zh: '矿工导师' },

  // Decode strip
  'showcase.decodeAria': { en: 'Dissection method', zh: '拆解方法' },
  'showcase.decodeOrder': { en: 'Dissection order', zh: '拆解顺序' },
  'showcase.decodeIntro': {
    en: "Don't rush to memorize the takeaway — use these three questions to see why it's worth it",
    zh: '别急着背结论，先按这三问看懂它为什么值钱',
  },
  'showcase.decode1.label': { en: 'Ask the pain first', zh: '先问痛点' },
  'showcase.decode1.title': { en: 'What real headache does it solve?', zh: '它解决了什么真实麻烦？' },
  'showcase.decode1.body': { en: 'Start by seeing where the ordinary approach breaks down.', zh: '先看普通方案会在哪里断掉。' },
  'showcase.decode2.label': { en: 'Then weigh the trade-offs', zh: '再拆取舍' },
  'showcase.decode2.title': { en: 'Why is it designed this way?', zh: '为什么要这样设计？' },
  'showcase.decode2.body': { en: 'Look at the solution, its boundaries, and the trade-offs together.', zh: '把方案、边界和 tradeoff 放在一起看。' },
  'showcase.decode3.label': { en: 'Finally, find the evidence', zh: '最后找证据' },
  'showcase.decode3.title': { en: 'Which part of the code proves it works?', zh: '代码里哪段证明它成立？' },
  'showcase.decode3.body': { en: 'Go read the files and call chains with your questions in hand.', zh: '带着问题去看文件与调用链。' },

  // Section labels
  'showcase.problemLabel': { en: 'The problem it solves', zh: '它解决的问题' },
  'showcase.naiveLabel': { en: 'What a naive approach looks like', zh: '朴素方案会怎样' },
  'showcase.solutionLabel': { en: 'Its approach', zh: '它的做法' },
  'showcase.readingTitle': { en: 'Source repo reading path', zh: '原仓库阅读路线' },
  'showcase.readingHint': { en: 'Open the source in this order', zh: '按这个顺序打开源码' },
  'showcase.copyPathTitle': { en: 'Copy path', zh: '复制路径' },
  'showcase.openGithubTitle': { en: 'Open in GitHub', zh: '打开 GitHub' },
  'showcase.notesTitle': { en: 'Watch these spots while reading the code', zh: '读代码时盯住这几处' },
  'showcase.copySnippet': { en: 'Copy snippet', zh: '复制片段' },
  'showcase.evidenceTitle': { en: 'Code location checklist', zh: '代码定位清单' },
  'showcase.rewardTitle': { en: "What you'll gain on this page", zh: '这一页你会获得' },
  'showcase.reward1': { en: 'Spot design highlights', zh: '识别设计亮点' },
  'showcase.reward2': { en: 'Locate the core source', zh: '定位核心源码' },
  'showcase.reward3': { en: "Explain clearly why it's written this way", zh: '能讲清楚为什么这样写' },
  'showcase.taskTitle': { en: 'Level tasks (3/3)', zh: '本关任务（3/3）' },
  'showcase.task1': { en: 'Finish the source-reading path for one trick', zh: '读完一个绝活的源码路线' },
  'showcase.task2': { en: 'Open at least two GitHub files', zh: '打开至少两个 GitHub 文件' },
  'showcase.task3': { en: 'Restate the code evidence in your own words', zh: '用自己的话复述代码证据' },
  'showcase.nextTitle': { en: 'Next stop: Steal a trick', zh: '下一站：抄走一招' },
  'showcase.nextDesc': {
    en: 'Turn the design patterns in the source into a trick you can reuse in your own project.',
    zh: '把源码里的设计模式，变成你项目里能复用的一招。',
  },
  'showcase.nextButton': { en: 'Go to next step', zh: '进入下一步' },

  // Highlight 1
  'showcase.h1.title': { en: 'Memory is not an add-on, it is the system core', zh: '记忆不是外挂，是系统核心' },
  'showcase.h1.summary': {
    en: 'Memory drives context continuity, personalization and long-term behavior — it is not an optional plugin.',
    zh: '记忆决定上下文连续性、个性化体验与长期行为，不是可选插件。',
  },
  'showcase.h1.problem': {
    en: 'A plain chatbot only relies on the current prompt. Once a conversation grows long, continues across days, or the user profile shifts, it struggles to reliably remember key facts.',
    zh: '普通聊天机器人只依赖当前 prompt。会话一长、跨天继续或用户画像变化时，它就很难稳定记住关键事实。',
  },
  'showcase.h1.naive': {
    en: 'Stuff all history into the prompt. The result: rising token cost, important facts drowned in noise, and no precise control over what should stay resident.',
    zh: '把所有历史都塞进 prompt。结果是 token 成本上涨、重要事实被噪声淹没，而且无法精确控制哪些信息该常驻。',
  },
  'showcase.h1.solution': {
    en: 'Split memory into structured state blocks, long-term storage and runtime context, so the agent organizes "what it should know" before every move.',
    zh: '把记忆拆成结构化状态块、长期存储和运行时上下文，让 Agent 每轮行动前先组织"它应该知道什么"。',
  },
  'showcase.h1.read1.why': {
    en: 'First see how memory is modeled, and grasp that "memory is not a string, but a manageable state block".',
    zh: '先看记忆如何被建模，理解"记忆不是字符串，而是可管理的状态块"。',
  },
  'showcase.h1.read1.takeaway': { en: 'Learn how persona, human and custom blocks enter the context.', zh: '知道 persona、human、custom blocks 如何进入上下文。' },
  'showcase.h1.read2.why': {
    en: 'Next look at the state structure to confirm how memory becomes part of the agent\'s persistent state.',
    zh: '再看状态结构，确认 memory 如何成为 Agent 持久状态的一部分。',
  },
  'showcase.h1.read2.takeaway': { en: 'Tie together memory, tools, system prompt and identity.', zh: '把 memory、tools、system prompt 和 identity 串起来。' },
  'showcase.h1.read3.why': {
    en: 'Finally see how the runtime reads memory and turns it into context the model can use.',
    zh: '最后看运行时如何读取记忆，并把它转成模型可用的上下文。',
  },
  'showcase.h1.read3.takeaway': { en: 'Understand how memory takes part in every inference, not as an afterthought patch.', zh: '理解记忆如何参与每一次推理，而不是事后补丁。' },
  'showcase.h1.code.title': { en: 'Structured memory entering the context', zh: '结构化记忆进入上下文' },
  'showcase.h1.code.note1': { en: 'Block gives memory a label, capacity and boundaries — no longer one uncontrollable block of text.', zh: 'Block 让记忆拥有标签、容量和边界，不再是一段不可控长文本。' },
  'showcase.h1.code.note2': { en: 'compile is the key action: turning structured memory into context the model can read.', zh: 'compile 是关键动作：把结构化记忆转成模型能读的上下文。' },
  'showcase.h1.code.note3': { en: 'While reading the source, focus on how Block is updated, truncated and injected into the prompt.', zh: '读源码时重点追踪 Block 如何被更新、截断和注入 prompt。' },

  // Highlight 2
  'showcase.h2.title': { en: 'An agent is not a one-shot answer machine', zh: 'Agent 不是一次性回答器' },
  'showcase.h2.summary': {
    en: 'The agent is treated as a persistent entity, keeping its identity, tools and state across many turns.',
    zh: 'Agent 被当成持续存在的实体，跨多轮对话保存身份、工具与状态。',
  },
  'showcase.h2.problem': {
    en: 'If an agent is just a single function call, it cannot stably hold an identity, tool permissions, historical state and long-term goals.',
    zh: '如果 Agent 只是一次函数调用，它就无法稳定拥有身份、工具权限、历史状态和长期目标。',
  },
  'showcase.h2.naive': {
    en: 'Build it as a stateless API: request comes in, model answers, request ends. It looks simple, but the next request cannot restore the scene.',
    zh: '做成 stateless API：请求进来、模型回答、请求结束。看似简单，但下一次请求无法恢复现场。',
  },
  'showcase.h2.solution': {
    en: 'Load the entity state around an agent_id, reading, updating and saving the agent on every run so it can keep working across turns.',
    zh: '围绕 agent_id 加载实体状态，每次运行都读取、更新并保存 Agent，让它能跨轮次继续工作。',
  },
  'showcase.h2.read1.why': {
    en: 'First look at the Agent class itself, confirming it is a runtime entity rather than a utility function.',
    zh: '先看 Agent 类本体，确认它不是工具函数，而是运行时实体。',
  },
  'showcase.h2.read1.takeaway': { en: 'Find the relationship between step, messages, memory and tools.', zh: '找到 step、messages、memory、tools 之间的关系。' },
  'showcase.h2.read2.why': {
    en: 'Next look at the database model to understand how the agent persists across service restarts.',
    zh: '再看数据库模型，理解 Agent 如何跨服务重启持续存在。',
  },
  'showcase.h2.read2.takeaway': { en: 'Ground the "agent entity" into persistent fields.', zh: '把"智能体实体"落实到持久化字段。' },
  'showcase.h2.read3.why': {
    en: 'Finally see how the service entry retrieves an agent by ID, then hands the request to it.',
    zh: '最后看服务入口如何通过 ID 找回 Agent，再把请求交给它处理。',
  },
  'showcase.h2.read3.takeaway': { en: 'Understand how an API request returns to the same agent.', zh: '理解 API 请求如何回到同一个 Agent 身上。' },
  'showcase.h2.code.title': { en: 'Minimal way to read a persistent agent', zh: '持久 Agent 的最小读法' },
  'showcase.h2.code.note1': { en: 'agent_state is the main thread of reading the source — identity, memory and tools all revolve around it.', zh: 'agent_state 是源码阅读的主线，身份、记忆、工具都围绕它展开。' },
  'showcase.h2.code.note2': { en: 'step is not a pure function: it reads state, produces new state, and saves it when finished.', zh: 'step 不是纯函数：它读状态、产生新状态，并在结束时保存。' },
  'showcase.h2.code.note3': { en: "This explains why Letta's agent can keep working across sessions.", zh: '这解释了为什么 Letta 的 Agent 能跨会话继续工作。' },

  // Highlight 3
  'showcase.h3.title': { en: 'These abilities are actually one closed loop', zh: '这些能力其实是一个闭环' },
  'showcase.h3.summary': {
    en: 'Memory reads, decisions, tool execution and state write-back reinforce each other into an action loop.',
    zh: '记忆读取、决策、工具执行和状态写回彼此强化，形成行动闭环。',
  },
  'showcase.h3.problem': {
    en: 'Many agent demos call tools, but the tool results never settle into new state — so the next turn still treats the problem as if seeing it for the first time.',
    zh: '很多 Agent demo 会调用工具，但工具结果不会沉淀成新状态，下一轮仍然像第一次见到问题。',
  },
  'showcase.h3.naive': {
    en: 'Reply to the user right after a tool call — no reflection, no write-back, no change to future context.',
    zh: 'tool call 后直接回复用户，不反思、不写回、不改变未来上下文。',
  },
  'showcase.h3.solution': {
    en: 'After each action, write the tool results, user feedback and state changes back into the system, so the next step builds on an updated world.',
    zh: '每次行动后把工具结果、用户反馈和状态变化写回系统，让下一步基于更新后的世界。',
  },
  'showcase.h3.read1.why': {
    en: 'First see how one round of interaction splits into reasoning, tool calls and result handling.',
    zh: '先看一轮交互如何拆成推理、工具调用、结果处理。',
  },
  'showcase.h3.read1.takeaway': { en: 'Find the loop structure of "update after acting".', zh: '找到"行动之后再更新"的闭环结构。' },
  'showcase.h3.read2.why': {
    en: 'Next look at how tools are registered, executed and return structured results.',
    zh: '再看工具如何注册、执行和返回结构化结果。',
  },
  'showcase.h3.read2.takeaway': { en: "Understand that tools are not peripherals, but part of the agent's ability to act.", zh: '理解工具不是外设，而是 Agent 行动能力的一部分。' },
  'showcase.h3.read3.why': {
    en: 'Finally see how tool results affect memory or state.',
    zh: '最后看工具结果如何影响记忆或状态。',
  },
  'showcase.h3.read3.takeaway': { en: 'Confirm the loop\'s final link: results written back into future context.', zh: '确认闭环最后一环：结果写回未来上下文。' },
  'showcase.h3.code.title': { en: 'From tool call to state write-back', zh: '工具调用到状态写回' },
  'showcase.h3.code.note1': { en: 'The key to the loop is not "can call tools", but that tool results change memory/state.', zh: '闭环的关键不是"会调用工具"，而是工具结果会改变 memory/state。' },
  'showcase.h3.code.note2': { en: 'A single user request can contain multiple rounds of internal action.', zh: '一次用户请求可能包含多轮内部行动。' },
  'showcase.h3.code.note3': { en: 'While reading the source, focus on where the tool result is written back, and how that write-back shapes the next prompt.', zh: '读源码时重点找 tool result 被写回哪里，以及写回后如何影响下一次 prompt。' },
}
