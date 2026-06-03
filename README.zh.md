# CodeGraph

<div align="center">
  <img src="./docs/assets/github标题背景图.png" alt="CodeGraph - 把复杂仓库变成学习地图" width="100%">

  <h3>别再硬啃大仓库了。把 GitHub 项目变成一张能跟着走的源码学习地图。</h3>

  <p>
    <a href="./README.md">English</a> ·
    <a href="https://code-graph-five.vercel.app/">在线 Demo</a> ·
    <a href="https://code-graph-five.vercel.app/map">学习地图</a> ·
    <a href="#如何参与">参与共建</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/场景-源码学习-111827?style=flat-square" alt="源码学习">
    <img src="https://img.shields.io/badge/路线-四阶段学习地图-f59e0b?style=flat-square" alt="四阶段学习地图">
    <img src="https://img.shields.io/badge/RAG-图增强检索-7c3aed?style=flat-square" alt="图增强检索">
    <img src="https://img.shields.io/badge/前端-React%20%2B%20Vite-61dafb?style=flat-square" alt="React + Vite">
    <img src="https://img.shields.io/badge/后端-FastAPI-009688?style=flat-square" alt="FastAPI">
    <img src="https://img.shields.io/badge/License-Apache--2.0-blue?style=flat-square" alt="Apache 2.0">
  </p>
</div>

## 你是不是也这样读源码？

你想学习 `React`、`Vue`、`VS Code`、`LangChain` 这种优秀项目。

然后打开仓库，几千个文件扑面而来。

README 告诉你怎么安装、怎么用，但没人告诉你：

- 第一个应该看哪个文件？
- 主流程从哪里开始跑？
- 哪些模块是真的核心？
- 哪些设计值得抄到自己的项目里？
- 我要怎么从“看不懂”走到“能提 PR”？

结果往往是：

- 收藏了很多仓库，但真正读完的不多。
- 看了很多源码解析文章，但换个项目又迷路。
- 问 AI 一堆问题，答案看似有用，最后还是缺一张全局地图。

**CodeGraph 想解决的就是这个痛点：把复杂 GitHub 仓库变成一条可视化、分阶段、能推进的源码学习路线。**

如果你也觉得“读懂优秀项目”这件事应该变得更简单，欢迎给这个仓库点个 Star。Star 是我继续把它做下去的最大动力。

## CodeGraph 是什么？

CodeGraph 是一个面向源码学习的 AI 代码理解平台。

它不是单纯的“代码问答机器人”，而是先帮你建立项目地图，再带你按阶段理解：

| 阶段 | 解决的问题 | 你会得到什么 |
| --- | --- | --- |
| **1. 先看门道** | 这个项目到底是干什么的？结构怎么分？ | 项目定位、技术栈、目录结构、核心模块 |
| **2. 跑通主线** | 项目的主流程怎么跑起来？ | 入口文件、调用链、关键逻辑、执行路径 |
| **3. 拆它绝活** | 这个项目有哪些值得学的设计？ | 抽象方式、实现技巧、工程取舍、亮点模块 |
| **4. 抄走一招** | 我能把什么迁移到自己的项目？ | 可复用方法、实践卡片、改造建议 |

一句话：

> CodeGraph 不是帮你“搜答案”，而是帮你“读懂一个仓库”。

## 在线体验

- [在线 Demo](https://code-graph-five.vercel.app/)
- [学习地图页](https://code-graph-five.vercel.app/map)

说明：当前在线 Demo 主要展示前端体验和产品形态；完整仓库分析、AI 问答、图谱检索能力需要在本地启动后端服务。

## 效果预览

### 真实学习路径页

![CodeGraph 学习路径页](./docs/assets/learning-path-page.png)

### 首页与四阶段页面

<table>
  <tr>
    <td width="50%">
      <img src="./docs/design/en/home.png" alt="首页">
      <p align="center"><strong>首页：输入仓库，开始探索</strong></p>
    </td>
    <td width="50%">
      <img src="./docs/design/en/learning-map.png" alt="学习地图">
      <p align="center"><strong>学习地图：四阶段路线</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./docs/design/en/stage1-overview.png" alt="先看门道">
      <p align="center"><strong>先看门道</strong></p>
    </td>
    <td width="50%">
      <img src="./docs/design/en/stage2-mainflow.png" alt="跑通主线">
      <p align="center"><strong>跑通主线</strong></p>
    </td>
  </tr>
</table>

## 为什么不是普通 RAG？

很多代码 RAG 项目做的是：

```text
切代码块 -> 向量化 -> 相似度召回 -> 生成回答
```

这能回答局部问题，但很难帮你建立全局理解。

源码不是普通文本。源码有入口、模块、依赖、调用链、测试、抽象边界。

CodeGraph 更关注这些结构：

- **图增强检索**：不只看语义相似，还看代码实体之间的关系。
- **阶段化 Agent**：总览、主线、亮点、迁移建议分别处理。
- **学习优先**：输出目标不是炫技，而是让人能继续往下读。
- **可视化路线**：把仓库变成一张地图，而不是一堵文件墙。

## 架构概览

```mermaid
flowchart LR
  A["GitHub 仓库"] --> B["代码读取与解析"]
  B --> C["文件/模块/符号元数据"]
  B --> D["代码关系图谱"]
  C --> E["混合检索"]
  D --> E
  E --> F["阶段化 Agent"]
  F --> G["先看门道"]
  F --> H["跑通主线"]
  F --> I["拆它绝活"]
  F --> J["抄走一招"]
  G --> K["可视化学习地图"]
  H --> K
  I --> K
  J --> K
```

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React、TypeScript、Vite、Mantine、像素风 UI |
| 后端 | FastAPI、Python 3.11 |
| 检索 | 向量检索、关键词检索、混合召回 |
| 图谱 | 面向代码关系的图结构建模 |
| Agent | 四阶段分析 Agent、任务编排、结构化输出 |
| 部署 | Docker Compose、本地后端、Vercel 前端 |

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+
- Docker 和 Docker Compose
- OpenAI 兼容模型 API Key

### 克隆项目

```bash
git clone https://github.com/liu66-qing/CodeGraph.git
cd CodeGraph
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入模型、数据库、缓存等配置。

### 启动基础服务

```bash
docker-compose up -d
```

### 启动后端

```bash
pip install -e ".[dev]"
uvicorn evograph.main:app --reload --host 0.0.0.0 --port 8000
```

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`。

## 适合谁？

- 想读懂优秀开源项目，但经常卡在文件树里的开发者
- 想为团队新人做项目 onboarding 的技术负责人
- 想做 Code Agent / RAG Agent / 图谱检索项目的同学
- 想给开源项目提 PR，但不知道从哪里理解代码的人
- 想研究 Agentic RAG 在代码理解场景中怎么落地的人

## 路线图

- [ ] 支持更多 TypeScript / Python 项目结构
- [ ] 增强调用链和模块依赖分析
- [ ] 接入 GitHub issue / PR 背景理解
- [ ] 导出 Markdown / PDF 学习报告
- [ ] 部署完整后端，提供端到端在线体验
- [ ] 增加更多真实开源项目分析样例

## 如何参与

现在项目还在早期，最需要真实反馈。

你可以这样参与：

- 给仓库点 Star，让更多人看到这个项目。
- 提 Issue：告诉我你最想分析哪个仓库。
- 提建议：你希望“源码学习地图”长什么样。
- 提 PR：增加新的语言解析、新的分析器、新的页面或文档。

适合作为 Issue 的想法：

- 支持 Next.js App Router 项目分析
- 支持 FastAPI 项目的主流程提取
- 增加 LangChain 仓库分析样例
- 导出学习路径为 Markdown
- 增加 GitHub issue 背景分析

## License

Apache-2.0，详见 [LICENSE](./LICENSE)。

---

<div align="center">
  <strong>如果 CodeGraph 让你觉得“读源码可以不那么痛苦”，欢迎点一个 Star。</strong>
  <br>
  Star、Issue 和 PR 都会直接影响这个项目下一步做什么。
</div>
