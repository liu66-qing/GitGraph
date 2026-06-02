# "跑通主线" 页面实现提示词

> 给 Claude Sonnet 的执行提示词。

---

## 你的任务

实现 CodeGraph 的第二个学习站点页面「跑通主线」。

**文件:** 创建 `frontend/src/pages/MainFlow.tsx`(如已存在则重写)。
**背景图:** 已在 `stageBackgrounds.mainflow` 中注册,通过 PixelStageKit 使用。

**关键原则:**
1. **页面独立性** — 不修改任何其他页面文件。
2. **使用 PixelStageKit 组件库** — 不手写像素卡片样式,不生成新 sprite。

---

## 必读文件(按顺序)

1. `CODEGRAPH_PRD.md` 第10节 Stage 2 + 第20节 PixelStageKit
2. `frontend/src/components/common/PixelStageKit.tsx` — 了解可用组件和 Props
3. `frontend/src/assets/pixel/stage-library/index.ts` — 了解可用资产

---

## 页面定位

用户已经在"先看门道"了解了仓库是什么。现在进入第二站,目标是**在脑子里把主请求流程跑通一遍**。

**用户心理:** "我知道它是什么了,但它到底怎么跑的?一个请求进来后经历了什么?"

**页面目标:** 用户读完后能闭上眼复述"一个请求从进入到返回经历了哪几步"。

---

## 页面结构(使用 PixelStageKit 组件)

```tsx
import {
  StageHero,
  ParchmentPanel,
  FlowChain,
  TaskChecklist,
  NextStageCard,
  RewardStrip,
  CodeFoldPanel,
  PixelAsset,
} from '../components/common/PixelStageKit'
```

### 1. StageHero (顶部场景区)

```tsx
<StageHero
  stage="Stage 2"
  title="跑通主线"
  subtitle="沿着主请求流程走一遍，先在脑中把这个仓库真正跑起来。"
  background="mainflow"
  mentor="mentorRunner"
  speech="一切冒险的开始，先了解它，才能走得更远！"
  progress={58}
/>
```

### 2. 主内容区 — 左右分栏

使用 CSS Grid: `grid-template-columns: 2fr 1fr; gap: 20px;`

#### 左栏: FlowChain (主请求执行链路)

```tsx
<ParchmentPanel title="主请求执行链路" icon={<LinkIcon />} tone="blue">
  <FlowChain
    steps={flowSteps}
    activeIndex={selectedNode}
  />
</ParchmentPanel>
```

FlowChain 已经内置了:
- 水平排列的编号节点
- 节点间的箭头
- activeIndex 高亮

**你需要做的额外工作:** FlowChain 目前不支持点击切换 activeIndex。在页面内包一层状态管理:

```tsx
const [selectedNode, setSelectedNode] = useState(0)
// 给 FlowChain 的每个节点加 onClick
```

如果 FlowChain 不支持 onClick,在页面内用一个自定义的 wrapper 组件实现点击交互(不要修改 PixelStageKit.tsx)。

#### 右栏: 节点说明卡片

根据 `selectedNode` 显示对应节点的详细解释:

```tsx
<ParchmentPanel title={`节点说明：${currentNode.title}`} icon={<BookOpen />} tone="neutral">
  <p>{currentNode.detail.explanation}</p>
  <h4>🔍 看什么</h4>
  <p>{currentNode.detail.whatToLook}</p>
  <h4>💡 为什么先看</h4>
  <p>{currentNode.detail.whyFirst}</p>
  <h4>📦 跑完后得到什么</h4>
  <p>{currentNode.detail.outcome}</p>
</ParchmentPanel>
```

### 3. 底部区 — 四栏卡片

使用 CSS Grid: `grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px;`
在 `<1280px` 时改为 `grid-template-columns: 1fr 1fr;`

#### 卡片1: 最小证据链接

```tsx
<ParchmentPanel title="最小证据链接" icon={<Link />} tone="green">
  {evidenceLinks.map(link => (
    <a href={link.githubUrl} target="_blank">{link.label} →</a>
  ))}
</ParchmentPanel>
```

#### 卡片2: RewardStrip (这一页你会获得)

```tsx
<RewardStrip items={[
  { label: "看懂主线流程", detail: "建立整体心智地图" },
  { label: "知道关键节点", detail: "理解每段的职责" },
  { label: "能自己复述执行链路", detail: "把流程讲给别人听" },
]} />
```

#### 卡片3: TaskChecklist (本关任务)

```tsx
<TaskChecklist
  title="本关任务（3/3）"
  tasks={[
    "沿着主流程走一遍，理解每个节点做什么",
    "在代码中找到对应片段并标注位置",
    "尝试用自己的话复述整条执行链路",
  ]}
/>
```

#### 卡片4: NextStageCard (下一站)

```tsx
<NextStageCard
  title="下一站：拆它绝活"
  body="深入核心模块与设计细节，看懂它的拿手好戏。"
  asset="mineEntrance"
/>
```

---

## 数据结构

```typescript
interface FlowNode {
  id: number;
  title: string;
  note: string;       // FlowChain 的 note 字段
  icon?: ReactNode;   // 可选,FlowChain 支持
  detail: {
    explanation: string;
    whatToLook: string;
    whyFirst: string;
    outcome: string;
  };
}

interface MainFlowData {
  flowNodes: FlowNode[];
  evidenceLinks: { label: string; githubUrl: string }[];
}
```

### Mock 数据(以 letta-ai/letta 为例)

```typescript
const mockFlowNodes: FlowNode[] = [
  {
    id: 1, title: "收到请求", note: "用户输入进入系统",
    detail: {
      explanation: "用户通过 REST API 或 SDK 发送一条消息给 Agent。服务端接收请求,找到对应的 Agent 实例,准备启动 Agent Loop。",
      whatToLook: "REST API 路由、请求体结构、Agent ID 路由",
      whyFirst: "这是整个流程的触发点,理解入口才能追踪后续",
      outcome: "一个待处理的用户消息进入 Agent 的处理队列"
    }
  },
  {
    id: 2, title: "读取记忆", note: "读取会话状态与长期记忆",
    detail: {
      explanation: "在做任何决策之前，Agent 会先读取当前会话上下文、角色设定、记忆块以及有用的历史状态，确保后续动作建立在可靠信息之上。",
      whatToLook: "会话上下文、角色/persona、记忆块、状态变量",
      whyFirst: "先掌握已有信息，避免重复、冲突或无谓的动作",
      outcome: "当前可用的上下文集合，作为后续决策依据"
    }
  },
  {
    id: 3, title: "规划动作", note: "判断是否思考、检索或调用工具",
    detail: {
      explanation: "LLM 根据当前上下文进行推理,决定下一步是直接回复、调用工具、还是检索更多信息。",
      whatToLook: "LLM 调用逻辑、prompt 组装、tool_choice 参数",
      whyFirst: "这是 Agent 的'大脑',决定了整个行为路径",
      outcome: "一个决策:调用哪个工具/直接回复/继续思考"
    }
  },
  {
    id: 4, title: "执行工具", note: "调工具并拿回结果",
    detail: {
      explanation: "根据 LLM 的决策,执行对应的工具调用(记忆操作、外部 API、代码执行等),获取执行结果。",
      whatToLook: "工具注册表、工具执行器、server-side vs client-side",
      whyFirst: "工具是 Agent 与外部世界交互的唯一方式",
      outcome: "工具执行结果,准备写回上下文"
    }
  },
  {
    id: 5, title: "更新状态", note: "把新信息写回记忆与状态",
    detail: {
      explanation: "将工具执行结果、新学到的信息写入记忆块和数据库,更新 Agent 的持久化状态。",
      whatToLook: "记忆写入逻辑、状态持久化、数据库操作",
      whyFirst: "这是 Agent '学习'的关键步骤",
      outcome: "Agent 状态已更新,新信息已持久化"
    }
  },
  {
    id: 6, title: "生成回复", note: "组织最终答案返回用户",
    detail: {
      explanation: "Agent Loop 判断任务完成,将最终结果组织为用户可读的回复,通过 API 返回。",
      whatToLook: "回复组装逻辑、流式输出、响应格式",
      whyFirst: "这是用户唯一能看到的输出",
      outcome: "用户收到回复,一次完整的 Agent 交互结束"
    }
  },
]

const mockEvidenceLinks = [
  { label: "main.py / server entry", githubUrl: "https://github.com/letta-ai/letta/blob/main/letta/server/server.py" },
  { label: "agent loop", githubUrl: "https://github.com/letta-ai/letta/blob/main/letta/agent.py" },
  { label: "memory manager", githubUrl: "https://github.com/letta-ai/letta/blob/main/letta/memory.py" },
]
```

---

## 页面独立性约束

```
⚠️ 绝对禁止:
- 修改 PixelStageKit.tsx
- 修改 stage-library/index.ts
- 修改 index.css 中已有的类名
- 修改 Home.tsx / Overview.tsx / Layout.tsx
- 修改 App.tsx 中已有路由

✅ 允许:
- 创建/重写 pages/MainFlow.tsx
- 在 App.tsx 中添加 /mainflow 路由(如果不存在)
- 在 MainFlow.tsx 内定义页面专属的子组件和样式
- Import PixelStageKit 组件(不修改)
- Import stage-library 资产(不修改)
```

---

## 验收清单

- [ ] `pages/MainFlow.tsx` 存在且可独立渲染
- [ ] 没有修改 PixelStageKit.tsx 或其他页面文件
- [ ] 使用 `StageHero` 组件,background 为 `"mainflow"`
- [ ] 使用 `FlowChain` 组件展示6个流程节点
- [ ] 点击节点可切换右栏的详细说明(页面内状态管理)
- [ ] 使用 `ParchmentPanel` 包裹所有信息卡片
- [ ] 使用 `TaskChecklist` 展示本关任务
- [ ] 使用 `NextStageCard` 链接到"拆它绝活"
- [ ] 证据链接可点击跳转 GitHub
- [ ] Mock 数据结构正确
- [ ] 1440×900 下执行链路图完整可见

