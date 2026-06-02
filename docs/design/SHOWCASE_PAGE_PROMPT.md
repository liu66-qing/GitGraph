# "拆它绝活" 页面实现提示词

> 给 Claude Sonnet 的执行提示词。

---

## 你的任务

实现 CodeGraph 的第三个学习站点页面「拆它绝活」。

**文件:** 创建 `frontend/src/pages/Showcase.tsx`(如已存在则重写)。
**背景图:** 已在 `stageBackgrounds.showcase` 中注册,通过 PixelStageKit 使用。

**关键原则:**
1. **页面独立性** — 不修改任何其他页面文件。
2. **使用 PixelStageKit 组件库** — 不手写像素卡片样式,不生成新 sprite。

---

## 必读文件(按顺序)

1. `CODEGRAPH_PRD.md` 第10节 Stage 3 + 第20节 PixelStageKit
2. `frontend/src/components/common/PixelStageKit.tsx` — 了解可用组件和 Props
3. `frontend/src/assets/pixel/stage-library/index.ts` — 了解可用资产

---

## 页面定位

用户已经在"跑通主线"理解了请求流程。现在进入第三站,目标是**找到这个仓库最值得学习的设计决策,理解它为什么这么设计**。

**用户心理:** "我知道它怎么跑了,但它到底哪里设计得好?为什么别人说这个仓库牛?"

**页面目标:** 用户读完后能向别人解释"这个项目牛在哪里",并指出具体的设计决策和代码位置。

---

## 页面结构(使用 PixelStageKit 组件)

```tsx
import {
  StageHero,
  ParchmentPanel,
  ConceptCard,
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
  stage="Stage 3"
  title="拆它绝活"
  subtitle="分析核心模块，拆解关键实现技巧与设计亮点。只看最值钱的设计决策。"
  background="showcase"
  mentor="mentorMiner"
  speech="这里藏着最值钱的宝石，我们来挖！"
  progress={72}
/>
```

### 2. 主内容区 — 亮点 Tab 切换

这是本页的核心交互:**3个设计亮点,用 Tab 切换,每个亮点展开为一个完整的"问题→方案→代码"故事。**

```tsx
const [activeHighlight, setActiveHighlight] = useState(0)
```

#### Tab 栏(亮点选择器)

```tsx
<div className="showcase-tabs">
  {highlights.map((h, i) => (
    <button
      key={h.id}
      className={i === activeHighlight ? 'active' : ''}
      onClick={() => setActiveHighlight(i)}
    >
      <PixelAsset asset={h.crystal} alt="" />
      <span>{h.title}</span>
    </button>
  ))}
</div>
```

Tab 按钮样式:
- 像素风按钮(直角、深色边框)
- 选中态: 发光边框 + 背景色变化
- 每个 Tab 旁边有一个水晶图标(用 `crystalMemoryPurple` / `crystalAgentBlue` / `crystalLoopGreen`)

#### 亮点详情区(左右分栏)

`grid-template-columns: 1.2fr 1fr; gap: 20px;`

**左栏: 设计故事**

```tsx
<ParchmentPanel title={currentHighlight.title} icon={<Gem />} tone="purple">
  <section>
    <h3>🎯 解决的问题</h3>
    <p>{currentHighlight.problem}</p>
    <p className="naive-approach">
      <strong>朴素方案会怎样:</strong> {currentHighlight.naiveApproach}
    </p>
  </section>

  <section>
    <h3>💡 它的做法</h3>
    <p>{currentHighlight.solution}</p>
    {/* 可选: 示意图/流程图 */}
  </section>

  <section>
    <h3>⚖️ 为什么比朴素方案好</h3>
    <ul>
      {currentHighlight.tradeoffs.map(t => <li key={t}>{t}</li>)}
    </ul>
  </section>
</ParchmentPanel>
```

**右栏: 代码证据**

```tsx
<CodeFoldPanel sections={currentHighlight.codeEvidence} />

<ParchmentPanel title="在 GitHub 查看" icon={<ExternalLink />} tone="blue">
  {currentHighlight.githubLinks.map(link => (
    <a href={link.url} target="_blank" key={link.label}>
      {link.label} ↗
    </a>
  ))}
</ParchmentPanel>
```

### 3. 底部区 — 四栏卡片

`grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px;`
在 `<1280px` 时: `grid-template-columns: 1fr 1fr;`

#### 卡片1: 亮点总览

```tsx
<ParchmentPanel title="本仓库 3 大绝活" icon={<Diamond />} tone="amber">
  {highlights.map((h, i) => (
    <ConceptCard
      key={h.id}
      title={h.title}
      body={h.oneLiner}
      asset={h.crystal}
      tone={i === activeHighlight ? 'purple' : 'neutral'}
    />
  ))}
</ParchmentPanel>
```

#### 卡片2: RewardStrip

```tsx
<RewardStrip items={[
  { label: "识别设计亮点", detail: "知道好在哪里" },
  { label: "理解 tradeoff", detail: "为什么这么选" },
  { label: "定位核心代码", detail: "在哪里实现的" },
]} />
```

#### 卡片3: TaskChecklist

```tsx
<TaskChecklist
  title="本关任务（3/3）"
  tasks={[
    "读完3个设计亮点，理解每个解决了什么问题",
    "对比朴素方案，说出为什么当前方案更好",
    "在 GitHub 中找到对应的核心代码位置",
  ]}
/>
```

#### 卡片4: NextStageCard

```tsx
<NextStageCard
  title="下一站：抄走一招"
  body="把最值钱的设计模式提炼出来，变成你自己能用的招式。"
  asset="campfireCrates"
/>
```

---

## 数据结构

```typescript
interface DesignHighlight {
  id: number;
  title: string;           // e.g. "虚拟内存式上下文管理"
  oneLiner: string;        // 一句话概括
  crystal: StageAssetKey;  // 对应的水晶图标
  problem: string;         // 解决的问题
  naiveApproach: string;   // 朴素方案会怎样
  solution: string;        // 它的做法
  tradeoffs: string[];     // 为什么比朴素方案好(列表)
  codeEvidence: {          // 代码证据(给 CodeFoldPanel)
    title: string;
    lines: string[];
    open?: boolean;
  }[];
  githubLinks: {
    label: string;
    url: string;
  }[];
}

interface ShowcaseData {
  highlights: DesignHighlight[];
}
```

### Mock 数据(以 letta-ai/letta 为例)

```typescript
const mockHighlights: DesignHighlight[] = [
  {
    id: 1,
    title: "记忆不是外挂，是系统核心",
    oneLiner: "用 OS 虚拟内存思路解决 LLM 上下文有限的问题",
    crystal: "crystalMemoryPurple",
    problem: "LLM 的 context window 有限（如128k tokens），但 Agent 需要记住所有历史对话和学到的知识。对话越长，越早的信息越容易被丢弃。",
    naiveApproach: "截断旧消息（丢失关键信息）或全量塞入（超出 token 限制、噪音干扰推理）。",
    solution: "借鉴操作系统虚拟内存：Core Memory（热记忆）始终在 context 中，Archival Memory（冷存储）用 embedding 索引按需检索加载。Agent 自己决定什么时候 search 什么记忆。",
    tradeoffs: [
      "不丢信息：所有历史都在 archival，只是不在窗口里",
      "不超限：context window 始终在 token budget 内",
      "智能：Agent 自己决定什么时候 search 什么记忆",
      "可扩展：记忆量增长不影响推理速度",
    ],
    codeEvidence: [
      {
        title: "agent.py — 上下文组装",
        lines: [
          "def _build_context(self):",
          "    ctx = []",
          "    ctx.append(self.system_prompt)",
          "    # Core memory 始终在",
          "    for block in self.memory.blocks:",
          "        ctx.append(block.value)",
          "    # 只保留最近的消息",
          "    ctx.extend(self.messages[-self.window:])",
          "    return ctx",
        ],
        open: true,
      },
      {
        title: "agent.py — 长期记忆检索",
        lines: [
          "def archival_search(self, query: str):",
          "    \"\"\"Agent 主动搜索长期记忆\"\"\"",
          "    results = self.archival.search(",
          "        query, top_k=10",
          "    )",
          "    return results",
        ],
      },
    ],
    githubLinks: [
      { label: "letta/agent.py#L142-L198", url: "https://github.com/letta-ai/letta/blob/main/letta/agent.py#L142-L198" },
      { label: "letta/memory.py", url: "https://github.com/letta-ai/letta/blob/main/letta/memory.py" },
    ],
  },
  {
    id: 2,
    title: "Agent 不是一次性回答器",
    oneLiner: "有状态的持久化 Agent 实体,重启后无感恢复",
    crystal: "crystalAgentBlue",
    problem: "大多数 LLM 应用是无状态的：每次对话从零开始，没有持久身份。用户希望 Agent 能'记住我'、能持续学习。",
    naiveApproach: "把历史对话全部塞进 prompt（成本爆炸）或存在客户端（不安全、不可靠）。",
    solution: "Agent 是一个持久化实体：所有状态（记忆、配置、历史、工具）存在 PostgreSQL 中。重启服务后从数据库加载完整状态，Agent 无感知地继续上次对话。模型无关的状态表示让 Agent 可以跨 LLM 提供商迁移。",
    tradeoffs: [
      "持久性：服务重启不丢失任何状态",
      "可迁移：换 LLM 提供商不影响 Agent 记忆",
      "可扩展：数据库支撑大规模并发 Agent",
      "可审计：所有状态变更有记录",
    ],
    codeEvidence: [
      {
        title: "server.py — Agent 状态加载",
        lines: [
          "def load_agent(self, agent_id: str):",
          "    # 从数据库恢复完整状态",
          "    agent_state = self.db.get_agent(agent_id)",
          "    memory = self.db.get_memory_blocks(agent_id)",
          "    tools = self.db.get_agent_tools(agent_id)",
          "    return Agent(",
          "        state=agent_state,",
          "        memory=memory,",
          "        tools=tools,",
          "    )",
        ],
        open: true,
      },
    ],
    githubLinks: [
      { label: "letta/server/server.py", url: "https://github.com/letta-ai/letta/blob/main/letta/server/server.py" },
      { label: "letta/orm/agent.py", url: "https://github.com/letta-ai/letta/blob/main/letta/orm/agent.py" },
    ],
  },
  {
    id: 3,
    title: "这些能力其实是一个闭环",
    oneLiner: "工具调用 + 状态更新构成自我强化的学习循环",
    crystal: "crystalLoopGreen",
    problem: "Agent 需要与外部世界交互（调 API、读文件、执行代码），但也需要把交互结果'学到'，形成持续改进的闭环。",
    naiveApproach: "工具调用和记忆更新分离设计（工具结果用完就丢，不写入长期记忆）。",
    solution: "每次工具调用的结果都经过 Agent 的'反思'步骤：决定哪些信息值得写入 Core Memory（热记忆）或 Archival Memory（冷存储）。这形成了一个 perceive → think → act → learn 的闭环。",
    tradeoffs: [
      "持续学习：每次交互都可能增强 Agent 的知识",
      "选择性记忆：不是所有信息都记，Agent 自己判断价值",
      "闭环强化：记忆越丰富，后续决策越准确",
    ],
    codeEvidence: [
      {
        title: "agent.py — 工具结果反思与记忆写入",
        lines: [
          "# 工具执行后的反思步骤",
          "tool_result = execute_tool(tool_call)",
          "# Agent 决定是否写入记忆",
          "if self.should_memorize(tool_result):",
          "    self.memory.update(",
          "        key=extract_key(tool_result),",
          "        value=summarize(tool_result),",
          "    )",
        ],
        open: true,
      },
    ],
    githubLinks: [
      { label: "letta/agent.py — step loop", url: "https://github.com/letta-ai/letta/blob/main/letta/agent.py#L200-L280" },
    ],
  },
]
```

---

## 页面独立性约束

```
⚠️ 绝对禁止:
- 修改 PixelStageKit.tsx
- 修改 stage-library/index.ts
- 修改 index.css 中已有的类名
- 修改 Home.tsx / Overview.tsx / MainFlow.tsx / Layout.tsx
- 修改 App.tsx 中已有路由

✅ 允许:
- 创建/重写 pages/Showcase.tsx
- 在 App.tsx 中添加 /showcase 路由(如果不存在)
- 在 Showcase.tsx 内定义页面专属的子组件和样式(如 Tab 切换)
- Import PixelStageKit 组件(不修改)
- Import stage-library 资产(不修改)
```

---

## Tab 切换的页面内样式

由于 PixelStageKit 没有 Tab 组件,在页面内定义:

```css
/* 写在 Showcase.tsx 内的 style 标签或 CSS module 中 */
.showcase-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.showcase-tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #fffef5;
  border: 3px solid #5c4a3a;
  border-radius: 0;
  box-shadow: 3px 3px 0 #3a2d1f;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.1s;
}
.showcase-tabs button:hover {
  transform: translateY(-2px);
}
.showcase-tabs button.active {
  border-color: #7c3aed;
  background: #f5f0ff;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2), 3px 3px 0 #4c1d95;
}
.showcase-tabs button img {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
}
```

---

## 首屏约束

1440×900 下,StageHero + Tab 栏 + 亮点详情区的上半部分应该可见。底部四栏卡片可以需要滚动。

- StageHero: ~200px
- Tab 栏: ~60px
- 亮点详情区: ~400px (可能需要滚动看完)
- 底部卡片: 滚动后可见

优先保证 Tab 栏和亮点详情的"解决的问题"部分在首屏内。

---

## 验收清单

- [ ] `pages/Showcase.tsx` 存在且可独立渲染
- [ ] 没有修改 PixelStageKit.tsx 或其他页面文件
- [ ] 使用 `StageHero` 组件,background 为 `"showcase"`,mentor 为 `"mentorMiner"`
- [ ] 有 3 个亮点 Tab,点击可切换
- [ ] 每个亮点展示完整故事:问题→朴素方案→它的做法→tradeoff→代码→GitHub链接
- [ ] 使用 `CodeFoldPanel` 展示代码证据(可折叠)
- [ ] 使用 `ParchmentPanel` 包裹所有信息卡片
- [ ] 使用 `TaskChecklist` 展示本关任务
- [ ] 使用 `NextStageCard` 链接到"抄走一招",asset 为 `"campfireCrates"`
- [ ] Tab 按钮有像素风样式(直角、边框、shadow)
- [ ] 选中 Tab 有紫色发光效果
- [ ] GitHub 链接可点击跳转
- [ ] Mock 数据结构正确,后续可替换为 API
