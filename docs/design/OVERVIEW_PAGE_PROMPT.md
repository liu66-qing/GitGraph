# "先看门道" 页面实现提示词

> 给 Claude Sonnet 的执行提示词。

---

## 你的任务

实现 CodeGraph 的第一个学习站点页面「先看门道」。

**文件:** 创建/重写 `frontend/src/pages/Overview.tsx`。
**背景图:** 已在 `overviewAssets` 和 overview 目录中,通过 stage-library 使用。

**关键原则:**
1. **页面独立性** — 不修改任何其他页面文件。
2. **使用 PixelStageKit 组件库** — 不手写像素卡片样式,不生成新 sprite。

---

## 必读文件(按顺序)

1. `CODEGRAPH_PRD.md` 第10节 Stage 1 + 第20节 PixelStageKit
2. `frontend/src/components/common/PixelStageKit.tsx` — 了解可用组件和 Props
3. `frontend/src/assets/pixel/stage-library/index.ts` — 了解可用资产

---

## 页面定位

这是用户学习一个仓库的第一站。用户刚从首页提交了一个 GitHub 仓库链接,现在进入"先看门道"。

**用户心理:** "我对这个仓库一无所知,先告诉我它是什么、解决什么问题、我该从哪开始看。"

**页面目标:** 用户读完后能用一句话向别人解释这个仓库是什么,并知道从哪里开始阅读。

---

## 页面布局(从上到下)

### 顶部栏

```
[← 返回学习地图]     Stage 1 · 先看门道     [当前进度 ████░░ 42%]
```

- 左侧: 返回按钮 + 面包屑
- 中间: 页面标题(像素风图标 + "Stage 1 · 先看门道")
- 右侧: 进度指示器(像素风进度条)
- 下方一行副标题: "在读代码之前，先搞清这个仓库是做什么的、解决什么问题、该从哪里开始看。"

### 场景区(背景图 + 核心信息)

- 背景图: `frontend/src/assets/pixel/backgrounds/overview-morning.png`
- 高度: `clamp(200px, 28vh, 280px)`
- 背景图上叠加两个元素:
  - 左侧: 像素角色(导师) + 对话气泡 "一切冒险的开始，先了解它，才能走得更远！"
  - 右侧: **木质公告板卡片**(核心信息区)

**木质公告板卡片内容(动态,来自后端):**
```
┌─ 一句话定位 ──────────────────────────┐
│                                        │
│  这个仓库是一个帮助开发者快速构建       │
│  与扩展开源智能体应用的框架。           │
│                                        │
└────────────────────────────────────────┘
```

这个"一句话定位"是后端根据仓库 README + 代码结构生成的,不是写死的。

### 内容区(三栏卡片 — 第一行)

```
┌─ 它解决的核心问题 ─┐  ┌─ 三步建立整体心智模型 ─┐  ┌─ 推荐起步顺序 ──────┐
│                    │  │                        │  │                    │
│  [动态内容]        │  │  它是什么 / 为谁服务    │  │  ① README          │
│  根据仓库分析      │  │  / 怎么工作             │  │  ② 目录结构         │
│  生成的核心问题    │  │                        │  │  ③ 示例代码         │
│  描述              │  │  三个子卡片,每个有     │  │  ④ 核心模块         │
│                    │  │  图标+标题+描述         │  │                    │
└────────────────────┘  └────────────────────────┘  └────────────────────┘
```

### 内容区(三栏卡片 — 第二行)

```
┌─ 看完这一页你会获得 ┐  ┌─ 本关任务 (3/3) ─────┐  ┌─ 下一站：跑通主线 ──┐
│                    │  │                        │  │                    │
│  三个成就图标:     │  │  ✓ 读完一句话定位       │  │  接下来我们将沿着   │
│  知道仓库定位      │  │  ✓ 理解核心问题         │  │  主线流程,把项目    │
│  抓住核心问题      │  │  ✓ 按推荐顺序规划路径   │  │  从环境到运行完整   │
│  建立整体认知      │  │                        │  │  跑通!             │
│                    │  │                        │  │                    │
│                    │  │                        │  │  [进入下一步 →]     │
└────────────────────┘  └────────────────────────┘  └────────────────────┘
```

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
  PixelAsset,
} from '../components/common/PixelStageKit'
import { overviewAssets } from '../assets/pixel/stage-library'
```

### 1. StageHero (顶部场景区)

注意: "先看门道"页面的背景图是 `overview-morning.png`,但它不在 `stageBackgrounds` 中(那个只有 mainflow/showcase/takeaway)。所以这个页面的 StageHero 需要用自定义方式设置背景,或者直接用 `StageShell` + 手动设置背景。

```tsx
// 方案: 用 overview-morning.png 作为场景区背景
import overviewBg from '../assets/pixel/backgrounds/overview-morning.png'
```

场景区内容:
- 左侧: 像素导师(overviewAssets.mentor) + SpeechBubble "一切冒险的开始，先了解它，才能走得更远！"
- 右侧: 木质公告板(用 ParchmentPanel tone="amber"),显示动态的"一句话定位"

### 2. 内容区第一行 — 三栏

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
  {/* 卡片1: 它解决的核心问题 */}
  <ParchmentPanel title="它解决的核心问题" icon={<Target />} tone="red">
    <p>{data.coreProblem}</p>
  </ParchmentPanel>

  {/* 卡片2: 三步建立整体心智模型 */}
  <ParchmentPanel title="三步建立整体心智模型" icon={<Brain />} tone="green">
    <ConceptCard title={data.mentalModel.whatIsIt.title} body={data.mentalModel.whatIsIt.description} asset="badgeMap" />
    <ConceptCard title={data.mentalModel.whoIsItFor.title} body={data.mentalModel.whoIsItFor.description} asset="mentorRunner" />
    <ConceptCard title={data.mentalModel.howItWorks.title} body={data.mentalModel.howItWorks.description} asset="routeArrowBlue" />
  </ParchmentPanel>

  {/* 卡片3: 推荐起步顺序 */}
  <ParchmentPanel title="推荐起步顺序" icon={<ListOrdered />} tone="blue">
    {data.readingOrder.map(step => (
      <a href={step.githubUrl} target="_blank">{step.step}. {step.title} — {step.description}</a>
    ))}
  </ParchmentPanel>
</div>
```

### 3. 内容区第二行 — 三栏

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
  {/* 卡片4: 看完这一页你会获得 */}
  <RewardStrip items={[
    { label: "知道仓库定位", detail: "明确它的价值与边界" },
    { label: "抓住核心问题", detail: "理解它解决的痛点" },
    { label: "建立整体认知", detail: "形成清晰的心智模型" },
  ]} />

  {/* 卡片5: 本关任务 */}
  <TaskChecklist title="本关任务（3/3）" tasks={[
    "读完一句话定位，能复述它在做什么",
    "理解它解决的核心问题是什么",
    "按推荐顺序规划你的起步路径",
  ]} />

  {/* 卡片6: 下一站 */}
  <NextStageCard
    title="下一站：跑通主线"
    body="接下来我们将沿着主线流程，把项目从环境到运行完整跑通！"
    asset="mentorRunner"
  />
</div>
```

---

## 数据结构与后端交互

### 前端需要的数据接口

```typescript
interface OverviewData {
  // 一句话定位(后端用 LLM 根据 README + 代码结构生成)
  positioning: string;
  
  // 核心问题(后端分析生成)
  coreProblem: string;
  
  // 三步心智模型(后端根据架构分析生成)
  mentalModel: {
    whatIsIt: { title: string; description: string };
    whoIsItFor: { title: string; description: string };
    howItWorks: { title: string; description: string };
  };
  
  // 推荐起步顺序(后端根据文件结构和入口分析生成)
  readingOrder: {
    step: number;
    title: string;  // e.g. "README", "目录结构", "示例代码", "核心模块"
    description: string;
    filePath?: string;  // 对应的文件路径,可链接到 GitHub
    githubUrl?: string;
  }[];
  
  // 仓库元信息
  repoMeta: {
    name: string;
    fullName: string;  // e.g. "letta-ai/letta"
    stars: number;
    language: string;
    description: string;
  };
}
```

### 后端 API 端点

```
GET /api/v1/repos/{repo_id}/overview
```

返回 `OverviewData`。后端实现逻辑:
1. 从已解析的仓库数据中取 README 内容
2. 调用 `architecture_analyzer` 获取架构摘要
3. 调用 `tour_builder` 获取入口点和推荐阅读路径
4. 用 LLM 将以上信息综合为:一句话定位 + 核心问题 + 心智模型
5. 根据文件结构生成推荐起步顺序

### Mock 数据(前端先用这个开发)

以 `letta-ai/letta` 为例:

```typescript
const mockOverviewData: OverviewData = {
  positioning: "这个仓库是一个帮助开发者构建有状态AI Agent的平台，用操作系统虚拟内存的思路解决LLM上下文有限的问题。",
  coreProblem: "LLM的上下文窗口有限，但Agent需要记住所有历史对话和学到的知识。Letta用两级记忆(热记忆+冷存储)解决了这个矛盾，让Agent拥有"无限"记忆。",
  mentalModel: {
    whatIsIt: {
      title: "它是什么",
      description: "一个模块化、可组合的智能体应用开发框架。"
    },
    whoIsItFor: {
      title: "为谁服务",
      description: "开发者、团队与企业，构建与扩展智能体能力。"
    },
    howItWorks: {
      title: "怎么工作",
      description: "通过核心模块协同，快速组装与迭代应用。"
    }
  },
  readingOrder: [
    { step: 1, title: "README", description: "了解项目定位与价值", githubUrl: "https://github.com/letta-ai/letta#readme" },
    { step: 2, title: "目录结构", description: "认识整体模块与组织", githubUrl: "https://github.com/letta-ai/letta" },
    { step: 3, title: "示例代码", description: "通过示例快速上手", githubUrl: "https://github.com/letta-ai/letta/tree/main/examples" },
    { step: 4, title: "核心模块", description: "深入关键概念与接口", githubUrl: "https://github.com/letta-ai/letta/tree/main/letta" }
  ],
  repoMeta: {
    name: "letta",
    fullName: "letta-ai/letta",
    stars: 8200,
    language: "Python",
    description: "Letta (formerly MemGPT) - Build stateful AI agents"
  }
};
```

---

## 像素风格约束

**所有样式已由 PixelStageKit 和 index.css 提供。** 不要手写像素边框、box-shadow 等样式。直接使用 `ParchmentPanel`、`ConceptCard` 等组件即可获得正确的像素风格。

如果需要额外的布局样式(如 grid),在页面内用 inline style 或页面专属的 CSS class(不要修改全局 index.css)。

---

## 首屏约束

所有内容必须在 1440×900 分辨率下不滚动完整可见(或最多滚动一小段)。

- 顶部栏: ~60px
- 场景区: ~240px
- 第一行卡片: ~200px
- 第二行卡片: ~200px
- 间距总计: ~60px
- 总计: ~760px (在 900px 高度内)

如果放不下,优先缩小场景区高度。

---

## 页面独立性约束

```
⚠️ 绝对禁止:
- 修改 PixelStageKit.tsx
- 修改 stage-library/index.ts
- 修改 index.css 中已有的类名
- 修改 Home.tsx / MainFlow.tsx / Layout.tsx
- 修改 App.tsx 中已有路由

✅ 允许:
- 创建/重写 pages/Overview.tsx
- 在 App.tsx 中添加 /overview 路由(如果不存在)
- 在 Overview.tsx 内定义页面专属的子组件和样式
- Import PixelStageKit 组件(不修改)
- Import stage-library 和 overviewAssets(不修改)
```

---

## 禁止事项

- 不要用圆角卡片(像素风用直角)
- 不要用 Lucide/FontAwesome 图标(用 Kenney pixel tiles)
- 不要用普通 Mantine Card 默认样式(必须覆盖为像素风)
- 不要写死内容文案(除了固定的 UI 标签,所有描述性内容都从 mock 数据/API 获取)
- 不要让场景区背景图被裁切到看不出是什么(保持 `background-position: center bottom`)
- 不要用像素字体做正文(只有标题装饰可以用)

---

## 验收清单

- [ ] 页面顶部有 Stage 标题 + 返回按钮 + 进度条
- [ ] 场景区使用 `overview-morning.png` 作为背景
- [ ] 场景区有像素角色(Kenney sprite)+ 对话气泡
- [ ] 场景区有木质公告板,内容是动态的"一句话定位"
- [ ] 六个卡片全部使用像素风样式(直角、深棕边框、box-shadow)
- [ ] 卡片图标使用 Kenney pixel tiles,不是 SVG 图标
- [ ] "推荐起步顺序"中的链接指向 GitHub(githubUrl)
- [ ] "下一站"卡片有绿色 CTA 按钮
- [ ] Mock 数据结构正确,后续可直接替换为 API 调用
- [ ] 1440×900 下内容基本在首屏内
- [ ] 整体视觉是像素游戏风,不是普通 SaaS 页面
