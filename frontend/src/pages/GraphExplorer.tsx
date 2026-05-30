import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Search, GitBranch, AlertCircle } from 'lucide-react'
import { api, type CodeGraphNode, type CodeGraphEdge } from '../services/api'

// A code symbol in the force-directed graph.
interface GraphNode {
  id: string
  name: string
  kind: string // module | class | function | method
  signature?: string
  file_path?: string
  x?: number
  y?: number
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: string // CALLS | IMPORTS | INHERITS | DEFINES
}

// Color by code symbol kind (not document entity type).
const KIND_COLORS: Record<string, string> = {
  module: '#6366f1',
  class: '#10b981',
  function: '#f59e0b',
  method: '#06b6d4',
}

// Edge color by relation kind, so call/import/inherit structure reads at a glance.
const EDGE_COLORS: Record<string, string> = {
  CALLS: '#f59e0b',
  IMPORTS: '#6366f1',
  INHERITS: '#10b981',
  DEFINES: '#cbd5e1',
}

// Short name for display: keep the last 2 dotted segments (Class.method / module.fn).
function shortName(qname: string): string {
  const parts = qname.split('.')
  return parts.length <= 2 ? qname : parts.slice(-2).join('.')
}

export default function GraphExplorer() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [links, setLinks] = useState<GraphLink[]>([])
  const [repoId, setRepoId] = useState<string>('')
  const [repos, setRepos] = useState<string[]>([])
  const [isSample, setIsSample] = useState(false)

  // Load the list of analyzed repos; pick the first, else fall back to sample.
  useEffect(() => {
    let cancelled = false
    api
      .listRepos()
      .then((res) => {
        if (cancelled) return
        const ids = (res.repositories || []).map((r) => r.repo_id)
        if (ids.length > 0) {
          setRepos(ids)
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

  // Fetch the code graph for the selected repo.
  useEffect(() => {
    if (!repoId) return
    let cancelled = false
    api
      .getRepoGraph(repoId)
      .then((res) => {
        if (cancelled) return
        if (!res.nodes || res.nodes.length === 0) {
          loadSample()
          return
        }
        setIsSample(false)
        setNodes(res.nodes.map(toNode))
        setLinks((res.edges || []).map((e) => ({ source: e.source, target: e.target, type: e.type })))
      })
      .catch(() => loadSample())
    return () => {
      cancelled = true
    }
  }, [repoId])

  function loadSample() {
    setIsSample(true)
    setNodes(SAMPLE_NODES)
    setLinks(SAMPLE_LINKS)
  }

  // Filter by symbol name; empty query shows everything.
  const visibleNodes = searchQuery
    ? nodes.filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : nodes
  const visibleIds = new Set(visibleNodes.map((n) => n.id))
  const nameToId = new Map(nodes.map((n) => [n.name, n.id]))
  const visibleLinks = links.filter((l) => {
    const s = typeof l.source === 'string' ? l.source : l.source.id
    const t = typeof l.target === 'string' ? l.target : l.target.id
    // Links reference nodes by name; map to ids for the filter check.
    const sid = visibleIds.has(s) ? s : nameToId.get(s)
    const tid = visibleIds.has(t) ? t : nameToId.get(t)
    return sid && tid && visibleIds.has(sid) && visibleIds.has(tid)
  })

  useEffect(() => {
    if (!svgRef.current) return
    renderGraph(svgRef.current, visibleNodes, visibleLinks, setSelectedNode)
  }, [nodes, links, searchQuery])

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 border-b bg-white flex items-center gap-4 flex-wrap">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-500" />
          代码图谱浏览器
        </h2>
        {repos.length > 1 && (
          <select
            value={repoId}
            onChange={(e) => setRepoId(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-sm"
          >
            {repos.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="按符号名搜索(函数/类/方法)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {isSample && <SampleBadge />}
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 relative bg-gray-50">
          <svg ref={svgRef} className="w-full h-full" />
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow p-3 text-xs">
            <p className="font-medium mb-2">符号类型</p>
            {Object.entries(KIND_COLORS).map(([kind, color]) => (
              <div key={kind} className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span>{KIND_LABELS[kind] || kind}</span>
              </div>
            ))}
            <p className="font-medium mt-3 mb-2">关系类型</p>
            {Object.entries(EDGE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2 mb-1">
                <div className="w-4 h-0.5" style={{ backgroundColor: color }} />
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedNode && (
          <NodeDetail node={selectedNode} links={links} nameToId={nameToId} nodes={nodes} />
        )}
      </div>
    </div>
  )
}

const KIND_LABELS: Record<string, string> = {
  module: '模块 module',
  class: '类 class',
  function: '函数 function',
  method: '方法 method',
}

function toNode(n: CodeGraphNode): GraphNode {
  return {
    id: n.id || n.name,
    name: n.name,
    kind: n.kind || 'function',
    signature: n.signature || undefined,
    file_path: n.file_path || undefined,
  }
}

function SampleBadge() {
  return (
    <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
      <AlertCircle className="w-3 h-3" />
      示例数据(后端未连接,展示工具分析自身的结构)
    </span>
  )
}

function NodeDetail({
  node,
  links,
  nameToId,
  nodes,
}: {
  node: GraphNode
  links: GraphLink[]
  nameToId: Map<string, string>
  nodes: GraphNode[]
}) {
  const idToName = new Map(nodes.map((n) => [n.id, n.name]))
  const resolve = (ref: string | GraphNode) => (typeof ref === 'string' ? ref : ref.id)
  // Outgoing: this symbol -> others (what it calls/imports/inherits/defines).
  const outgoing = links.filter((l) => {
    const s = resolve(l.source)
    return s === node.name || nameToId.get(s) === node.id || s === node.id
  })
  // Incoming: others -> this symbol (callers / dependents).
  const incoming = links.filter((l) => {
    const t = resolve(l.target)
    return t === node.name || nameToId.get(t) === node.id || t === node.id
  })

  const label = (ref: string | GraphNode) => {
    const r = resolve(ref)
    return shortName(idToName.get(r) || r)
  }

  return (
    <aside className="w-80 border-l bg-white p-4 overflow-auto">
      <h3 className="font-semibold text-sm break-all">{node.name}</h3>
      <span
        className="inline-block px-2 py-0.5 rounded text-xs text-white mt-1"
        style={{ backgroundColor: KIND_COLORS[node.kind] || '#6b7280' }}
      >
        {KIND_LABELS[node.kind] || node.kind}
      </span>
      {node.signature && (
        <pre className="mt-3 text-xs bg-gray-50 border rounded p-2 whitespace-pre-wrap break-all font-mono">
          {node.signature}
        </pre>
      )}
      {node.file_path && <p className="mt-2 text-xs text-gray-400 break-all">{node.file_path}</p>}

      <div className="mt-4 text-sm">
        <p className="font-medium text-gray-800 mb-2">依赖 / 调用出向 ({outgoing.length})</p>
        {outgoing.length === 0 && <p className="text-xs text-gray-400">无</p>}
        {outgoing.map((l, i) => (
          <div key={i} className="py-1 border-b border-gray-100 flex justify-between text-xs">
            <span className="text-gray-700 break-all">{label(l.target)}</span>
            <span style={{ color: EDGE_COLORS[l.type] }}>{l.type}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm">
        <p className="font-medium text-gray-800 mb-2">被调用 / 入向 ({incoming.length})</p>
        {incoming.length === 0 && <p className="text-xs text-gray-400">无</p>}
        {incoming.map((l, i) => (
          <div key={i} className="py-1 border-b border-gray-100 flex justify-between text-xs">
            <span className="text-gray-700 break-all">{label(l.source)}</span>
            <span style={{ color: EDGE_COLORS[l.type] }}>{l.type}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

function renderGraph(
  svg: SVGSVGElement,
  nodes: GraphNode[],
  links: GraphLink[],
  onNodeClick: (node: GraphNode) => void
) {
  const width = svg.clientWidth || 800
  const height = svg.clientHeight || 600
  d3.select(svg).selectAll('*').remove()

  // Links reference nodes by name; d3.forceLink resolves by node.id, so index by both.
  const byKey = new Map<string, GraphNode>()
  nodes.forEach((n) => {
    byKey.set(n.id, n)
    byKey.set(n.name, n)
  })
  const resolvedLinks = links
    .map((l) => {
      const s = byKey.get(typeof l.source === 'string' ? l.source : l.source.id)
      const t = byKey.get(typeof l.target === 'string' ? l.target : l.target.id)
      return s && t ? { source: s.id, target: t.id, type: l.type } : null
    })
    .filter(Boolean) as { source: string; target: string; type: string }[]

  const g = d3.select(svg).append('g')
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => g.attr('transform', event.transform))
  d3.select(svg).call(zoom)

  const simulation = d3
    .forceSimulation(nodes as d3.SimulationNodeDatum[])
    .force('link', d3.forceLink(resolvedLinks).id((d: any) => d.id).distance(90))
    .force('charge', d3.forceManyBody().strength(-260))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(26))

  const link = g
    .append('g')
    .selectAll('line')
    .data(resolvedLinks)
    .join('line')
    .attr('stroke', (d) => EDGE_COLORS[d.type] || '#cbd5e1')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.7)

  const node = g
    .append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'pointer')
    .on('click', (_event, d) => onNodeClick(d as GraphNode))
    .call(
      d3
        .drag<any, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
    )

  // Modules render as squares, everything else as circles — quick visual hierarchy.
  node
    .filter((d) => d.kind === 'module')
    .append('rect')
    .attr('x', -9)
    .attr('y', -9)
    .attr('width', 18)
    .attr('height', 18)
    .attr('rx', 3)
    .attr('fill', (d) => KIND_COLORS[d.kind] || '#6b7280')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
  node
    .filter((d) => d.kind !== 'module')
    .append('circle')
    .attr('r', (d) => (d.kind === 'class' ? 11 : 8))
    .attr('fill', (d) => KIND_COLORS[d.kind] || '#6b7280')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)

  node
    .append('text')
    .text((d) => shortName(d.name))
    .attr('x', 14)
    .attr('y', 4)
    .attr('font-size', '10px')
    .attr('fill', '#374151')

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)
    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
  })
}

// === Sample data: GitGraph analyzing its OWN structure (code semantics) ===
// Used only when the backend has no data, so the demo never shows a blank canvas.
const SAMPLE_NODES: GraphNode[] = [
  { id: 'git_loader', name: 'ingestion.git_loader', kind: 'module' },
  { id: 'iter_history', name: 'git_loader.iter_history', kind: 'function', signature: 'iter_history(repo_path, max_commits=None)' },
  { id: 'load_snapshot', name: 'git_loader.load_commit_snapshot', kind: 'function', signature: 'load_commit_snapshot(repo_path, commit, parse_cache=None)' },
  { id: 'batch_read', name: 'git_loader._batch_read_blobs', kind: 'function', signature: '_batch_read_blobs(repo_path, shas)' },
  { id: 'parser', name: 'ingestion.code_parser', kind: 'module' },
  { id: 'parse_src', name: 'code_parser.parse_python_source', kind: 'function', signature: 'parse_python_source(source, module_name, file_path="")' },
  { id: 'detector', name: 'evolution.breaking_change_detector', kind: 'module' },
  { id: 'scan_history', name: 'detector.scan_history', kind: 'function', signature: 'scan_history(snapshots)' },
  { id: 'diff_snap', name: 'detector.diff_snapshots', kind: 'function', signature: 'diff_snapshots(old_parses, new_parses, ...)' },
  { id: 'pipeline_cls', name: 'evolution.CodeRepoPipeline', kind: 'class' },
  { id: 'process_repo', name: 'CodeRepoPipeline.process_repository', kind: 'method', signature: 'process_repository(repo_id, repo_path, max_commits=None)' },
]

const SAMPLE_LINKS: GraphLink[] = [
  { source: 'git_loader.iter_history', target: 'git_loader.load_commit_snapshot', type: 'CALLS' },
  { source: 'git_loader.load_commit_snapshot', target: 'git_loader._batch_read_blobs', type: 'CALLS' },
  { source: 'git_loader.load_commit_snapshot', target: 'code_parser.parse_python_source', type: 'CALLS' },
  { source: 'detector.scan_history', target: 'detector.diff_snapshots', type: 'CALLS' },
  { source: 'CodeRepoPipeline.process_repository', target: 'git_loader.iter_history', type: 'CALLS' },
  { source: 'CodeRepoPipeline.process_repository', target: 'detector.scan_history', type: 'CALLS' },
  { source: 'ingestion.git_loader', target: 'ingestion.code_parser', type: 'IMPORTS' },
  { source: 'evolution.breaking_change_detector', target: 'ingestion.code_parser', type: 'IMPORTS' },
  { source: 'ingestion.git_loader', target: 'git_loader.iter_history', type: 'DEFINES' },
  { source: 'ingestion.code_parser', target: 'code_parser.parse_python_source', type: 'DEFINES' },
  { source: 'evolution.breaking_change_detector', target: 'detector.scan_history', type: 'DEFINES' },
  { source: 'evolution.CodeRepoPipeline', target: 'CodeRepoPipeline.process_repository', type: 'DEFINES' },
]
