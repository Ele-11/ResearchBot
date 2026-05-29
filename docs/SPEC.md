# ResearchBot - 功能规格说明书

> **Version:** 1.0
> **Status:** 审阅中
> **Last Updated:** 2026-05-29
> **Related Documents:** PRD.md, API.md, MileStone.md

---

## 1. 产品概述

**核心功能：** 用户输入研究主题 → AI 自动搜索 → 浏览网页 → 生成结构化报告 → 流式输出展示

**技术栈：** React + Vite + TypeScript | Next.js API Routes | LangGraph.js | MiniMax DeepSeek | Playwright | Vercel

**架构选择：** 单体架构（MVP 快速验证优先）

---

## 2. 功能模块

### F1: 自然语言输入
- 多行 textarea，10-500 字符
- Cmd/Ctrl+Enter 提交
- 字符计数实时显示

### F2: 搜索引擎调用
- 首选 Bing Search API
- 备选 Brave Search 自动降级
- 最多返回 10 个 URL

### F3: 网页自动浏览
- Playwright 抓取
- 按优先级提取正文（article > main > body）
- 去除 script/style/nav/header/footer

### F4: 内容总结生成
- MiniMax DeepSeek 模型
- 结构化报告格式
- 来源标注，无幻觉

### F5: 流式输出（SSE）
| 事件类型 | 字段 |
|---------|------|
| thinking | content |
| searching | content, resultsCount |
| browsing | content, url, progress |
| report | content |
| done | stats |
| error | code, message, retryable |
| ping | - |

### F6: 错误处理策略
| 错误类型 | 处理策略 |
|---------|---------|
| 搜索失败 | 重试 2 次 → 错误提示 |
| 页面浏览失败 | 跳过 → 继续下一个 |
| LLM 调用失败 | 重试 1 次 → 错误提示 |
| 任务超时 | 中断 → 返回部分结果 |

---

## 3. 项目结构

```
src/
├── app/
│   ├── api/
│   │   └── research/
│   │       ├── route.ts        # POST /api/research
│   │       └── stream/
│   │           └── route.ts    # SSE 流式输出
│   ├── page.tsx               # 首页
│   └── layout.tsx             # 布局
├── components/
│   ├── ChatInput.tsx          # 输入框
│   └── StreamOutput.tsx       # 流式输出
├── agents/
│   ├── workflow/
│   │   ├── index.ts           # 工作流入口
│   │   ├── state.ts          # 状态定义
│   │   └── nodes/            # 节点
│   └── tools/
│       ├── search.ts         # 搜索工具
│       └── browser.ts        # 浏览器工具
├── lib/
│   ├── llm.ts               # LLM 调用
│   ├── search.ts            # 搜索封装
│   └── playwright.ts       # Playwright 封装
└── types/
    ├── agent.ts
    └── api.ts
```

---

## 4. 数据流

```
用户输入主题
     ↓
POST /api/research → taskId + streamToken
     ↓
GET /api/research/stream → SSE 流
     ↓
LangGraph: search → browse → summarize
     ↓
SSE: thinking → searching → browsing → report → done
```

---

## 5. 测试要求

| 测试类型 | 覆盖率目标 | 执行频率 |
|---------|-----------|---------|
| 单元测试 | > 80% | 每次提交 |
| 集成测试 | 核心流程 | 每次 PR |
| E2E 测试 | 关键路径 | 发布前 |

**TDD 铁律：** RED（失败测试）→ GREEN（最小实现）→ REFACTOR

---

## 6. 性能目标

| 指标 | 目标 |
|-----|------|
| 冷启动 | < 3s |
| 端到端 | < 30s |
| 并发 | 3 个不崩溃 |

---

## 7. 后续迭代

| 版本 | 功能 |
|-----|------|
| V2 | 历史记录管理 |
| V2 | 多 Agent 协作 |
| V2 | PDF/Markdown 导出 |

---

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| 1.0 | 2026-05-29 | 初始版本（简化版） |