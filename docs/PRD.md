# ResearchBot - Product Requirements Document

> **Version:** 1.0  
> **Status:** Draft  
> **Last Updated:** 2026-05-29  
> **Author:** Product Team  
> **Document Type:** Product Requirements Document  

---

## 1. 背景与问题陈述

### 1.1 背景

在信息爆炸的时代，研究人员、产品经理、学生等群体需要花费大量时间进行网络信息收集。一项完整的研究工作通常包含：手动搜索 → 逐个打开网页 → 复制粘贴有用信息 → 整理归纳 → 撰写报告。整个过程耗时长、效率低、容易遗漏关键信息。

### 1.2 现有问题

| 痛点 | 描述 | 影响 |
|-----|------|------|
| 信息碎片化 | 相关内容分散在数十个网站中 | 收集耗时数小时 |
| 人工重复劳动 | 需要反复"搜索→打开→复制" | 效率低下 |
| 信息过载 | 搜索结果大量但不相关 | 筛选成本高 |
| 缺乏整合 | 没有自动化工具整合多来源信息 | 报告质量不稳定 |
| 无法追踪来源 | 复制粘贴时容易丢失原始链接 | 引用不规范 |

### 1.3 解决方案

通过 AI Agent 实现自动化研究流程：用户输入研究主题 → Agent 自动完成搜索→浏览→总结全流程 → 输出结构化报告。

---

## 2. 产品概述

### 2.1 产品定义

| 属性 | 内容 |
|-----|------|
| 产品名称 | ResearchBot |
| 产品定位 | 智能网页研究助手 |
| 产品类型 | AI Agent 应用 |
| 核心价值主张 | 一句话 → 自动报告：从"手动搜索+复制粘贴"升级为"AI 自动完成" |
| 目标用户画像 | 需要快速完成信息收集和研究工作的知识工作者 |

### 2.2 核心用户故事

**Primary User Story：**
```
作为一名 [研究人员/产品经理/学生]
我想要 [输入一个研究主题，自动获得结构化报告]
以便 [节省信息收集时间，专注于分析和决策]
```

**Acceptance Criteria：**
- 用户输入研究主题后，无需手动干预即可获得完整报告
- 报告中包含信息来源，支持追溯验证
- 全流程耗时控制在 30 秒以内

---

## 3. MVP 功能范围

### 3.1 功能优先级矩阵

| 功能模块 | 功能点 | 功能描述 | 优先级 | 状态 | 备注 |
|---------|-------|---------|--------|------|------|
| **核心流程** | 自然语言输入 | 用户用自然语言提出研究主题 | P0 | MVP | 必须 |
| **核心流程** | 搜索引擎调用 | 自动调用搜索引擎获取相关结果 | P0 | MVP | 必须 |
| **核心流程** | 网页自动浏览 | 使用 Playwright 打开网页、提取内容 | P0 | MVP | 必须 |
| **核心流程** | 内容总结生成 | 基于收集的信息生成结构化报告 | P0 | MVP | 必须 |
| **体验增强** | 流式输出 | 实时展示 Agent 的思考过程 | P1 | MVP | 增强体验 |
| **体验增强** | 对话历史 | 支持多轮对话，Agent 记得之前话题 | P2 | V2 | 后续版本 |
| **扩展功能** | 文件导出 | 支持 PDF/Markdown 导出 | P2 | V2 | 后续版本 |
| **扩展功能** | 多 Agent 协作 | 多个 Agent 分工协作 | P3 | V2+ | 架构扩展 |

### 3.2 功能详细说明

#### 3.2.1 F1: 自然语言输入

**描述：** 用户通过自然语言描述研究主题

**输入示例：**
```
研究一下 2026 年 AI Agent 的发展趋势，重点关注企业级应用场景
```

**约束条件：**
- 输入长度限制：10-500 字符
- 支持语言：中文（首选）、英文
- 禁止输入：恶意代码、敏感个人信息

**验收标准：**
- [ ] 用户输入后系统正确解析研究主题
- [ ] 系统拒绝明显无效的输入并给出友好提示

#### 3.2.2 F2: 搜索引擎调用

**描述：** Agent 自动调用搜索工具获取相关网页链接

**实现方式：**
- 首选：Bing Search API
- 备选：Brave Search（免费）
- 降级：无法访问付费 API 时提示用户

**约束条件：**
- 单次搜索最多返回 10 个结果
- 搜索超时时间：10 秒
- 搜索失败重试次数：2 次

**验收标准：**
- [ ] 搜索成功返回 URL 列表
- [ ] 搜索失败时给出明确错误提示
- [ ] 支持根据主题智能扩展搜索关键词

#### 3.2.3 F3: 网页自动浏览

**描述：** 使用 Playwright 自动打开网页并提取主要内容

**处理流程：**
```
遍历搜索结果 URLs
  ↓
Playwright 打开网页
  ↓
等待页面加载完成（网络空闲检测）
  ↓
提取 <article> / <main> 或正文区域内容
  ↓
去除广告、导航栏等干扰元素
  ↓
返回纯文本内容
```

**约束条件：**
- 单页面浏览超时：15 秒
- 内容截断：单个页面最多保留 8000 tokens
- 最大浏览页面数：5 个（可配置）
- 自动跳过：无内容、登录墙、404 页面

**验收标准：**
- [ ] 能正确提取大部分主流网站正文内容
- [ ] 能识别并跳过无效页面（404、空内容）
- [ ] 浏览失败不影响其他页面继续处理

#### 3.2.4 F4: 内容总结生成

**描述：** 调用 LLM 基于收集的内容生成结构化报告

**报告结构：**
```markdown
# [研究主题]

## 概述
[2-3 句话概括主题核心内容]

## 主要发现
[按主题分类的发现点列表，每点包含：]
- 发现内容
- 来源网站
- 相关度评分

## 关键数据/事实
[提取的关键数字、日期、事件等]

## 专家观点/引用
[引用相关专家或权威机构的观点]

## 参考来源
[按相关度排序的 URL 列表]

## 结论
[基于研究内容的总结和建议]
```

**LLM 配置：**
- 模型：MINMAX DeepSeek
- Temperature：0.7
- 最大输出 Tokens：2000
- 系统提示词：[见附录 A]

**验收标准：**
- [ ] 报告结构完整，包含上述所有章节
- [ ] 报告内容与收集的信息一致，无幻觉
- [ ] 每项内容都有对应来源标注

#### 3.2.5 F5: 流式输出

**描述：** 通过 Server-Sent Events（SSE）实时推送 Agent 思考过程

**流式消息类型：**
```typescript
type StreamEvent =
  | { type: "thinking"; content: string }      // Agent 思考状态
  | { type: "searching"; content: string }    // 搜索状态
  | { type: "browsing"; content: string; progress: string } // 浏览进度
  | { type: "report"; content: string }        // 报告片段
  | { type: "done"; content: string; stats: Stats } // 完成状态
  | { type: "error"; content: string }        // 错误信息
```

**验收标准：**
- [ ] 用户能实时看到 Agent 的处理进度
- [ ] 报告内容增量式展示，无需等待
- [ ] 支持取消正在进行的任务

### 3.3 暂不实现功能

| 功能 | 原因 | 计划版本 |
|-----|------|---------|
| 文件下载/保存 | MVP 聚焦核心流程 | V2 |
| 用户登录/认证 | MVP 单机运行，无状态 | V2 |
| 可视化工作流 | UI 开发成本高 | V2 |
| 多 Agent 协作 | 架构复杂度高 | V2+ |
| 本地知识库 | 需要额外基础设施 | V2 |

---

## 4. 技术方案

### 4.1 技术栈总览

| 层级 | 技术选型 | 版本 | 说明 |
|-----|---------|------|------|
| Agent 框架 | LangGraph.js | latest | 工作流编排、状态管理、多步推理 |
| LLM 调用 | MiniMax | - | DeepSeek 模型调用 |
| 浏览器自动化 | Playwright | 1.40+ | 网页浏览、内容提取 |
| 前端框架 | React + Vite | 18.x / 5.x | 流式展示、快速热更新 |
| 前端语言 | TypeScript | 5.x | 类型安全 |
| 后端框架 | Next.js | 14.x | API Routes |
| 部署平台 | Vercel | - | 边缘计算、快速部署 |

### 4.2 项目目录结构

```
research-bot/
├── docs/                          # 项目文档
│   ├── PRD.md                     # 产品需求文档
│   ├── SPEC.md                     # 功能规格说明书
│   ├── API.md                      # 接口规格文档
│   ├── MileStone.md               # 项目里程碑
│   └── ARCHITECTURE.md            # 技术架构文档（可选）
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx              # 首页
│   │   ├── layout.tsx             # 布局组件
│   │   └── api/                   # API Routes
│   │       └── research/
│   │           └── route.ts       # 研究接口
│   │
│   ├── components/                 # React 组件
│   │   ├── ChatInput.tsx         # 输入框组件
│   │   ├── StreamOutput.tsx      # 流式输出组件
│   │   ├── HistoryList.tsx        # 历史记录组件
│   │   └── ui/                    # 基础 UI 组件
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   │
│   ├── agents/                    # Agent 相关代码
│   │   ├── workflow/
│   │   │   ├── index.ts          # 工作流入口
│   │   │   ├── nodes/
│   │   │   │   ├── search.ts     # 搜索节点
│   │   │   │   ├── browse.ts     # 浏览节点
│   │   │   │   └── summarize.ts  # 总结节点
│   │   │   └── state.ts          # 状态定义
│   │   ├── tools/
│   │   │   ├── search.ts         # 搜索工具
│   │   │   └── browser.ts        # 浏览器工具
│   │   └── prompts/
│   │       └── system.md        # 系统提示词
│   │
│   ├── lib/                       # 工具函数
│   │   ├── llm.ts                # LLM 调用封装
│   │   ├── logger.ts             # 日志工具
│   │   └── validators.ts         # 数据校验
│   │
│   ├── types/                     # TypeScript 类型
│   │   ├── agent.ts              # Agent 类型定义
│   │   ├── api.ts                # API 类型定义
│   │   └── index.ts              # 统一导出
│   │
│   └── styles/                    # 样式文件
│       └── globals.css           # 全局样式
│
├── tests/                         # 测试文件
│   ├── unit/                     # 单元测试
│   │   ├── agents/
│   │   │   └── workflow.test.ts
│   │   └── tools/
│   │       └── search.test.ts
│   └── e2e/                      # 端到端测试
│       └── research.test.ts
│
├── playwright/                    # Playwright 配置
│   ├── config.ts
│   └── tests/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── next.config.js
├── .env.example                   # 环境变量示例
├── .eslintrc.js                   # ESLint 配置
├── .prettierrc                    # Prettier 配置
└── README.md
```

### 4.3 核心架构设计

#### 4.3.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      React SPA (Vite)                        │   │
│  │  ┌───────────┐  ┌────────────────┐  ┌─────────────────┐    │   │
│  │  │  ChatInput │  │  StreamOutput  │  │   HistoryList   │    │   │
│  │  │  (输入框)  │  │   (流式输出)   │  │    (历史记录)   │    │   │
│  │  └───────────┘  └────────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ HTTP / SSE
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Backend Layer                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Next.js API Routes                        │   │
│  │  ┌───────────────────┐  ┌───────────────────────────────────┐ │   │
│  │  │  POST /api/research  │  │  GET /api/research/stream       │ │   │
│  │  │  (创建研究任务)     │  │  (SSE 流式返回)                  │ │   │
│  │  └───────────────────┘  └───────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                LangGraph Workflow (Stateful)                │   │
│  │                                                              │   │
│  │    ┌─────────┐    ┌─────────┐    ┌─────────────┐          │   │
│  │    │  INPUT  │───▶│ SEARCH  │───▶│   BROWSE    │───▶...   │   │
│  │    │  Node   │    │  Node   │    │    Node     │          │   │
│  │    └─────────┘    └─────────┘    └─────────────┘          │   │
│  │                       │                 │                     │   │
│  │                       ▼                 ▼                     │   │
│  │              ┌────────────────┐  ┌─────────────┐              │   │
│  │              │ LangChain LLM  │  │  Playwright │              │   │
│  │              │    Tools      │  │   Browser   │              │   │
│  │              └────────────────┘  └─────────────┘              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        External Services                            │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  MiniMax LLM    │  │ Bing Search API │  │  Target Webs    │   │
│  │  (内容生成)      │  │   (搜索服务)     │  │   (数据来源)    │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

#### 4.3.2 LangGraph 工作流状态机

```typescript
// ResearchState - 工作流状态定义
interface ResearchState {
  // 输入
  topic: string;              // 用户研究主题
  
  // 中间状态
  searchQuery: string;       // 实际搜索查询词
  searchResults: string[];   // 搜索返回的 URLs
  visitedUrls: string[];    // 已访问的 URLs
  visitedContent: string[];  // 已提取的内容
  extractedInfo: ExtractedInfo[]; // 提取的关键信息
  
  // 输出
  report: string;            // 最终报告
  messages: Message[];       // 消息历史
  
  // 元数据
  step: 'idle' | 'searching' | 'browsing' | 'summarizing' | 'done' | 'error';
  error?: string;            // 错误信息
  startTime: number;        // 开始时间戳
}

// 工作流节点定义
const workflowNodes = {
  input: {
    name: "Input Node",
    description: "接收并解析用户输入",
    transitions: ["search"],
  },
  search: {
    name: "Search Node", 
    description: "调用搜索工具获取相关 URLs",
    transitions: ["browse", "error"],
  },
  browse: {
    name: "Browse Node",
    description: "逐个浏览网页并提取内容",
    transitions: ["summarize", "browse", "error"],
  },
  summarize: {
    name: "Summarize Node",
    description: "基于内容生成结构化报告",
    transitions: ["done"],
  },
};

// 边（条件跳转）
const conditionalEdges = {
  search: [
    { condition: "hasResults", target: "browse" },
    { condition: "noResults", target: "done" }, // 返回空报告提示
  ],
  browse: [
    { condition: "hasMoreUrls", target: "browse" }, // 继续浏览
    { condition: "allVisited", target: "summarize" }, // 完成浏览，开始总结
  ],
};
```

### 4.4 关键数据流

#### 4.4.1 用户请求完整流程

```
┌──────────────────────────────────────────────────────────────────────┐
│ Step 1: 用户输入                                                       │
│ "帮我研究 2026 年 AI Agent 的发展趋势"                                  │
└───────────────────────────────────────┬────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Step 2: 输入验证 & 解析                                                 │
│ - 检查输入长度（10-500 字符）                                           │
│ - 关键词提取："AI Agent"、"2026"、"发展趋势"                           │
│ - 生成优化搜索查询                                                     │
└───────────────────────────────────────┬────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Step 3: 搜索 (Search Node)                                             │
│ - 调用 Bing Search API                                                │
│ - 参数：q="AI Agent 发展趋势 2026"                                     │
│ - 返回：10 个相关 URLs，按相关度排序                                    │
└───────────────────────────────────────┬────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Step 4: URL 筛选 & 去重                                                │
│ - 去除重复 URL                                                         │
│ - 去除已知无效域名（广告链接、登录页等）                                  │
│ - 保留最多 5 个候选 URL                                                │
└───────────────────────────────────────┬────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Step 5: 网页浏览 (Browse Node) - 循环处理每个 URL                       │
│                                                                      │
│  For each url in candidateUrls:                                       │
│    1. Playwright 打开页面                                              │
│    2. 等待网络空闲（无请求超过 500ms）                                  │
│    3. 提取正文内容（article/main 标签或正文区域）                        │
│    4. 清洗内容（去广告、去导航）                                         │
│    5. 截断至 8000 tokens                                               │
│    6. 存储到 visitedContent[]                                          │
│                                                                      │
│  容错处理：                                                            │
│  - 超时（15s）：跳过并记录日志，继续下一个                              │
│  - 404/无内容：跳过并记录日志，继续下一个                                │
│  - 登录墙/付费内容：跳过并记录日志，继续下一个                           │
└───────────────────────────────────────┬────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Step 6: 内容总结 (Summarize Node)                                       │
│ - 构造 Prompt（系统提示词 + 收集的内容 + 用户主题）                     │
│ - 调用 MiniMax DeepSeek API                                           │
│ - Temperature: 0.7                                                    │
│ - 生成结构化报告（Markdown 格式）                                       │
└───────────────────────────────────────┬────────────────────────────────┘
                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Step 7: 流式返回 (SSE)                                                 │
│                                                                      │
│  data: {"type":"thinking","content":"正在搜索相关网页..."}              │
│  data: {"type":"searching","content":"找到 10 个相关结果"}              │
│  data: {"type":"browsing","content":"正在浏览第 1 个网页","progress":"1/5"}│
│  data: {"type":"browsing","content":"正在浏览第 2 个网页","progress":"2/5"}│
│  ...                                                                  │
│  data: {"type":"report","content":"# 研究报告..."}                     │
│  data: {"type":"done","content":"研究完成","stats":{"pages":5,"time":25}}│
└───────────────────────────────────────────────────────────────────────┘
```

### 4.5 工具定义

#### 4.5.1 工具列表

```typescript
// src/agents/tools/index.ts

import { z } from "zod";
import { webSearchTool } from "./search";
import { browseUrlTool } from "./browser";

// 工具注册表
export const availableTools = [
  {
    name: "web_search",
    description: "搜索互联网，返回与查询主题相关的网页链接列表",
    params: z.object({
      query: z.string().describe("搜索查询词"),
    }),
    handler: webSearchTool,
    returns: "string[]", // URLs 数组
    rateLimit: {
      maxPerMinute: 20,
      maxPerRequest: 1,
    },
  },
  {
    name: "browse_url",
    description: "浏览指定网页，提取并返回页面的主要内容文本",
    params: z.object({
      url: z.string().url().describe("目标网页 URL"),
    }),
    handler: browseUrlTool,
    returns: "string", // 页面纯文本内容
    rateLimit: {
      maxPerMinute: 30,
      maxPerRequest: 1,
    },
  },
] as const;

// 工具类型
export type ToolName = (typeof availableTools)[number]["name"];
```

#### 4.5.2 搜索工具实现

```typescript
// src/agents/tools/search.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { bingSearch } from "@/lib/search";

// 搜索工具
export const webSearchTool = new DynamicStructuredTool({
  name: "web_search",
  description: "搜索网页，返回相关链接列表。适用于：当你需要了解某个主题的最新信息、查找相关资源、或者确认某个观点时。",
  schema: z.object({
    query: z.string().describe("搜索查询词。建议包含主题关键词和限定词（如年份、类型等）。"),
  }),
  async execute(input: { query: string }): Promise<string[]> {
    try {
      const results = await bingSearch(input.query, { topK: 10 });
      return results.map((r) => r.url);
    } catch (error) {
      console.error("[Search Tool Error]", error);
      throw new Error(`搜索失败: ${error.message}`);
    }
  },
});
```

#### 4.5.3 浏览器工具实现

```typescript
// src/agents/tools/browser.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { browsePage } from "@/lib/playwright";

// 浏览器工具
export const browseUrlTool = new DynamicStructuredTool({
  name: "browse_url",
  description: "浏览指定网页，提取主要内容。返回页面的正文文本，可用于后续的信息提取和总结。",
  schema: z.object({
    url: z.string().url().describe("目标网页的完整 URL，必须以 http:// 或 https:// 开头"),
  }),
  async execute(input: { url: string }): Promise<string> {
    try {
      const content = await browsePage(input.url, {
        timeout: 15000,       // 15 秒超时
        maxTokens: 8000,      // 最多 8000 tokens
        waitForNetwork: true, // 等待网络空闲
      });
      return content;
    } catch (error) {
      console.error(`[Browse Tool Error] URL: ${input.url}`, error);
      throw new Error(`浏览失败: ${error.message}`);
    }
  },
});
```

---

## 5. API 设计

> 详细 API 规范见 `API.md`

### 5.1 接口概览

| 接口路径 | 方法 | 描述 | 认证 |
|---------|------|------|------|
| `/api/research` | POST | 创建研究任务 | - |
| `/api/research/stream` | GET | SSE 流式获取研究进度 | - |
| `/api/history` | GET | 获取历史记录列表 | - |
| `/api/history/:id` | DELETE | 删除指定历史记录 | - |

### 5.2 请求/响应格式

```typescript
// POST /api/research - 创建研究任务
interface CreateResearchRequest {
  topic: string;              // 研究主题（必填）
  maxResults?: number;         // 最大浏览网页数（默认 5）
  includeSources?: boolean;   // 报告中包含来源（默认 true）
}

interface CreateResearchResponse {
  taskId: string;              // 任务 ID
  createdAt: string;           // 创建时间 ISO 8601
}
```

---

## 6. 数据设计

### 6.1 数据模型

```typescript
// src/types/models.ts

// 研究任务
interface ResearchTask {
  id: string;                 // UUID
  topic: string;              // 研究主题
  status: TaskStatus;         // 任务状态
  config: TaskConfig;         // 任务配置
  result?: ResearchResult;    // 任务结果
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

interface TaskConfig {
  maxResults: number;          // 最大浏览数
  includeSources: boolean;    // 包含来源
  timeout: number;            // 超时时间（秒）
}

interface ResearchResult {
  report: string;             // 最终报告（Markdown）
  sources: Source[];          // 参考来源
  stats: TaskStats;            // 统计信息
}

interface Source {
  url: string;
  title?: string;
  accessedAt: Date;
  contentLength: number;
}

interface TaskStats {
  searchTime: number;          // 搜索耗时（ms）
  browseTime: number;         // 浏览耗时（ms）
  summarizeTime: number;      // 总结耗时（ms）
  totalTime: number;           // 总耗时（ms）
  pagesVisited: number;       // 访问页面数
  pagesSkipped: number;       // 跳过页面数
}
```

### 6.2 存储方案

| 数据类型 | 存储方式 | 说明 |
|---------|---------|------|
| 会话状态 | 内存/Redis | 临时存储，任务完成后清理 |
| 历史记录 | 本地文件/数据库 | 持久化存储，支持查询 |
| 用户配置 | LocalStorage | 浏览器本地存储 |

---

## 7. 错误处理

### 7.1 错误分类与处理策略

| 错误类型 | 场景 | 处理策略 | 用户可见性 |
|---------|------|---------|-----------|
| **搜索失败** | API 超时/不可用 | 重试 2 次，间隔 1s；仍失败则返回空结果并提示 | 是 |
| **网页不可达** | 404/网络错误 | 跳过该 URL，记录日志，继续下一个 | 静默 |
| **内容提取失败** | 页面结构异常 | 跳过并标记，计入 skipped 统计 | 静默 |
| **LLM 调用失败** | API 错误/限流 | 重试 1 次，仍失败则返回错误信息 | 是 |
| **任务超时** | 处理时间超过 60s | 中断任务，返回已收集的部分结果 | 是 |
| **输入无效** | 长度/格式不合规 | 拒绝请求，返回校验错误 | 是 |

### 7.2 错误响应格式

```typescript
// 统一错误响应格式
interface ErrorResponse {
  code: ErrorCode;           // 错误码
  message: string;           // 用户友好错误信息
  details?: string;          // 详细技术信息（调试用）
  retryable: boolean;         // 是否可重试
}

type ErrorCode = 
  | "INVALID_INPUT"           // 输入无效
  | "SEARCH_FAILED"           // 搜索失败
  | "BROWSE_FAILED"          // 浏览失败
  | "LLM_ERROR"              // LLM 调用错误
  | "TIMEOUT"                // 超时
  | "RATE_LIMITED"           // 限流
  | "INTERNAL_ERROR";        // 内部错误

// 示例
{
  "code": "SEARCH_FAILED",
  "message": "搜索服务暂时不可用，请稍后重试",
  "details": "Bing API returned 503 after 2 retries",
  "retryable": true
}
```

---

## 8. 性能指标

### 8.1 性能目标

| 指标 | 目标值 | 测量方法 | 告警阈值 |
|-----|-------|---------|---------|
| **响应时间** | | | |
| 冷启动时间 | < 3s | 首页加载到可交互 | > 5s |
| 搜索响应时间 | < 2s | 搜索 API 调用到返回结果 | > 5s |
| 单页面浏览时间 | < 5s | 页面加载到内容提取完成 | > 15s |
| 报告生成时间 | < 10s | 基于 5 个页面内容 | > 20s |
| 端到端研究时间 | < 30s | 用户提交到报告完成 | > 60s |
| **吞吐量** | | | |
| 最大并发请求 | 3 个 | 同时处理的活跃任务数 | - |
| 每分钟请求数 | < 20 | API 限流 | - |
| **可靠性** | | | |
| 搜索成功率 | > 95% | 成功搜索 / 总搜索次数 | < 90% |
| 页面提取成功率 | > 80% | 成功提取 / 总访问页面 | < 70% |
| 任务完成率 | > 90% | 完成任务 / 总任务数 | < 85% |

### 8.2 性能监控指标

```typescript
// 监控指标 key
const METRICS = {
  // 计数器
  REQUEST_COUNT: "researchbot_requests_total",
  REQUEST_SUCCESS: "researchbot_requests_success",
  REQUEST_FAILED: "researchbot_requests_failed",
  
  // 延迟直方图
  SEARCH_LATENCY: "researchbot_search_latency_ms",
  BROWSE_LATENCY: "researchbot_browse_latency_ms",
  SUMMARIZE_LATENCY: "researchbot_summarize_latency_ms",
  TOTAL_LATENCY: "researchbot_total_latency_ms",
  
  // Gauge
  ACTIVE_REQUESTS: "researchbot_active_requests",
  SUCCESS_RATE: "researchbot_success_rate",
} as const;
```

---

## 9. 非功能需求

### 9.1 安全性

| 需求项 | 描述 | 实现方式 |
|-------|------|---------|
| **密钥安全** | API Key 不能暴露在前端 | 存储在环境变量，后端封装调用 |
| **输入过滤** | 防止恶意输入 | 输入长度限制、特殊字符过滤 |
| **资源限制** | 防止资源耗尽攻击 | 单次请求浏览页面数限制（≤5） |
| **超时保护** | 防止长时占用资源 | 60s 强制超时 |
| **CORS** | 限制跨域访问 | 明确配置允许的源 |

### 9.2 可用性

| 需求项 | 描述 | 实现方式 |
|-------|------|---------|
| **加载状态** | 操作进行中提供反馈 | 骨架屏 + 流式进度展示 |
| **错误处理** | 异常情况友好提示 | 统一的错误组件，显示原因和重试选项 |
| **移动端适配** | 基本移动端可用 | 响应式布局，移动端优先测试 |
| **无障碍** | 支持屏幕阅读器 | 语义化 HTML、ARIA 标签 |

### 9.3 可扩展性

| 需求项 | 描述 | 实现方式 |
|-------|------|---------|
| **Tool 插件机制** | 便于添加新工具 | LangChain Tool 接口标准化 |
| **多 LLM 支持** | 支持切换模型 | LLM Client 抽象接口 |
| **工作流定制** | 便于调整处理流程 | LangGraph 状态机配置化 |

---

## 10. 项目组织

### 10.1 开发团队角色

| 角色 | 职责 | 人数建议 |
|-----|------|---------|
| 产品经理 | 需求分析、PRD 撰写、优先级排序 | 1 |
| 前端开发 | React UI、流式输出、用户交互 | 1 |
| 后端开发 | LangGraph 工作流、API 实现 | 1 |
| 全栈/AI工程师 | 工具开发、LLM 集成、性能优化 | 1 |
| 测试工程师 | 自动化测试、质量保障 | 0.5（兼任） |

### 10.2 开发流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Sprint Cycle (1 周)                         │
│                                                                     │
│  Day 1 (Mon)          │ Day 2-4               │ Day 5 (Fri)       │
│  ────────────────────  │  ─────────────────────  │  ─────────────── │
│  Sprint Planning      │  Development           │  Testing & Review │
│  - 回顾上周           │  - Daily Stand-up     │  - Code Review     │
│  - 确定本周 Sprint   │  - 编码实现            │  - Bug Fix        │
│  - 任务分配           │  - 单元测试            │  - Demo           │
│                       │                        │  - Retrospective  │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.3 代码管理规范

| 规范项 | 说明 |
|-------|------|
| **分支策略** | GitFlow：main / develop / feature/* / fix/* |
| **Commit 规范** | Conventional Commits：feat: / fix: / docs: / refactor: |
| **PR 要求** | 至少 1 人 Review，通过 CI 测试 |
| **代码风格** | ESLint + Prettier，CI 强制检查 |
| **测试覆盖** | 核心逻辑 > 80%，关键路径全覆盖 |

---

## 11. 成功标准

### 11.1 MVP 验收条件

| 验收项 | 验收标准 | 测试方法 |
|-------|---------|---------|
| **功能验收** | | |
| 基础流程 | 用户输入一句话，Agent 完成搜索→浏览→总结全流程 | E2E 测试 |
| 流式输出 | 用户实时看到 Agent 处理进度 | 手动测试 |
| 报告质量 | 报告包含信息来源，无明显错误 | 人工审核 |
| 错误处理 | 各异常场景有友好提示和重试机制 | 异常测试 |
| **性能验收** | | |
| 响应时间 | 端到端 < 30s（5 个页面） | 性能测试 |
| 并发能力 | 支持 3 个并发请求不崩溃 | 压力测试 |
| **体验验收** | | |
| 移动端 | 主流手机可正常使用 | 真机测试 |
| 无障碍 | VoiceOver/NVDA 可读 | 辅助测试 |

### 11.2 完成 Definition of Done

> 每一个功能/修复必须满足以下标准才能标记为完成：

- [ ] 代码已合并到 develop 分支
- [ ] 代码通过 ESLint + Prettier 检查
- [ ] 单元测试覆盖率 > 80%
- [ ] 功能测试通过
- [ ] 性能测试通过
- [ ] Code Review 通过
- [ ] 文档已更新（如有 API 变更）
- [ ] 产品经理验收通过

---

## 12. 里程碑

> 详细里程碑规划见 `MileStone.md`

| 阶段 | 主要交付物 | 目标时间 |
|-----|-----------|---------|
| **M0: 启动** | 项目初始化、需求确认、技术方案 | Day 0 |
| **M1: 基础框架** | 项目结构、LangChain LLM 集成 | Day 1 |
| **M2: 工具开发** | 搜索工具、浏览器工具 | Day 2 |
| **M3: 工作流整合** | LangGraph 工作流串联 | Day 3 |
| **M4: 前端开发** | UI 界面、流式输出 | Day 4 |
| **M5: 集成测试** | 端到端测试、Bug 修复 | Day 5 |
| **M6: 优化上线** | 性能优化、部署上线 | Day 6-7 |

---

## 13. 风险与缓解

### 13.1 风险识别

| 风险 ID | 风险描述 | 影响 | 概率 | 优先级 |
|--------|---------|------|------|--------|
| R1 | 搜索 API 限流/不可用 | 高 | 中 | P0 |
| R2 | 部分网页无法访问（登录墙、反爬） | 中 | 高 | P1 |
| R3 | LLM 生成内容质量不稳定 | 中 | 中 | P1 |
| R4 | 移动端体验不佳 | 低 | 中 | P2 |
| R5 | Vercel 冷启动过慢 | 中 | 低 | P2 |

### 13.2 缓解措施

| 风险 ID | 缓解措施 | 负责人 | 状态 |
|--------|---------|-------|------|
| R1 | 准备多个搜索 API（Bing/Brave），自动降级 | 后端 | 待实施 |
| R2 | 跳过不可达页面，记录日志，继续处理 | 后端 | 已在设计中 |
| R3 | Prompt 优化 + 人工审核样例输出 | AI工程师 | 待实施 |
| R4 | 移动端优先测试，及时修复布局问题 | 前端 | 待实施 |
| R5 | Vercel Pro 套餐 + 预热机制 | DevOps | 待评估 |

---

## 14. 附录

### 附录 A: 系统提示词模板

```markdown
你是一个专业的研究助手，负责帮助用户快速了解某个主题的相关信息。

## 你的工作流程
1. 理解用户的研究主题
2. 基于提供的网页内容进行分析
3. 生成结构化、有据可查的研究报告

## 报告要求
- 基于事实，不编造信息
- 每项内容注明来源
- 使用中立、专业的语言
- 优先选择权威来源的信息

## 输出格式
请按以下结构输出报告：
1. 概述（2-3 句话）
2. 主要发现（按主题分类）
3. 关键数据/事实
4. 专家观点/引用
5. 参考来源
6. 结论

## 注意事项
- 如果某部分没有足够信息，明确说明"根据提供的内容，无法得出明确结论"
- 不要编造网页中未提供的信息
- 保持客观，避免主观评价
```

### 附录 B: 环境变量说明

```bash
# .env.example

# LLM 配置
MINIMAX_API_KEY=your_minimax_api_key
LLM_MODEL=deepseek-chat
LLM_TEMPERATURE=0.7

# 搜索配置
BING_API_KEY=your_bing_api_key    # 可选
BRAVE_API_KEY=your_brave_api_key  # 备选

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
MAX_BROWSE_PAGES=5
REQUEST_TIMEOUT=60000

# 日志配置
LOG_LEVEL=info
```

### 附录 C: 参考资料

| 资料 | 链接 |
|-----|------|
| LangGraph.js 官方文档 | https://langchain-ai.github.io/langgraphjs/ |
| Playwright 官方文档 | https://playwright.dev/ |
| Next.js 官方文档 | https://nextjs.org/docs |
| MiniMax API 文档 | https://www.minimaxi.com/developer |

---

**Document Change Log:**

| 版本 | 日期 | 作者 | 变更内容 |
|-----|------|------|---------|
| 1.0 | 2026-05-29 | Product Team | 初始版本 |