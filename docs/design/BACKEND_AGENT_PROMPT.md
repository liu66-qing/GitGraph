# CodeGraph 后端 Agent 架构实现提示词

> 给 Claude Sonnet 的执行提示词。重构后端为多 Agent 协作架构。

---

## 你的任务

将 CodeGraph 的后端从"分析脚本集合"重构为**多 Agent 协作系统**。目标是让这个项目在简历上能体现 Agent 应用的核心设计能力。

**项目根目录:** `E:\RAG`
**后端代码:** `src/evograph/`
**现有分析器:** `src/evograph/agent/analyzers/` (architecture_analyzer, tour_builder, highlights_analyzer, patterns_extractor 等)

---

## 必读文件

1. `CODEGRAPH_PRD.md` — 了解产品的4个学习阶段和每阶段需要的数据
2. `src/evograph/agent/analyzers/architecture_analyzer.py` — 现有架构分析逻辑
3. `src/evograph/agent/analyzers/tour_builder.py` — 现有流程追踪逻辑
4. `src/evograph/config.py` — 现有配置(LLM key 等)
5. `src/evograph/main.py` — 现有 FastAPI 入口

---

## 架构设计

### 核心抽象: BaseAgent

```python
# src/evograph/agent/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any
import time
import structlog

logger = structlog.get_logger()

@dataclass
class ToolCall:
    """记录一次工具调用"""
    tool_name: str
    args: dict
    result: Any
    duration_ms: float
    token_cost: int = 0

@dataclass
class AgentTrace:
    """Agent 执行的完整追踪记录"""
    agent_name: str
    started_at: float
    finished_at: float = 0
    tool_calls: list[ToolCall] = field(default_factory=list)
    llm_calls: int = 0
    total_tokens: int = 0
    output: Any = None
    error: str | None = None

class BaseAgent(ABC):
    """所有分析 Agent 的基类"""
    
    def __init__(self, name: str, llm_client, tools: dict[str, callable]):
        self.name = name
        self.llm = llm_client
        self.tools = tools  # 注册的工具集
        self.trace = AgentTrace(agent_name=name, started_at=0)
    
    @abstractmethod
    async def analyze(self, context: dict) -> dict:
        """
        执行分析。
        
        Args:
            context: 包含仓库信息和前序 Agent 的输出
            
        Returns:
            结构化的分析结果(JSON-serializable dict)
        """
        pass
    
    async def call_tool(self, tool_name: str, **kwargs) -> Any:
        """调用注册的工具,自动记录 trace"""
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not registered for agent '{self.name}'")
        
        start = time.time()
        result = await self.tools[tool_name](**kwargs)
        duration = (time.time() - start) * 1000
        
        self.trace.tool_calls.append(ToolCall(
            tool_name=tool_name,
            args=kwargs,
            result=result,
            duration_ms=duration,
        ))
        
        logger.info("tool_call", agent=self.name, tool=tool_name, duration_ms=duration)
        return result
    
    async def call_llm(self, prompt: str, system: str = "", json_schema: dict | None = None) -> str | dict:
        """调用 LLM,自动记录 token 消耗"""
        self.trace.llm_calls += 1
        # 实际调用 LLM (用现有的 DashScope/DeepSeek 配置)
        response = await self.llm.chat(
            system=system,
            user=prompt,
            json_schema=json_schema,  # 结构化输出约束
        )
        self.trace.total_tokens += response.usage.total_tokens
        return response.content
    
    async def run(self, context: dict) -> dict:
        """执行 Agent 并返回带 trace 的结果"""
        self.trace.started_at = time.time()
        try:
            output = await self.analyze(context)
            self.trace.output = output
            self.trace.finished_at = time.time()
            return output
        except Exception as e:
            self.trace.error = str(e)
            self.trace.finished_at = time.time()
            logger.error("agent_failed", agent=self.name, error=str(e))
            raise
```

### 工具层: Tools

```python
# src/evograph/agent/tools/__init__.py

"""
每个工具是一个 async 函数,接收明确参数,返回结构化结果。
Agent 通过 call_tool() 调用,自动记录 trace。
"""

# 已有工具(从现有代码重构):
# - github_fetcher: 获取仓库文件树、README、文件内容
# - code_parser: 用 tree-sitter 解析 AST,提取函数/类/调用关系
# - call_graph_tracer: 从入口点追踪调用链(现有 tour_builder 的核心逻辑)
# - architecture_detector: 检测架构模式(现有 architecture_analyzer 的启发式部分)

# 新增工具:
# - readme_summarizer: 提取 README 的关键信息(不用 LLM,用规则)
# - dependency_resolver: 分析 import 关系,构建模块依赖图
# - pattern_matcher: 匹配已知设计模式(工厂、观察者、中间件等)
```

每个工具的标准签名:

```python
# src/evograph/agent/tools/github_fetcher.py

async def fetch_repo_tree(repo_url: str) -> dict:
    """获取仓库文件树"""
    # Returns: {"files": [...], "directories": [...], "total_files": int}

async def fetch_file_content(repo_url: str, file_path: str) -> dict:
    """获取单个文件内容"""
    # Returns: {"path": str, "content": str, "lines": int, "language": str}

async def fetch_readme(repo_url: str) -> dict:
    """获取 README 内容"""
    # Returns: {"content": str, "has_badges": bool, "sections": [...]}
```

### 四个专职 Agent

#### OverviewAgent (先看门道)

```python
# src/evograph/agent/stages/overview_agent.py

class OverviewAgent(BaseAgent):
    """
    职责: 生成仓库的一句话定位、核心问题、心智模型、推荐阅读顺序。
    
    工具: github_fetcher, code_parser, readme_summarizer
    
    输入 context: {"repo_url": str}
    
    输出 JSON Schema:
    {
      "positioning": str,        # 一句话定位
      "coreProblem": str,        # 核心问题
      "mentalModel": {
        "whatIsIt": {"title": str, "description": str},
        "whoIsItFor": {"title": str, "description": str},
        "howItWorks": {"title": str, "description": str}
      },
      "readingOrder": [{"step": int, "title": str, "description": str, "githubUrl": str}],
      "architectureSummary": str  # 传递给下一个 Agent 的上下文
    }
    """
    
    async def analyze(self, context: dict) -> dict:
        repo_url = context["repo_url"]
        
        # 1. 用工具获取原始数据
        tree = await self.call_tool("fetch_repo_tree", repo_url=repo_url)
        readme = await self.call_tool("fetch_readme", repo_url=repo_url)
        
        # 2. 用工具做确定性分析
        structure = await self.call_tool("code_parser", repo_url=repo_url, files=tree["files"][:20])
        
        # 3. 用 LLM 做判断性综合(带 JSON Schema 约束输出)
        result = await self.call_llm(
            system="你是一个代码仓库分析专家。根据提供的仓库信息,生成结构化的仓库概览。",
            prompt=f"README:\n{readme['content'][:3000]}\n\n文件结构:\n{tree['files'][:50]}\n\n代码结构:\n{structure}",
            json_schema=OVERVIEW_OUTPUT_SCHEMA,
        )
        
        return result
```

#### MainFlowAgent (跑通主线)

```python
# src/evograph/agent/stages/mainflow_agent.py

class MainFlowAgent(BaseAgent):
    """
    职责: 追踪主请求流程,生成执行链路图。
    
    工具: call_graph_tracer, code_parser, github_fetcher
    
    输入 context: {
      "repo_url": str,
      "architectureSummary": str,  # 来自 OverviewAgent
      "entry_points": list         # 来自 OverviewAgent 的分析
    }
    
    输出 JSON Schema:
    {
      "flowNodes": [{
        "id": int,
        "title": str,
        "note": str,
        "detail": {"explanation": str, "whatToLook": str, "whyFirst": str, "outcome": str}
      }],
      "evidenceLinks": [{"label": str, "githubUrl": str}]
    }
    """
    
    async def analyze(self, context: dict) -> dict:
        repo_url = context["repo_url"]
        
        # 1. 用工具追踪调用链(确定性)
        call_chain = await self.call_tool(
            "call_graph_tracer",
            repo_url=repo_url,
            entry_hint=context.get("entry_points", []),
        )
        
        # 2. 获取关键文件内容
        key_files = call_chain["key_files"][:5]
        file_contents = {}
        for f in key_files:
            content = await self.call_tool("fetch_file_content", repo_url=repo_url, file_path=f)
            file_contents[f] = content["content"][:2000]
        
        # 3. LLM 将调用链翻译为人话
        result = await self.call_llm(
            system="你是一个代码流程分析专家。将技术调用链翻译为用户友好的执行流程说明。",
            prompt=f"架构背景:\n{context.get('architectureSummary', '')}\n\n调用链:\n{call_chain}\n\n关键代码:\n{file_contents}",
            json_schema=MAINFLOW_OUTPUT_SCHEMA,
        )
        
        return result
```

#### ShowcaseAgent (拆它绝活)

```python
# src/evograph/agent/stages/showcase_agent.py

class ShowcaseAgent(BaseAgent):
    """
    职责: 识别设计亮点,分析 tradeoff,定位代码证据。
    
    工具: pattern_matcher, code_parser, github_fetcher, architecture_detector
    
    输入 context: {
      "repo_url": str,
      "architectureSummary": str,
      "flowNodes": list,  # 来自 MainFlowAgent
    }
    
    输出: 3个设计亮点,每个包含问题/方案/tradeoff/代码证据/GitHub链接
    """
```

#### TakeawayAgent (抄走一招)

```python
# src/evograph/agent/stages/takeaway_agent.py

class TakeawayAgent(BaseAgent):
    """
    职责: 从亮点中提炼可复用模式,生成最小实现代码。
    
    工具: code_parser, pattern_matcher
    
    输入 context: {
      "repo_url": str,
      "highlights": list,  # 来自 ShowcaseAgent
    }
    
    输出: 2-3个可复用模式,每个包含适用场景/核心思路/最小代码/局限
    """
```

### Orchestrator (编排层)

```python
# src/evograph/agent/orchestrator.py

class AnalysisOrchestrator:
    """
    编排4个 Agent 的执行顺序,管理上下文传递。
    
    关键设计:
    1. 阶段间上下文传递 — 前一个 Agent 的输出注入下一个的 context
    2. 并行 vs 串行 — Overview 必须先跑,MainFlow 和 Showcase 可以并行
    3. 失败降级 — 某个 Agent 失败不阻塞其他阶段
    4. 进度回调 — 实时通知前端当前分析进度
    """
    
    def __init__(self, llm_client, tools: dict):
        self.overview_agent = OverviewAgent("overview", llm_client, tools)
        self.mainflow_agent = MainFlowAgent("mainflow", llm_client, tools)
        self.showcase_agent = ShowcaseAgent("showcase", llm_client, tools)
        self.takeaway_agent = TakeawayAgent("takeaway", llm_client, tools)
    
    async def analyze_repo(self, repo_url: str, on_progress=None) -> dict:
        """完整分析一个仓库,返回所有阶段的结果"""
        
        results = {}
        context = {"repo_url": repo_url}
        
        # Stage 1: Overview (必须先跑)
        if on_progress: on_progress("overview", "running")
        overview = await self.overview_agent.run(context)
        results["overview"] = overview
        context.update(overview)  # 注入到后续 context
        if on_progress: on_progress("overview", "done")
        
        # Stage 2 & 3: MainFlow 和 Showcase 可以并行
        if on_progress: on_progress("mainflow", "running")
        if on_progress: on_progress("showcase", "running")
        
        import asyncio
        mainflow_task = asyncio.create_task(self.mainflow_agent.run(context))
        showcase_task = asyncio.create_task(self.showcase_agent.run(context))
        
        mainflow = await mainflow_task
        results["mainflow"] = mainflow
        context.update({"flowNodes": mainflow.get("flowNodes", [])})
        if on_progress: on_progress("mainflow", "done")
        
        showcase = await showcase_task
        results["showcase"] = showcase
        context.update({"highlights": showcase.get("highlights", [])})
        if on_progress: on_progress("showcase", "done")
        
        # Stage 4: Takeaway (依赖 Showcase 的输出)
        if on_progress: on_progress("takeaway", "running")
        takeaway = await self.takeaway_agent.run(context)
        results["takeaway"] = takeaway
        if on_progress: on_progress("takeaway", "done")
        
        # 收集所有 trace
        results["_traces"] = {
            "overview": self.overview_agent.trace,
            "mainflow": self.mainflow_agent.trace,
            "showcase": self.showcase_agent.trace,
            "takeaway": self.takeaway_agent.trace,
        }
        
        return results
```

### API 层

```python
# src/evograph/api/v1/analysis.py

from fastapi import APIRouter, BackgroundTasks
from evograph.agent.orchestrator import AnalysisOrchestrator

router = APIRouter(prefix="/api/v1")

# 存储分析结果(生产环境用 Redis/DB)
analysis_store: dict[str, dict] = {}

@router.post("/repos/analyze")
async def start_analysis(body: dict, background_tasks: BackgroundTasks):
    """提交仓库分析任务"""
    repo_url = body["repo_url"]
    task_id = generate_task_id()
    
    analysis_store[task_id] = {"status": "running", "progress": {}}
    
    async def run_analysis():
        orchestrator = AnalysisOrchestrator(llm_client, tools)
        
        def on_progress(stage, status):
            analysis_store[task_id]["progress"][stage] = status
        
        result = await orchestrator.analyze_repo(repo_url, on_progress)
        analysis_store[task_id] = {"status": "done", "result": result}
    
    background_tasks.add_task(run_analysis)
    return {"task_id": task_id}

@router.get("/repos/{task_id}/status")
async def get_status(task_id: str):
    """查询分析进度"""
    return analysis_store.get(task_id, {"status": "not_found"})

@router.get("/repos/{task_id}/overview")
async def get_overview(task_id: str):
    """获取 Stage 1 结果"""
    data = analysis_store.get(task_id, {})
    return data.get("result", {}).get("overview", {})

@router.get("/repos/{task_id}/mainflow")
async def get_mainflow(task_id: str):
    """获取 Stage 2 结果"""
    data = analysis_store.get(task_id, {})
    return data.get("result", {}).get("mainflow", {})

@router.get("/repos/{task_id}/showcase")
async def get_showcase(task_id: str):
    """获取 Stage 3 结果"""
    data = analysis_store.get(task_id, {})
    return data.get("result", {}).get("showcase", {})

@router.get("/repos/{task_id}/takeaway")
async def get_takeaway(task_id: str):
    """获取 Stage 4 结果"""
    data = analysis_store.get(task_id, {})
    return data.get("result", {}).get("takeaway", {})

@router.get("/repos/{task_id}/traces")
async def get_traces(task_id: str):
    """获取 Agent 执行追踪(面试演示用)"""
    data = analysis_store.get(task_id, {})
    return data.get("result", {}).get("_traces", {})
```

---

## 实现优先级

1. **先实现 BaseAgent + Tool 抽象** — 这是架构的骨架
2. **再实现 OverviewAgent** — 最简单的一个,验证整个链路
3. **然后 Orchestrator + API** — 让前端能调通
4. **最后 MainFlow/Showcase/Takeaway Agent** — 逐个接入

每个阶段都要能跑通:Agent 调工具 → 工具返回数据 → Agent 调 LLM → LLM 返回结构化 JSON → API 返回给前端。

---

## 面试亮点清单(实现时重点打磨)

### 1. 工具与 Agent 的解耦
- 工具是纯函数,不知道谁在调用它
- Agent 通过 `call_tool()` 调用,自动记录 trace
- 新增工具只需注册,不改 Agent 代码

### 2. 结构化输出(JSON Schema 约束)
- 每个 Agent 的输出有严格的 JSON Schema
- LLM 调用时传入 schema,保证输出格式正确
- 前端可以直接渲染,不需要额外解析

### 3. 阶段间上下文传递(记忆)
- Overview 的 `architectureSummary` 注入 MainFlow 的 context
- MainFlow 的 `flowNodes` 注入 Showcase 的 context
- Showcase 的 `highlights` 注入 Takeaway 的 context
- 这就是"Agent 记忆"的最简实现

### 4. 确定性分析 + LLM 判断的分层
- 工具层做确定性分析(AST 解析、调用链追踪、文件结构)
- LLM 只做"判断"和"翻译"(哪个是亮点、怎么用人话解释)
- LLM 不可用时,工具层的结果仍然可用(降级)

### 5. 可观测性(Trace)
- 每个 Agent 的每次工具调用、LLM 调用都有记录
- 可以回放整个分析过程:"Overview Agent 先调了 fetch_repo_tree,花了 200ms,然后调了 code_parser..."
- 提供 `/traces` API,面试时可以演示

### 6. 并行执行
- MainFlow 和 Showcase 不互相依赖,可以并行
- Orchestrator 用 `asyncio.gather` 实现
- 减少总分析时间

---

## 页面独立性约束(后端)

```
⚠️ 绝对禁止:
- 删除现有的 analyzer 文件(重构它们,不删除)
- 改变现有 API 端点的行为(新增端点,不改旧的)
- 硬编码 LLM key 到代码中(用 config.py)

✅ 允许:
- 创建 src/evograph/agent/base.py
- 创建 src/evograph/agent/stages/ 目录和4个 Agent 文件
- 创建 src/evograph/agent/tools/ 目录,重构现有工具
- 修改 src/evograph/agent/orchestrator.py
- 新增 API 路由文件
- 修改 main.py 注册新路由
```

---

## 验收清单

- [ ] `BaseAgent` 抽象类存在,有 `call_tool()`、`call_llm()`、`run()` 方法
- [ ] `AgentTrace` 数据类存在,记录工具调用和 token 消耗
- [ ] 至少 `OverviewAgent` 完整实现并能跑通
- [ ] `AnalysisOrchestrator` 存在,能串联4个 Agent
- [ ] API 端点 `/api/v1/repos/analyze` 能接收仓库 URL 并启动分析
- [ ] API 端点 `/api/v1/repos/{task_id}/overview` 能返回结构化结果
- [ ] `/api/v1/repos/{task_id}/traces` 能返回执行追踪
- [ ] Agent 输出格式与前端 mock 数据结构一致
- [ ] LLM 调用使用现有的 DeepSeek 配置
- [ ] 工具调用有 structlog 日志
