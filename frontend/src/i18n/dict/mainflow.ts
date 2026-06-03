import type { Dict } from '../translations'

export const mainflow: Dict = {
  'mainflow.back': { en: 'Back to learning map', zh: '返回学习地图' },
  'mainflow.progress.current': { en: 'Current progress', zh: '当前进度' },
  'mainflow.hero.title': { en: 'Stage 2 · Main Flow', zh: 'Stage 2 · 跑通主线' },
  'mainflow.hero.subtitle': {
    en: 'Walk through the main request flow once and truly run this repo in your head first.',
    zh: '沿着主请求流程走一遍，先在脑中把这个仓库真正跑起来。',
  },
  'mainflow.sign.main': { en: 'Main flow', zh: '主流程' },
  'mainflow.hero.characterAlt': { en: 'Pixel running character', zh: '像素跑步小人' },
  'mainflow.sign.next': { en: 'Keep going', zh: '继续前进' },

  'mainflow.flowChain.title': { en: 'Main request execution chain', zh: '主请求执行链路' },

  'mainflow.explain.titlePrefix': { en: 'Node details: ', zh: '节点说明：' },
  'mainflow.explain.whatToLook': { en: 'What to look at', zh: '看什么' },
  'mainflow.explain.whyFirst': { en: 'Why look first', zh: '为什么先看' },
  'mainflow.explain.outcome': { en: 'What you get after', zh: '跑完后得到什么' },

  'mainflow.evidence.title': { en: 'Minimal evidence links', zh: '最小证据链接' },

  'mainflow.reward.title': { en: "What you'll gain on this page", zh: '这一页你会获得' },
  'mainflow.reward1.title': { en: 'Understand the main flow', zh: '看懂主流程' },
  'mainflow.reward1.text': { en: 'Build an overall mental map', zh: '建立整体心智地图' },
  'mainflow.reward2.title': { en: 'Know the key nodes', zh: '知道关键节点' },
  'mainflow.reward2.text': { en: "Understand each step's role", zh: '理解每步的职责' },
  'mainflow.reward3.title': { en: 'Retell the execution chain yourself', zh: '能自己复述执行链路' },
  'mainflow.reward3.text': { en: 'Explain the flow to others', zh: '把流程讲给别人听' },

  'mainflow.task.title': { en: 'Tasks for this level (3/3)', zh: '本关任务（3/3）' },
  'mainflow.task1': {
    en: 'Walk through the main flow once and understand what each node does',
    zh: '沿着主流程走一遍，理解每个节点做什么',
  },
  'mainflow.task2': {
    en: 'Find the matching snippets in the code and mark their locations',
    zh: '在代码中找到对应片段并标注位置',
  },
  'mainflow.task3': {
    en: 'Try to retell the entire execution chain in your own words',
    zh: '尝试用自己的话复述整条执行链路',
  },

  'mainflow.next.title': { en: 'Next stop: Dissect the tricks', zh: '下一站：拆它绝活' },
  'mainflow.next.body1': { en: 'Dive into core modules and design details,', zh: '深入核心模块与设计细节，' },
  'mainflow.next.body2': { en: 'and understand its signature moves.', zh: '看懂它的拿手好戏。' },
  'mainflow.next.button': { en: 'Go to next step', zh: '进入下一步' },

  'mainflow.node1.title': { en: 'Receive request', zh: '收到请求' },
  'mainflow.node1.note': { en: 'User input enters the system', zh: '用户输入进入系统' },
  'mainflow.node1.iconAlt': { en: 'Request', zh: '请求' },
  'mainflow.node1.explanation': {
    en: 'The user sends a message to the Agent via the REST API or SDK. The server receives the request, finds the matching Agent instance, and prepares to start the Agent Loop.',
    zh: '用户通过 REST API 或 SDK 发送一条消息给 Agent。服务端接收请求，找到对应的 Agent 实例，准备启动 Agent Loop。',
  },
  'mainflow.node1.whatToLook': {
    en: 'REST API routes, request body structure, Agent ID routing',
    zh: 'REST API 路由、请求体结构、Agent ID 路由',
  },
  'mainflow.node1.whyFirst': {
    en: 'This is the trigger point of the whole flow; understanding the entry lets you trace everything that follows',
    zh: '这是整个流程的触发点，理解入口才能追踪后续',
  },
  'mainflow.node1.outcome': {
    en: "A pending user message enters the Agent's processing queue",
    zh: '一个待处理的用户消息进入 Agent 的处理队列',
  },

  'mainflow.node2.title': { en: 'Read memory', zh: '读取记忆' },
  'mainflow.node2.note': { en: 'Read session state and long-term memory', zh: '读取会话状态与长期记忆' },
  'mainflow.node2.iconAlt': { en: 'Memory', zh: '记忆' },
  'mainflow.node2.explanation': {
    en: 'Before making any decision, the Agent first reads the current session context, persona, memory blocks, and useful historical state to ensure later actions are built on reliable information.',
    zh: '在做任何决定之前，Agent 会先读取当前会话上下文、角色设定、记忆块以及有用的历史状态，确保后续动作建立在可靠信息之上。',
  },
  'mainflow.node2.whatToLook': {
    en: 'Session context, role / persona, memory blocks, state variables',
    zh: '会话上下文、角色 / persona、记忆块、状态变量',
  },
  'mainflow.node2.whyFirst': {
    en: 'Grasp existing information first to avoid duplicate, conflicting, or pointless actions',
    zh: '先掌握已有信息，避免重复、冲突或无谓的动作',
  },
  'mainflow.node2.outcome': {
    en: 'The currently available context set, serving as the basis for later decisions',
    zh: '当前可用的上下文集合，作为后续决策依据',
  },

  'mainflow.node3.title': { en: 'Plan action', zh: '规划动作' },
  'mainflow.node3.note': { en: 'Decide whether to think, retrieve, or call a tool', zh: '判断是否思考、检索或调用工具' },
  'mainflow.node3.iconAlt': { en: 'Planning', zh: '规划' },
  'mainflow.node3.explanation': {
    en: 'The LLM reasons over the current context and decides whether the next step is to reply directly, call a tool, or retrieve more information.',
    zh: 'LLM 根据当前上下文进行推理，决定下一步是直接回复、调用工具、还是检索更多信息。',
  },
  'mainflow.node3.whatToLook': {
    en: 'LLM call logic, prompt assembly, tool_choice parameter',
    zh: 'LLM 调用逻辑、prompt 组装、tool_choice 参数',
  },
  'mainflow.node3.whyFirst': {
    en: 'This is the Agent’s "brain" and it determines the entire behavior path',
    zh: '这是 Agent 的"大脑"，决定了整个行为路径',
  },
  'mainflow.node3.outcome': {
    en: 'A decision: which tool to call / reply directly / keep thinking',
    zh: '一个决策：调用哪个工具 / 直接回复 / 继续思考',
  },

  'mainflow.node4.title': { en: 'Execute tool', zh: '执行工具' },
  'mainflow.node4.note': { en: 'Call the tool and get the result back', zh: '调工具并拿回结果' },
  'mainflow.node4.iconAlt': { en: 'Tool', zh: '工具' },
  'mainflow.node4.explanation': {
    en: 'Based on the LLM’s decision, execute the matching tool call (memory operation, external API, code execution, etc.) and obtain the result.',
    zh: '根据 LLM 的决策，执行对应的工具调用（记忆操作、外部 API、代码执行等），获取执行结果。',
  },
  'mainflow.node4.whatToLook': {
    en: 'Tool registry, tool executor, server-side vs client-side',
    zh: '工具注册表、工具执行器、server-side vs client-side',
  },
  'mainflow.node4.whyFirst': {
    en: 'Tools are the only way the Agent interacts with the outside world',
    zh: '工具是 Agent 与外部世界交互的唯一方式',
  },
  'mainflow.node4.outcome': {
    en: 'The tool execution result, ready to be written back to the context',
    zh: '工具执行结果，准备写回上下文',
  },

  'mainflow.node5.title': { en: 'Update state', zh: '更新状态' },
  'mainflow.node5.note': { en: 'Write new info back to memory and state', zh: '把新信息写回记忆与状态' },
  'mainflow.node5.iconAlt': { en: 'State', zh: '状态' },
  'mainflow.node5.explanation': {
    en: 'Write the tool execution result and newly learned information into memory blocks and the database, updating the Agent’s persistent state.',
    zh: '将工具执行结果、新学到的信息写入记忆块和数据库，更新 Agent 的持久化状态。',
  },
  'mainflow.node5.whatToLook': {
    en: 'Memory write logic, state persistence, database operations',
    zh: '记忆写入逻辑、状态持久化、数据库操作',
  },
  'mainflow.node5.whyFirst': {
    en: 'This is the key step where the Agent "learns"',
    zh: '这是 Agent "学习"的关键步骤',
  },
  'mainflow.node5.outcome': {
    en: 'The Agent state is updated and new information is persisted',
    zh: 'Agent 状态已更新，新信息已持久化',
  },

  'mainflow.node6.title': { en: 'Generate reply', zh: '生成回复' },
  'mainflow.node6.note': { en: 'Compose the final answer and return it to the user', zh: '组织最终答案返回用户' },
  'mainflow.node6.iconAlt': { en: 'Reply', zh: '回复' },
  'mainflow.node6.explanation': {
    en: 'The Agent Loop decides the task is complete, composes the final result into a user-readable reply, and returns it via the API.',
    zh: 'Agent Loop 判断任务完成，将最终结果组织为用户可读的回复，通过 API 返回。',
  },
  'mainflow.node6.whatToLook': {
    en: 'Reply assembly logic, streaming output, response format',
    zh: '回复组装逻辑、流式输出、响应格式',
  },
  'mainflow.node6.whyFirst': {
    en: 'This is the only output the user actually sees',
    zh: '这是用户唯一能看到的输出',
  },
  'mainflow.node6.outcome': {
    en: 'The user receives the reply and one complete Agent interaction ends',
    zh: '用户收到回复，一次完整的 Agent 交互结束',
  },
}
