# ResearchBot - 功能规格说明书

> **Version:** 1.0  
> **Status:** 审阅中  
> **Last Updated:** 2026-05-29  
> **Workflow:** superpowers-brainstorming  
> **Related Documents:** PRD.md, API.md, MileStone.md  

---

## 1. 概述

### 1.1 要构建什么

ResearchBot 是一个 AI 研究助手，能够根据用户输入的研究主题，自动完成"搜索→浏览网页→提取内容→生成结构化报告"的全流程，并通过流式输出实时展示处理进度。

### 1.2 核心目标

用户输入一句话 → AI 自动完成研究 → 获得结构化报告

---

## 2. 设计方案对比

### 2.1 方案 A：单体架构（推荐）

**架构描述：**
```
Frontend (React) → Next.js API Routes → LangGraph Workflow
                                                ↓
                                         LangChain LLM
                                         Playwright
```

**优点：**
- 部署简单（Vercel 单次部署）
- 开发速度快（MVP 优先）
- 前后端类型共享
- 调试方便（同一仓库）

**缺点：**
- 扩展性受限（复杂工作流时）
- LangGraph 与 Next.js 偶合
- 状态管理在内存中

**适用场景：** MVP 快速验证

---

### 2.2 方案 B：微服务架构

**架构描述：**
```
Frontend → Gateway → Agent Service + Browser Service
                              ↓
                        独立的消息队列
```

**优点：**
- 服务独立扩展
- 故障隔离
- 技术栈灵活

**缺点：**
- 部署复杂（多个服务）
- 运维成本高
- 服务间通信开销

**适用场景：** 生产级大规模应用

---

### 2.3 方案 C：无服务器函数链

**架构描述：**
```
Cloudflare Workers → 每个步骤独立函数 → 状态存储在 KV
```

**优点：**
- 按需付费
- 全球低延迟
- 免服务器管理

**缺点：**
- 函数调用延迟（冷启动）
- 调试困难
- Playwright 兼容性

**适用场景：** 低成本探索

---

### 2.4 推荐方案

**选择方案 A：单体架构**

**理由：**
1. MVP 阶段需要快速验证核心假设
2. Vercel 的 Next.js + Edge Functions 足够支持 3-5 个并发
3. LangGraph.js 已支持服务端状态管理
4. 团队规模小（2-4 人），运维成本需控制

---

## 3. 功能设计

### 3.1 F1: 自然语言输入

#### 3.1.1 用户故事

```
作为用户，我想要输入研究主题，以便告诉 Agent 我想研究什么
```

#### 3.1.2 交互设计

**方案 1：简单 textarea（推荐）**
- 一个多行输入框
- 字符计数实时显示
- Cmd/Ctrl+Enter 提交
- 简单明了，MVP 优先

**方案 2：结构化表单**
- 单独的研究主题输入框
- 可选的关键词标签输入
- 可选的时间范围选择
- 信息更丰富但增加复杂度

**决策：** 方案 1。MVP 聚焦核心流程，结构化输入在 V2 再考虑。

#### 3.1.3 验证规则

```typescript
// 最小化验证规则
const rules = {
  minLength: 10,      // 避免无意义搜索
  maxLength: 500,      // 防止溢出
  allowedChars: /^[\u4e00-\u9fa5a-zA-Z0-9\s,.!?;:'"（）()「」【】\[\]（）\-\/]+$/,
};
```

---

### 3.2 F2: 搜索引擎调用

#### 3.2.1 方案对比

| 方案 | 引擎 | 成本 | 质量 | 决策 |
|-----|------|------|------|------|
| A | Bing Search API | 付费 | 高 | 首选 |
| B | Brave Search | 免费 | 中 | 备选 |
| C | SerpAPI | 付费 | 高 | 不选（增加依赖） |

**决策：** 方案 A + B 双轨支持，自动降级

#### 3.2.2 搜索结果处理

```typescript
// 搜索结果处理流程
const processResults = (results: SearchResult[]) => {
  return results
    .filter(r => !isExcludedDomain(r.url))  // 去除无效域名
    .filter(r => !isLoginPage(r.url))       // 去除登录页
    .deduplicateBy('hostname')              // 同域名去重
    .slice(0, 10);                         // 最多 10 个
};
```

---

### 3.3 F3: 网页自动浏览

#### 3.3.1 方案对比

**方案 1：Playwright（推荐）**
- 成熟稳定，API 完善
- 支持 JavaScript 渲染
- 内容提取需配合 cheerio 或原生 DOM

**方案 2：Puppeteer**
- 仅 Node.js
- 无官方 Python 绑定（此项目不用 Python）

**方案 3：Fetch + Cheerio**
- 轻量，无法处理 JS 渲染
- 某些 SPA 页面无内容

**决策：** Playwright

#### 3.3.2 内容提取策略

```typescript
// 按优先级尝试选择器
const contentSelectors = [
  'article',           // 最优先
  'main',              // 语义化标签
  '[role="main"]',     // ARIA 区域
  '.content',          // 常见类名
  '#content',          // 常见 ID
  'body',              // 兜底
];

// 去除干扰元素
const excludeSelectors = [
  'script', 'style', 'nav', 'header', 'footer', 
  'aside', '.ad', '.sidebar', '.comment', 'iframe'
];
```

---

### 3.4 F4: 内容总结生成

#### 3.4.1 LLM 选择

| 方案 | 模型 | 成本 | 中文支持 | 决策 |
|-----|------|------|---------|------|
| A | MiniMax DeepSeek | 中 | 优 | 首选 |
| B | OpenAI GPT-4 | 高 | 优 | 备选 |
| C | 开源模型 | 低 | 中 | V2 考虑 |

**决策：** 方案 A

#### 3.4.2 Prompt 设计原则

1. **结构化输出**：强制要求固定报告格式
2. **来源标注**：每项内容必须注明来源
3. **诚实原则**：信息不足时明确说"无法得出结论"
4. **无幻觉**：禁止编造网页中未提供的信息

---

### 3.5 F5: 流式输出

#### 3.5.1 方案对比

| 方案 | 技术 | 复杂度 | 浏览器支持 | 决策 |
|-----|------|--------|-----------|------|
| A | SSE | 低 | 主流 | 首选 |
| B | WebSocket | 高 | 主流 | 备用 |
| C | Long Polling | 中 | 最好 | 不用 |

**决策：** 方案 A（SSE）

#### 3.5.2 事件类型设计

```typescript
type StreamEvent = 
  | { type: "thinking"; content: string }
  | { type: "searching"; content: string; count: number }
  | { type: "browsing"; content: string; url: string; progress: string }
  | { type: "report"; content: string }
  | { type: "done"; stats: Stats }
  | { type: "error"; message: string; retryable: boolean }
  | { type: "ping" };  // 保活心跳
```

---

### 3.6 F6: 错误处理策略

#### 3.6.1 错误分类

| 错误类型 | 处理策略 | 用户可见 |
|---------|---------|---------|
| 搜索失败 | 重试 2 次 → 错误提示 | 是 |
| 页面浏览失败 | 跳过 → 继续下一个 | 静默 |
| LLM 调用失败 | 重试 1 次 → 错误提示 | 是 |
| 任务超时 | 中断 → 返回部分结果 | 是 |
| 输入无效 | 阻止 → 错误提示 | 是 |

#### 3.6.2 错误码设计

```typescript
const ErrorCodes = {
  INVALID_INPUT: { retryable: false, userMessage: "输入内容不符合要求" },
  SEARCH_FAILED: { retryable: true, userMessage: "搜索服务暂时不可用，请稍后重试" },
  BROWSE_FAILED: { retryable: false, userMessage: "页面浏览失败，跳过" },
  LLM_ERROR: { retryable: true, userMessage: "报告生成失败，请点击重试" },
  TIMEOUT: { retryable: true, userMessage: "任务执行超时" },
  RATE_LIMITED: { retryable: true, userMessage: "请求过于频繁" },
  INTERNAL_ERROR: { retryable: true, userMessage: "系统内部错误" },
} as const;
```

---

## 4. 架构设计

### 4.1 技术栈

| 层级 | 技术选型 | 版本 | 说明 |
|-----|---------|------|------|
| 前端框架 | React + Vite | 18.x / 5.x | 快速热更新 |
| 前端语言 | TypeScript | 5.x | 类型安全 |
| 后端框架 | Next.js | 14.x | API Routes |
| Agent 框架 | LangGraph.js | latest | 工作流编排 |
| LLM | MiniMax | - | DeepSeek 模型 |
| 浏览器自动化 | Playwright | 1.40+ | 内容提取 |
| 部署 | Vercel | - | 边缘计算 |

### 4.2 项目目录结构

```
research-bot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── research/
│   │   │       ├── route.ts          # POST /api/research
│   │   │       └── stream/
│   │   │           └── route.ts      # GET /api/research/stream
│   │   ├── page.tsx                 # 首页
│   │   └── layout.tsx               # 布局
│   │
│   ├── components/
│   │   ├── ChatInput.tsx            # 输入框
│   │   ├── StreamOutput.tsx         # 流式输出
│   │   └── ui/                      # 基础组件
│   │
│   ├── agents/
│   │   ├── workflow/
│   │   │   ├── index.ts             # 工作流入口
│   │   │   ├── state.ts             # 状态定义
│   │   │   └── nodes/               # 节点定义
│   │   ├── tools/
│   │   │   ├── search.ts            # 搜索工具
│   │   │   └── browser.ts           # 浏览器工具
│   │   └── prompts/
│   │       └── summarize.md         # 总结提示词
│   │
│   ├── lib/
│   │   ├── llm.ts                   # LLM 调用
│   │   ├── search.ts                # 搜索封装
│   │   └── playwright.ts            # Playwright 封装
│   │
│   └── types/
│       ├── agent.ts                 # Agent 类型
│       └── api.ts                   # API 类型
│
├── tests/
│   ├── unit/
│   │   ├── agents/
│   │   │   └── workflow.test.ts
│   │   └── tools/
│   │       ├── search.test.ts
│   │       └── browser.test.ts
│   └── e2e/
│       └── research.test.ts
│
├── docs/
│   ├── PRD.md
│   ├── SPEC.md                      # 本文档
│   ├── API.md
│   └── MileStone.md
│
├── package.json
├── tsconfig.json
├── .env.example
└── .eslintrc.js
```

### 4.3 数据流

```
用户输入主题
     ↓
POST /api/research → 创建任务 → 返回 taskId
     ↓
GET /api/research/stream?taskId=xxx
     ↓
┌─────────────────────────────────────────────────────────────┐
│  LangGraph Workflow (Stateful)                              │
│                                                             │
│  search node ─→ browse node ─→ summarize node             │
│       ↓              ↓              ↓                       │
│  Bing API      Playwright     MiniMax API                  │
│       ↓              ↓              ↓                       │
│  [thinking]    [browsing]    [report chunk]                │
│       ↓              ↓              ↓                       │
│  SSE Stream ◀──────────────────────────────────────────     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 测试策略

### 5.1 TDD 强制要求

```
铁律：没有失败测试就不写生产代码
```

### 5.2 测试分层

| 测试类型 | 覆盖率目标 | 执行频率 |
|---------|-----------|---------|
| 单元测试 | > 80% | 每次提交 |
| 集成测试 | 核心流程 | 每次 PR |
| E2E 测试 | 关键路径 | 发布前 |

### 5.3 关键测试场景

```typescript
// 1. 搜索工具测试
describe("webSearchTool", () => {
  it("应该返回 URL 列表", async () => {
    const results = await webSearchTool.execute({ query: "AI Agent 发展趋势" });
    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
  });
});

// 2. 浏览器工具测试
describe("browseUrlTool", () => {
  it("应该提取页面正文内容", async () => {
    const content = await browseUrlTool.execute({ url: "https://example.com" });
    expect(content.length).toBeGreaterThan(100);
    expect(content).not.toContain("<script>");
  });
});

// 3. 输入验证测试
describe("CreateResearchSchema", () => {
  it("应该拒绝少于 10 字符的输入", () => {
    const result = CreateResearchSchema.safeParse({ topic: "AI" });
    expect(result.success).toBe(false);
  });
});
```

---

## 6. 验收标准

### 6.1 功能验收

| 功能 | 验收条件 | 测试方法 |
|-----|---------|---------|
| 自然语言输入 | 10-500 字符输入，按钮可用/禁用状态正确 | 手动测试 |
| 搜索功能 | 返回 1-10 个有效 URL | 单元测试 |
| 浏览功能 | 提取正文内容，去除干扰元素 | 单元测试 |
| 总结功能 | 生成结构化报告，包含来源 | 手动测试 |
| 流式输出 | 实时展示进度，报告增量渲染 | 手动测试 |
| 错误处理 | 异常场景友好提示，可重试 | 手动测试 |

### 6.2 性能验收

| 指标 | 目标值 |
|-----|-------|
| 冷启动 | < 3s |
| 搜索响应 | < 2s |
| 单页浏览 | < 5s |
| 报告生成 | < 10s |
| 端到端 | < 30s |
| 并发 | 3 个不崩溃 |

### 6.3 质量验收

| 指标 | 目标值 |
|-----|-------|
| 测试覆盖 | > 80% |
| 代码风格 | ESLint + Prettier 通过 |
| 移动端 | 响应式正常 |
| 无障碍 | 屏幕阅读器可读 |

---

## 7. 已知风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|-----|------|------|---------|
| 搜索 API 限流 | 高 | 中 | 双引擎自动降级 |
| 部分网页无法访问 | 中 | 高 | 跳过并记录日志 |
| LLM 生成质量不稳定 | 中 | 中 | Prompt 优化 + 人工审核 |
| 移动端体验不佳 | 低 | 中 | 移动端优先测试 |

---

## 8. 后续迭代方向

| 版本 | 功能 | 优先级 |
|-----|------|--------|
| V2 | 历史记录管理 | P1 |
| V2 | 多 Agent 协作 | P2 |
| V2 | PDF/Markdown 导出 | P2 |
| V2 | 用户认证 | P3 |

---

**Document Change Log:**

| 版本 | 日期 | 作者 | 变更内容 |
|-----|------|------|---------|
| 1.0 | 2026-05-29 | Product Team | 初始版本（按 superpowers 格式重写） |