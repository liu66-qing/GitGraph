import { NavLink } from 'react-router-dom'
import { Network, MessageSquare, FileUp, AlertTriangle, GitCommit, GitBranch } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/', label: '代码图谱', icon: Network },
  { path: '/query', label: '智能问答', icon: MessageSquare },
  { path: '/conflicts', label: '破坏性变更', icon: AlertTriangle },
  { path: '/timeline', label: '演化时间线', icon: GitCommit },
  { path: '/documents', label: '文档摄取', icon: FileUp },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-400" />
            GitGraph
          </h1>
          <p className="text-xs text-gray-400 mt-1">代码演化分析引擎 · Agentic RAG</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
          git 历史驱动的破坏性变更检测
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
