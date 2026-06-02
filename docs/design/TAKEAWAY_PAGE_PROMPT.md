# "抄走一招" 页面实现提示词

> 给 Claude Sonnet 的执行提示词。

---

## 你的任务

实现 CodeGraph 的第四个(最后一个)学习站点页面「抄走一招」。

**文件:** 创建 `frontend/src/pages/Takeaway.tsx`(如已存在则重写)。
**背景图:** 已在 `stageBackgrounds.takeaway` 中注册,通过 PixelStageKit 使用。

**关键原则:**
1. **页面独立性** — 不修改任何其他页面文件。
2. **使用 PixelStageKit 组件库** — 不手写像素卡片样式,不生成新 sprite。

---

## 必读文件(按顺序)

1. `CODEGRAPH_PRD.md` 第10节 Stage 4 + 第20节 PixelStageKit
2. `frontend/src/components/common/PixelStageKit.tsx` — 了解可用组件和 Props
3. `frontend/src/assets/pixel/stage-library/index.ts` — 了解可用资产

---

## 页面定位

用户已经在"拆它绝活"看懂了设计亮点。现在进入最后一站,目标是**把学到的东西提炼成可复用的模式,带走用在自己的项目里**。

**用户心理:** "我佩服这个项目的设计了,但我怎么把它变成我自己能用的东西?"

**页面目标:** 用户读完后手里有 2-3 个可直接复用的设计模式,每个附带最小实现代码和适用场景。

---

## 页面结构(使用 PixelStageKit 组件)

```tsx
import {
  StageHero,
  ParchmentPanel,
  ConceptCard,
  TaskChecklist,
  RewardStrip,
  CodeFoldPanel,
  PixelAsset,
} from '../components/common/PixelStageKit'
```

### 1. StageHero (顶部场景区)

```tsx
<StageHero
  stage="Stage 4"
  title="抄走一招"
  subtitle="提炼可复用的思路与技巧，拿去解决自己的问题。从佩服变成可迁移。"
  background="takeaway"
  mentor="mentorTrophy"
  speech="最值钱的宝藏已经装进背包，带回家用吧！"
  progress={92}
/>
```

### 2. 学习旅程总结卡片(全宽)

在进入具体模式之前,先给用户一个"你已经走过的路"的回顾:

```tsx
<ParchmentPanel title="🎉 你的学习旅程" icon={<Trophy />} tone="amber">
  <div className="takeaway-journey-summary">
    <div className="journey-step completed">
      <PixelAsset asset="badgeMap" alt="" />
      <span>先看门道</span>
      <small>✓ 建立了全局认知</small>
    </div>
    <span className="journey-arrow">→</span>
    <div className="journey-step completed">
      <PixelAsset asset="mentorRunner" alt="" />
      <span>跑通主线</span>
      <small>✓ 理解了执行流程</small>
    </div>
    <span className="journey-arrow">→</span>
    <div className="journey-step completed">
      <PixelAsset asset="mentorMiner" alt="" />
      <span>拆它绝活</span>
      <small>✓ 看懂了设计亮点</small>
    </div>
    <span className="journey-arrow">→</span>
    <div className="journey-step current">
      <PixelAsset asset="mentorTrophy" alt="" />
      <span>抄走一招</span>
      <small>带走可复用模式</small>
    </div>
  </div>
</ParchmentPanel>
```

### 3. 主内容区 — 可复用模式卡片(垂直堆叠)

每个模式是一个完整的大卡片,垂直排列(不是 Tab 切换,因为用户需要对比和通览)。

每个模式卡片内部用左右分栏: `grid-template-columns: 1fr 1fr; gap: 20px;`

#### 模式卡片结构

```tsx
{patterns.map((pattern, index) => (
  <ParchmentPanel
    key={pattern.id}
    title={`招式 ${index + 1}：${pattern.title}`}
    icon={<PixelAsset asset={pattern.crystal} alt="" />}
    tone={pattern.tone}
  >
    <div className="takeaway-pattern-grid">
      {/* 左栏: 模式说明 */}
      <div className="pattern-description">
        <h4>适用场景</h4>
        <p>{pattern.applicability}</p>

        <h4>核心思路</h4>
        <p>{pattern.coreConcept}</p>

        <h4>局限与注意</h4>
        <ul>
          {pattern.limitations.map(l => <li key={l}>{l}</li>)}
        </ul>
      </div>

      {/* 右栏: 最小实现代码 */}
      <div className="pattern-code">
        <CodeFoldPanel sections={[{
          title: `最小实现（${pattern.codeLines}行）`,
          lines: pattern.minimalCode,
          open: true,
        }]} />
        <div className="pattern-actions">
          <button className="copy-btn" onClick={() => copyToClipboard(pattern.minimalCode.join('\n'))}>
            📋 复制代码
          </button>
          <a href={pattern.originalGithubUrl} target="_blank" className="github-link">
            查看原始实现 ↗
          </a>
        </div>
      </div>
    </div>
  </ParchmentPanel>
))}
```

### 4. 底部区 — 完成庆祝 + 三栏

#### 完成庆祝卡片(全宽)

```tsx
<ParchmentPanel title="🎊 恭喜完成学习旅程！" icon={<PartyPopper />} tone="green">
  <div className="takeaway-completion">
    <PixelAsset asset="mentorTrophy" alt="" className="completion-mentor" />
    <div>
      <p>你已经完整学习了 <strong>{repoMeta.fullName}</strong> 的设计精髓。</p>
      <p>你现在掌握了：</p>
      <ul>
        <li>✓ 项目的整体架构和定位</li>
        <li>✓ 主请求的完整执行流程</li>
        <li>✓ 3 个核心设计亮点及其 tradeoff</li>
        <li>✓ {patterns.length} 个可直接复用的设计模式</li>
      </ul>
    </div>
  </div>
</ParchmentPanel>
```

#### 三栏卡片

`grid-template-columns: 1fr 1fr 1fr; gap: 16px;`

```tsx
{/* 卡片1: RewardStrip */}
<RewardStrip items={[
  { label: "可复用模式", detail: "带走具体的设计招式" },
  { label: "最小实现", detail: "可直接复制的代码" },
  { label: "适用边界", detail: "知道什么时候该用" },
]} />

{/* 卡片2: TaskChecklist */}
<TaskChecklist
  title="本关任务（3/3）"
  tasks={[
    "读完每个模式的适用场景和核心思路",
    "复制最小实现代码，理解每一行在做什么",
    "想一想自己的项目中哪里可以用上这些模式",
  ]}
/>

{/* 卡片3: 探索下一个仓库 */}
<ParchmentPanel title="继续探索" icon={<Compass />} tone="green">
  <p>想学习更多优秀仓库的设计？</p>
  <button className="explore-next-btn" onClick={() => navigate('/')}>
    🌱 探索下一个仓库
  </button>
  <button className="review-btn" onClick={() => navigate('/learning-map')}>
    🗺️ 回到学习地图复习
  </button>
</ParchmentPanel>
```

---

## 数据结构

```typescript
interface ReusablePattern {
  id: number;
  title: string;              // e.g. "两级记忆 + 语义换页"
  crystal: StageAssetKey;     // 对应的水晶图标
  tone: 'purple' | 'blue' | 'green';
  applicability: string;      // 适用场景
  coreConcept: string;        // 核心思路
  limitations: string[];      // 局限与注意事项
  minimalCode: string[];      // 最小实现代码(每行一个字符串)
  codeLines: number;          // 代码行数
  originalGithubUrl: string;  // 原始实现的 GitHub 链接
}

interface TakeawayData {
  patterns: ReusablePattern[];
  repoMeta: { name: string; fullName: string };
}
```

### Mock 数据(以 letta-ai/letta 为例)

```typescript
const mockPatterns: ReusablePattern[] = [
  {
    id: 1,
    title: "两级记忆 + 语义换页",
    crystal: "crystalMemoryPurple",
    tone: "purple",
    applicability: "任何需要长期记忆的 LLM 应用：聊天机器人、个人助手、客服 Agent、知识管理系统。",
    coreConcept: "热记忆（结构化文本块）固定在 prompt 中，冷记忆（所有历史事实）用 embedding 索引，Agent 通过工具调用按需检索加载。关键是让 Agent 自己管理自己的记忆。",
    limitations: [
      "语义检索有召回率问题，关键信息可能搜不到",
      "热记忆的'什么该常驻'需要领域知识来定义",
      "冷记忆写入需要 embedding 计算，有延迟",
      "记忆冲突（新旧信息矛盾）需要额外处理逻辑",
    ],
    minimalCode: [
      "class TwoTierMemory:",
      "    def __init__(self, hot_limit=2000):",
      "        self.hot = {}          # 结构化热记忆",
      "        self.cold = VectorStore()",
      "        self.hot_limit = hot_limit",
      "",
      "    def build_context(self) -> str:",
      "        \"\"\"组装给 LLM 的上下文\"\"\"",
      "        parts = []",
      "        for key, val in self.hot.items():",
      "            parts.append(f'[{key}]: {val}')",
      "        return '\\n'.join(parts)",
      "",
      "    def search(self, query: str, k=5):",
      "        \"\"\"从冷记忆检索\"\"\"",
      "        return self.cold.similarity_search(query, top_k=k)",
      "",
      "    def save(self, key: str, value: str):",
      "        \"\"\"写入热记忆（超限则转冷）\"\"\"",
      "        if self._hot_size() > self.hot_limit:",
      "            self._evict_to_cold()",
      "        self.hot[key] = value",
      "",
      "    def _evict_to_cold(self):",
      "        \"\"\"把最旧的热记忆转入冷存储\"\"\"",
      "        oldest_key = next(iter(self.hot))",
      "        self.cold.add(self.hot.pop(oldest_key))",
      "",
      "    def _hot_size(self) -> int:",
      "        return sum(len(v) for v in self.hot.values())",
    ],
    codeLines: 28,
    originalGithubUrl: "https://github.com/letta-ai/letta/blob/main/letta/memory.py",
  },
  {
    id: 2,
    title: "持久化有状态 Agent 实体",
    crystal: "crystalAgentBlue",
    tone: "blue",
    applicability: "需要 Agent 跨会话保持身份和记忆的场景：长期助手、游戏 NPC、持续学习系统。",
    coreConcept: "Agent 不是一个函数调用，而是一个持久化实体。所有状态（记忆、配置、工具列表、对话历史）存入数据库，服务重启后从 DB 加载恢复，用户无感知。",
    limitations: [
      "需要数据库基础设施（PostgreSQL 等）",
      "状态迁移和版本管理增加复杂度",
      "并发访问同一 Agent 需要锁机制",
      "状态越大，加载越慢，需要懒加载策略",
    ],
    minimalCode: [
      "from dataclasses import dataclass, field",
      "import json",
      "",
      "@dataclass",
      "class PersistentAgent:",
      "    agent_id: str",
      "    persona: str",
      "    memory: dict = field(default_factory=dict)",
      "    tools: list = field(default_factory=list)",
      "",
      "    def save(self, db):",
      "        \"\"\"持久化到数据库\"\"\"",
      "        db.upsert('agents', {",
      "            'id': self.agent_id,",
      "            'state': json.dumps({",
      "                'persona': self.persona,",
      "                'memory': self.memory,",
      "                'tools': self.tools,",
      "            })",
      "        })",
      "",
      "    @classmethod",
      "    def load(cls, agent_id: str, db):",
      "        \"\"\"从数据库恢复\"\"\"",
      "        row = db.get('agents', agent_id)",
      "        state = json.loads(row['state'])",
      "        return cls(",
      "            agent_id=agent_id,",
      "            persona=state['persona'],",
      "            memory=state['memory'],",
      "            tools=state['tools'],",
      "        )",
    ],
    codeLines: 30,
    originalGithubUrl: "https://github.com/letta-ai/letta/blob/main/letta/orm/agent.py",
  },
  {
    id: 3,
    title: "工具调用 + 状态更新闭环",
    crystal: "crystalLoopGreen",
    tone: "green",
    applicability: "任何需要 Agent 与外部世界交互并从交互中学习的场景：自动化工作流、数据采集、持续优化系统。",
    coreConcept: "每次工具调用后不只是返回结果，还经过一个'反思'步骤：Agent 决定哪些信息值得记住。这形成 perceive → think → act → learn 的闭环，Agent 越用越聪明。",
    limitations: [
      "反思步骤增加延迟和 token 消耗",
      "需要设计'什么值得记'的判断逻辑",
      "记忆膨胀需要定期清理/压缩策略",
      "错误信息被记住后会持续影响决策",
    ],
    minimalCode: [
      "class ReactLearnLoop:",
      "    def __init__(self, llm, tools, memory):",
      "        self.llm = llm",
      "        self.tools = tools",
      "        self.memory = memory",
      "",
      "    def step(self, user_input: str) -> str:",
      "        # 1. 组装上下文",
      "        context = self.memory.build_context()",
      "        context += f'\\nUser: {user_input}'",
      "",
      "        # 2. LLM 决策",
      "        decision = self.llm.call(context)",
      "",
      "        # 3. 执行工具（如果需要）",
      "        if decision.tool_call:",
      "            result = self.tools.execute(decision.tool_call)",
      "",
      "            # 4. 反思：是否值得记住？",
      "            if self._should_memorize(result):",
      "                self.memory.save(",
      "                    key=decision.tool_call.name,",
      "                    value=self._summarize(result),",
      "                )",
      "",
      "            return self.step(user_input)  # 继续循环",
      "",
      "        # 5. 直接回复",
      "        return decision.response",
    ],
    codeLines: 27,
    originalGithubUrl: "https://github.com/letta-ai/letta/blob/main/letta/agent.py#L200-L280",
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
- 修改 Home.tsx / Overview.tsx / MainFlow.tsx / Showcase.tsx / Layout.tsx
- 修改 App.tsx 中已有路由

✅ 允许:
- 创建/重写 pages/Takeaway.tsx
- 在 App.tsx 中添加 /takeaway 路由(如果不存在)
- 在 Takeaway.tsx 内定义页面专属的子组件和样式
- Import PixelStageKit 组件(不修改)
- Import stage-library 资产(不修改)
```

---

## 页面内专属样式

```css
.takeaway-journey-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 0;
}
.journey-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
}
.journey-step.completed { opacity: 0.7; }
.journey-step.current { opacity: 1; font-weight: bold; }
.journey-step img { width: 32px; height: 32px; image-rendering: pixelated; }
.journey-arrow { font-size: 20px; color: #22c55e; font-weight: bold; }

.takeaway-pattern-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 12px;
}
@media (max-width: 1024px) {
  .takeaway-pattern-grid { grid-template-columns: 1fr; }
}

.pattern-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
.copy-btn {
  padding: 8px 16px;
  background: #22c55e;
  color: white;
  border: 2px solid #16a34a;
  border-radius: 0;
  box-shadow: 2px 2px 0 #145a30;
  cursor: pointer;
  font-weight: bold;
}
.copy-btn:hover { transform: translateY(-1px); }
.github-link {
  padding: 8px 16px;
  background: #fffef5;
  border: 2px solid #5c4a3a;
  border-radius: 0;
  box-shadow: 2px 2px 0 #3a2d1f;
  color: #1a1a1a;
  text-decoration: none;
  font-weight: bold;
}

.takeaway-completion {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 12px 0;
}
.completion-mentor {
  width: 80px;
  height: 80px;
  image-rendering: pixelated;
}

.explore-next-btn, .review-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border: 2px solid #5c4a3a;
  border-radius: 0;
  box-shadow: 2px 2px 0 #3a2d1f;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
}
.explore-next-btn {
  background: #22c55e;
  color: white;
  border-color: #16a34a;
}
.review-btn {
  background: #fffef5;
  color: #1a1a1a;
}
```

---

## 首屏约束

这是内容最多的页面(3个完整模式卡片),不要求全部在首屏内。但要求:
- StageHero + 旅程总结 + 第一个模式卡片的标题和"适用场景"在首屏可见
- 用户能立刻理解这页是干什么的,然后自然滚动阅读

---

## 验收清单

- [ ] `pages/Takeaway.tsx` 存在且可独立渲染
- [ ] 没有修改 PixelStageKit.tsx 或其他页面文件
- [ ] 使用 `StageHero` 组件,background 为 `"takeaway"`,mentor 为 `"mentorTrophy"`
- [ ] 有学习旅程总结卡片(4步回顾)
- [ ] 有 3 个可复用模式卡片,每个包含:适用场景+核心思路+局限+最小代码+GitHub链接
- [ ] 使用 `CodeFoldPanel` 展示最小实现代码
- [ ] 有"复制代码"按钮(实现 clipboard 复制)
- [ ] 有完成庆祝卡片
- [ ] 底部有"探索下一个仓库"和"回到学习地图"按钮
- [ ] 使用 `ParchmentPanel` 包裹所有信息卡片
- [ ] 使用 `TaskChecklist` 展示本关任务
- [ ] 使用 `RewardStrip` 展示收获
- [ ] Mock 数据结构正确,后续可替换为 API
- [ ] 所有像素风样式一致(直角、边框、shadow)
