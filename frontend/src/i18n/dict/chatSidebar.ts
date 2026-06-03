import type { Dict } from '../translations'

export const chatSidebar: Dict = {
  'chatSidebar.noAnswer': { en: 'Unable to answer', zh: '无法回答' },
  'chatSidebar.requestFailed': {
    en: 'Request failed. Please check that the backend is running.',
    zh: '请求失败,请检查后端是否运行。',
  },
  'chatSidebar.title': { en: 'Ask the codebase', zh: '问代码库' },
  'chatSidebar.emptyTitle': { en: 'Source-grounded intelligent Q&A', zh: '基于源码的智能问答' },
  'chatSidebar.emptyHint': {
    en: 'Try: "how do agents collaborate" / "how does data flow"',
    zh: '试试:"agent 怎么协作" / "数据怎么流动"',
  },
  'chatSidebar.inputPlaceholder': { en: 'Type your question…', zh: '输入问题…' },
}
