# ResearchBot - 开发设计文档

> **Version:** 1.0  
> **Status:** Draft  
> **Last Updated:** 2026-05-29  
> **Related Documents:** PRD.md, SPEC.md, API.md, MileStone.md  

---

## 1. 技术选型

### 1.1 技术栈总览

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **前端框架** | Next.js 14 (App Router) + React | SSR/SSG 支持，服务端渲染流式输出 |
| **UI 库** | Tailwind CSS | 原子化 CSS，快速响应式开发 |
| **语言** | TypeScript (strict 模式) | 类型安全，IDE 支持好 |
| **Agent 框架** | LangChain / LangGraph | 模块化工具调用、工作流编排 |
| **LLM** | MiniMax (deepseek-chat) | 支持流式输出 |
| **搜索引擎** | Bing Search API（主） / Brave Search API（备） | 搜索结果获取 |
| **浏览器自动化** | Playwright | 网页内容提取 |
| **数据验证** | Zod | 运行时类型校验 |
| **流式协议** | Server-Sent Events (SSE) | 实时推送 |
| **部署平台** | Vercel | Next.js 原生支持，冷启动优化 |

### 1.2 技术选型理由

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 全栈框架 | Next.js | 内置 API Routes、SSR、流式渲染，与 Vercel 无缝集成 |
| Agent 编排 | LangGraph | 基于状态机的有向图，支持复杂工作流、可视化调试 |
| 流式输出 | SSE | 轻量、实现简单，无需 WebSocket 复杂握手 |
| 内容提取 | Playwright | 比爬虫更鲁棒，能处理 JS 渲染页面 |
| 搜索降级 | Brave Search | 免费 API，备选方案保障可用性 |
| 状态管理 | LangGraph State | 工作流状态内置，无需额外状态库 |

### 1.3 依赖清单

```json
// package.json 核心依赖
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "@langchain/langgraph": "^0.0.x",
    "@langchain/community": "^0.0.x",
    "langchain": "^0.1.x",
    "playwright": "^1.x",
    "zod": "^3.x",
    "tailwindcss": "^3.x",
    "react-markdown": "^9.x"
  },
  "devDependencies": {
    "eslint": "^8.x",
    "prettier": "^3.x",
    "@playwright/test": "^1.x",
    "vitest": "^1.x"
  }
}
```

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ResearchBot MVP                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                          Frontend (Next.js)                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ ChatInput   │  │StreamOutput │  │  UIKit      │  │   Layout    │  │  │
│  │  │  组件       │  │  组件       │  │  组件库     │  │  布局       │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                      │
│                                       │ HTTP / SSE                          │
│                                       ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                         API Layer (Next.js API Routes)                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ POST       │  │ GET         │  │ GET         │  │ Middleware  │  │  │
│  │  │ /api/      │  │ /api/       │  │ /api/       │  │ 错误处理    │  │  │
│  │  │ research   │  │ research/   │  │ health      │  │ 限流       │  │  │
│  │  │            │  │ stream      │  │             │  │ 日志       │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                      │
│                                       ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                     Agent Layer (LangGraph)                              │  │
│  │                                                                          │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Research Workflow                              │  │  │
│  │  │                                                                   │  │  │
│  │  │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │  │  │
│  │  │   │  Input  │───▶│ Search  │───▶│ Browse  │───▶│Summarize│      │  │  │
│  │  │   │  Node   │    │  Node   │    │  Node   │    │  Node   │      │  │  │
│  │  │   └─────────┘    └─────────┘    └─────────┘    └─────────┘      │  │  │
│  │  │       │                                               │           │  │  │
│  │  │       │◀──────────────────────────────────────────────┘           │  │  │
│  │  │   ┌─────────┐                                              │           │  │  │
│  │  │   │ Error   │◀──────────────────────────── Error Loop ◀───┘           │  │  │
│  │  │   │ Handler │                                                       │  │  │
│  │  │   └─────────┘                                                       │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                          │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Tools                                          │  │  │
│  │  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │  │  │
│  │  │   │  Search    │  │  Browser    │  │   LLM      │              │  │  │
│  │  │   │  Tool      │  │  Tool       │  │  Tool      │              │  │  │
│  │  │   │ (Bing/Brave)│ │(Playwright) │  │(MiniMax)   │              │  │  │
│  │  │   └─────────────┘  └─────────────┘  └─────────────┘              │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                      │
│                                       ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                        External Services                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │  Bing      │  │  Brave      │  │  MiniMax   │  │   网页     │     │  │
│  │  │  Search    │  │  Search     │  │  LLM API   │  │   目标     │     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
用户输入 ──▶ 输入验证 ──▶ 任务创建 ──▶ 工作流启动
                                        │
                                        ▼
                    ┌───────────────────────────────────┐
                    │       LangGraph State 更新        │
                    │                                   │
                    │  state = {                        │
                    │    topic,                         │
                    │    status,                        │
                    │    searchResults[],               │
                    │    browsedContent[],              │
                    │    report,                        │
                    │    stats,                          │
                    │    error                           │
                    │  }                                │
                    └───────────────────────────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                ▼                       ▼                       ▼
           ┌────────┐            ┌────────┐            ┌────────┐
           │ Search │            │ Browse │            │Summarize│
           │  节点  │            │  节点   │            │  节点   │
           └────────┘            └────────┘            └────────┘
                │                       │                       │
                ▼                       ▼                       ▼
         返回 URL 列表            返回页面内容            返回研究报告
                │                       │                       │
                └───────────────────────┼───────────────────────┘
                                        │
                                        ▼
                              ┌─────────────────┐
                              │ SSE Stream 推送  │
                              │ thinking/        │
                              │ searching/       │
                              │ browsing/        │
                              │ report/          │
                              │ done             │
                              └─────────────────┘
                                        │
                                        ▼
                              ┌─────────────────┐
                              │  前端增量渲染    │
                              │  Markdown 解析  │
                              │  进度展示       │
                              └─────────────────┘
```

### 2.3 部署架构

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │  │
│  │  │ Next.js │  │ API    │  │ SSE    │        │  │
│  │  │ SSR    │  │ Routes │  │ Stream │        │  │
│  │  └─────────┘  └─────────┘  └─────────┘        │  │
│  └───────────────────────────────────────────────┘  │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐  │
│  │              Vercel Serverless                  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  LangGraph Workflow (Serverless Func)   │  │  │
│  │  │  - Search Tool                          │  │  │
│  │  │  - Browser Tool                         │  │  │
│  │  │  - LLM Tool                              │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐  │
│  │              External APIs                     │  │
│  │  Bing Search │ Brave Search │ MiniMax LLM     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. 模块划分

### 3.1 模块总览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              模块划分                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────┐   ┌─────────────────────────┐                 │
│  │    前端模块 (Frontend)   │   │   后端模块 (Backend)      │                 │
│  ├─────────────────────────┤   ├─────────────────────────┤                 │
│  │  M1: ChatInput          │   │  M6: API Routes          │                 │
│  │  M2: StreamOutput       │   │  M7: LangGraph Workflow   │                 │
│  │  M3: UIKit              │   │  M8: Search Tool          │                 │
│  │  M4: Layout             │   │  M9: Browser Tool         │                 │
│  │  M5: E2E                │   │  M10: LLM Tool            │                 │
│  │                         │   │  M11: Config & Utils      │                 │
│  └─────────────────────────┘   └─────────────────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 前端模块

| 模块 | 文件位置 | 职责 | 依赖 |
|------|---------|------|------|
| **M1: ChatInput** | `components/ChatInput/` | 研究主题输入框、字符计数、提交验证 | M3 |
| **M2: StreamOutput** | `components/StreamOutput/` | SSE 连接、增量渲染、进度展示 | M3 |
| **M3: UIKit** | `components/ui/` | Button、Card、Input 等基础组件 | - |
| **M4: Layout** | `app/` | 页面布局、响应式设计、无障碍 | M1, M2, M3 |
| **M5: E2E** | `tests/e2e/` | Playwright 端到端测试 | M1, M2, M4 |

### 3.3 后端模块

| 模块 | 文件位置 | 职责 | 依赖 |
|------|---------|------|------|
| **M6: API Routes** | `app/api/` | REST API 端点实现 | M7, M11 |
| **M7: LangGraph Workflow** | `agents/workflow/` | 工作流定义、状态管理、节点跳转 | M8, M9, M10 |
| **M8: Search Tool** | `agents/tools/search.ts` | 搜索引擎调用、结果过滤 | M11 |
| **M9: Browser Tool** | `agents/tools/browser.ts` | Playwright 封装、内容提取 | M11 |
| **M10: LLM Tool** | `lib/llm.ts` | MiniMax API 调用、流式生成 | M11 |
| **M11: Config & Utils** | `lib/` | 配置管理、日志、错误处理 | - |

### 3.4 目录结构

```
ResearchBot/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   ├── globals.css               # 全局样式
│   └── api/                      # API Routes
│       ├── research/
│       │   ├── route.ts          # POST /api/research
│       │   └── stream/
│       │       └── route.ts      # GET /api/research/stream
│       └── health/
│           └── route.ts          # GET /api/health
│
├── components/                   # React 组件
│   ├── ui/                       # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── ChatInput/                # 输入组件
│   │   └── ChatInput.tsx
│   └── StreamOutput/             # 流式输出组件
│       └── StreamOutput.tsx
│
├── agents/                       # Agent 相关
│   ├── workflow/                # 工作流
│   │   ├── index.ts             # 工作流入口
│   │   ├── state.ts             # 状态定义
│   │   └── nodes/               # 工作流节点
│   │       ├── input.ts
│   │       ├── search.ts
│   │       ├── browse.ts
│   │       └── summarize.ts
│   └── tools/                   # 工具
│       ├── search.ts            # 搜索工具
│       ├── browser.ts           # 浏览器工具
│       └── llm.ts               # LLM 工具封装
│
├── lib/                          # 工具库
│   ├── llm.ts                   # LLM 调用封装
│   ├── config.ts                # 配置管理
│   ├── logger.ts                # 日志模块
│   ├── errors.ts                # 错误定义
│   └── validation.ts            # 数据验证 (Zod)
│
├── types/                        # 类型定义
│   └── index.ts                 # 全局类型
│
├── tests/                        # 测试
│   ├── unit/                    # 单元测试
│   └── e2e/                     # E2E 测试
│
├── docs/                         # 文档
│   ├── PRD.md                   # 产品需求
│   ├── SPEC.md                  # 功能规格
│   ├── API.md                   # API 规格
│   └── MileStone.md             # 里程碑
│
├── dev-all/                      # 开发设计文档
│   ├── dev-pre.md               # 本文档
│   └── ...
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 4. 核心流程设计

### 4.1 主流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ResearchBot 核心流程                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1️⃣ 用户输入                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  用户输入研究主题 → 前端验证（10-500字符）→ 禁用输入框 → 显示 loading  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      ↓                                       │
│  2️⃣ 任务创建                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  POST /api/research → 创建任务 → 返回 taskId + streamToken           │    │
│  │  → 启动 SSE 连接                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      ↓                                       │
│  3️⃣ 工作流执行                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │  3.1 Input Node                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │ 解析用户输入 → 更新状态 → SSE推送 thinking                    │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                              ↓                                        │    │
│  │  3.2 Search Node                                                   │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │ 调用 Bing Search API → 获取 URL 列表 → 去重/过滤            │    │    │
│  │  │ → 更新状态 → SSE推送 searching                               │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                              ↓                                        │    │
│  │  3.3 Browse Node (循环)                                            │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │ for each URL {                                               │    │    │
│  │  │   初始化 Playwright → 打开页面 → 等待加载                    │    │    │
│  │  │   → 提取正文 → 清洗内容 → 截断至 8000 tokens                 │    │    │
│  │  │   → 保存内容 → SSE推送 browsing                              │    │    │
│  │  │ }                                                            │    │    │
│  │  │ 404/500/超时 → 跳过并记录日志                                │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                              ↓                                        │    │
│  │  3.4 Summarize Node                                                │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │ 构造 Prompt → 调用 MiniMax LLM → 流式生成报告               │    │    │
│  │  │ → SSE推送 report (增量)                                     │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      ↓                                       │
│  4️⃣ 任务完成                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  汇总统计信息 → SSE推送 done → 启用交互按钮 → 允许新任务输入        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 状态流转

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ResearchState 状态流转                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ResearchState = {                                                          │
│    topic: string,              // 研究主题                                    │
│    maxResults: number,         // 最大浏览页面数                              │
│    includeSources: boolean,    // 是否包含来源                               │
│                                                                              │
│    status: TaskStatus,        // 任务状态                                    │
│    searchResults: SearchResult[],  // 搜索结果                               │
│    browsedContent: Content[],     // 浏览内容                                │
│    report: string,            // 研究报告                                    │
│    sources: Source[],         // 参考来源                                    │
│    stats: TaskStats,          // 统计信息                                    │
│    error?: ErrorInfo,         // 错误信息                                    │
│  }                                                                            │
│                                                                              │
│  状态流转:                                                                   │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐  │
│  │ pending │───▶│running  │───▶│completed│    │ failed  │    │cancelled │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └──────────┘  │
│                       │              ↑              ↑                ↑       │
│                       │              │              │                │       │
│                       ▼              │              │                │       │
│                  ┌─────────┐         │              │                │       │
│                  │running  │◀────────┴──────────────┘                │       │
│                  │(搜索中) │                                            │       │
│                  └────┬────┘                                            │       │
│                       │                                                 │       │
│                       ▼                                                 │       │
│                  ┌─────────┐                                            │       │
│                  │running  │◀─────────────────────────────────────────┘       │
│                  │(浏览中) │                                                     │
│                  └────┬────┘                                                     │
│                       │                                                         │
│                       ▼                                                         │
│                  ┌─────────┐                                                    │
│                  │running  │                                                    │
│                  │(生成中) │                                                    │
│                  └────┬────┘                                                    │
│                       │                                                         │
│                       ▼                                                         │
│                  ┌─────────┐                                                    │
│                  │completed│                                                    │
│                  └─────────┘                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 LangGraph 工作流定义

```typescript
// agents/workflow/index.ts

import { StateGraph, END } from "@langchain/langgraph";
import { ResearchState, initialState } from "./state";
import { inputNode } from "./nodes/input";
import { searchNode } from "./nodes/search";
import { browseNode } from "./nodes/browse";
import { summarizeNode } from "./nodes/summarize";

// 定义工作流图
const workflow = new StateGraph<ResearchState>({
  channels: ResearchState,
});

// 添加节点
workflow.addNode("input", inputNode);
workflow.addNode("search", searchNode);
workflow.addNode("browse", browseNode);
workflow.addNode("summarize", summarizeNode);

// 定义边
workflow.setEntryPoint("input");
workflow.addEdge("input", "search");
workflow.addEdge("search", "browse");
workflow.addEdge("browse", "summarize");
workflow.addEdge("summarize", END);

// 编译工作流
export const researchGraph = workflow.compile();
```

### 4.4 异常处理流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            异常处理流程                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  异常发生 ──▶ 异常分类 ──▶ 处理策略                                           │
│                    │                                                          │
│         ┌──────────┼──────────┬──────────┬──────────┐                       │
│         ▼          ▼          ▼          ▼          ▼                       │
│    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│    │INPUT_ERR│ │SEARCH_  │ │BROWSE_   │ │LLM_      │ │TIMEOUT  │            │
│    │        │ │ERR      │ │ERR      │ │ERR      │ │        │            │
│    └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘            │
│         │          │          │          │          │                       │
│         ▼          ▼          ▼          ▼          ▼                       │
│   显示错误提示  重试2次    跳过该页    重试1次    中断任务                   │
│   阻止提交     均失败则    继续其他    均失败则    │                       │
│               显示错误    页面处理    显示错误    ▼                       │
│                提示                              返回部分结果                 │
│                                                              │               │
│                                                              ▼               │
│                                                      SSE推送error事件        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 接口设计

### 5.1 API 端点总览

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/research` | POST | 创建研究任务 | - |
| `/api/research/stream` | GET | SSE 流式获取进度 | - |
| `/api/health` | GET | 健康检查 | - |

### 5.2 数据模型

```typescript
// types/index.ts

// 研究任务状态
type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

// 搜索结果
interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  rank: number;
}

// 浏览内容
interface BrowsedContent {
  url: string;
  title?: string;
  content: string;
  accessedAt: string;
  contentLength: number;
}

// 统计信息
interface TaskStats {
  searchTime: number;
  browseTime: number;
  summarizeTime: number;
  totalTime: number;
  pagesVisited: number;
  pagesSkipped: number;
}

// 研究状态
interface ResearchState {
  topic: string;
  maxResults: number;
  includeSources: boolean;
  status: TaskStatus;
  searchResults: SearchResult[];
  browsedContent: BrowsedContent[];
  report: string;
  sources: Source[];
  stats: TaskStats;
  error?: ErrorInfo;
}
```

### 5.3 请求/响应示例

**创建研究任务请求:**
```json
POST /api/research
{
  "topic": "研究 2026 年 AI Agent 的发展趋势",
  "maxResults": 5,
  "includeSources": true
}
```

**创建研究任务响应:**
```json
{
  "success": true,
  "data": {
    "taskId": "task_abc123def456",
    "createdAt": "2026-05-29T10:30:00.000Z",
    "streamToken": "stream_token_xyz789"
  }
}
```

**SSE 事件流:**
```
event: thinking
data: {"type":"thinking","content":"正在分析您的问题...","timestamp":1716959400000}

event: searching
data: {"type":"searching","content":"搜索完成，找到 10 个结果","resultsCount":10,"timestamp":1716959401500}

event: browsing
data: {"type":"browsing","content":"正在浏览：zhihu.com/p/12345","url":"https://zhihu.com/p/12345","progress":"2/5","timestamp":1716959402000}

event: report
data: {"type":"report","content":"# 研究报告\n\n## 概述\n","isPartial":true,"timestamp":1716959403000}

event: done
data: {"type":"done","content":"研究完成！","stats":{"totalTime":25000,"pagesVisited":5},"report":"...","sources":[...],"timestamp":1716959425000}
```

---

## 6. 关键配置

### 6.1 超时配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `search.timeout` | 10000ms | 搜索超时 |
| `browse.pageTimeout` | 15000ms | 单页面浏览超时 |
| `browse.totalTimeout` | 20000ms | 总浏览超时 |
| `llm.timeout` | 30000ms | 总结生成超时 |
| `task.timeout` | 60000ms | 任务总超时 |

### 6.2 重试配置

| 配置项 | 重试次数 | 间隔 |
|--------|---------|------|
| `search.retry` | 2 | 1000ms |
| `browse.retry` | 1 | 500ms |
| `llm.retry` | 1 | 1000ms |

### 6.3 内容限制

| 配置项 | 限制值 | 说明 |
|--------|--------|------|
| `input.length.min` | 10 | 最小输入长度 |
| `input.length.max` | 500 | 最大输入长度 |
| `browse.maxTokens` | 8000 | 单页面最大 token 数 |
| `search.maxResults` | 10 | 搜索结果数上限 |
| `browse.maxPages` | 5 | 浏览页面数上限 |

---

## 7. 性能指标

| 指标 | 目标值 | 测试方法 |
|------|--------|---------|
| 冷启动时间 | < 3s | 性能测试 |
| 搜索响应时间 | < 2s | 性能测试 |
| 单页面浏览时间 | < 5s | 性能测试 |
| 报告生成时间 | < 10s | 性能测试 |
| 端到端时间 | < 30s | 性能测试 |
| 并发能力 | 3 个并发 | 压力测试 |

---

## 8. 验收检查清单

### 8.1 功能验收

- [ ] F1: 用户能输入 10-500 字符的研究主题
- [ ] F2: 搜索返回相关 URL 列表
- [ ] F3: 能提取网页正文内容
- [ ] F4: 能生成结构化 Markdown 报告
- [ ] F5: SSE 流式推送实时进度
- [ ] F7: 输入验证正确工作
- [ ] F8: 错误场景有友好提示
- [ ] F9: 日志正常记录
- [ ] F10: 超时控制正确
- [ ] F11: 配置覆盖生效

### 8.2 技术验收

- [ ] 项目可 `npm run dev` 启动
- [ ] 代码通过 ESLint + Prettier
- [ ] 单元测试覆盖 > 80%
- [ ] E2E 测试覆盖核心流程
- [ ] 移动端响应式正常
- [ ] 无障碍可访问

---

**Document Change Log:**

| 版本 | 日期 | 作者 | 变更内容 |
|-----|------|------|---------|
| 1.0 | 2026-05-29 | Tech Team | 初始版本 |