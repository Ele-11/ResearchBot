# AGENTS.md

> **项目：** ResearchBot — AI 研究助手（用户输入主题 → 自动搜索 → 浏览网页 → 生成结构化报告 → 流式输出）
>
> **架构：** Monorepo（pnpm workspace）

---

## 项目结构

```
ResearchBot/
├── apps/                      # 应用包
│   ├── web/                   # React 前端 (Vite + React 18 + TypeScript)
│   └── server/                # Node.js 后端 API 服务
│
├── shared/                    # 共享类型库（各包共用）
│
├── tools/                     # 工具包
│   └── langchain-tools/       # LangChain 工具定义
│
├── package.json               # 根 package.json
├── pnpm-workspace.yaml        # 工作区配置
├── tsconfig.base.json         # 基础 TypeScript 配置
└── .env.example               # 环境变量模板
```

---

## 包结构详解

### apps/web — React 前端

```
apps/web/
├── public/                    # 静态资源（favicon 等）
├── src/
│   ├── api/                  # API 客户端
│   │   └── research.ts       # 研究主题 API 调用
│   │
│   ├── components/           # React 组件
│   │   ├── features/         # 业务组件（ChatInput, StreamOutput）
│   │   │   ├── ChatInput.tsx
│   │   │   ├── StreamOutput.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── ui/               # 基础 UI 组件（Button, Card, Input）
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                # 自定义 React Hooks
│   │   └── useResearch.ts    # 研究状态管理
│   │
│   ├── pages/                # 页面组件
│   │   └── HomePage.tsx
│   │
│   ├── routes/               # 路由定义
│   │   └── index.ts          # AppRoutes 组件
│   │
│   ├── store/                # 状态管理（预留）
│   │
│   ├── styles/               # 全局样式
│   │   └── globals.css
│   │
│   ├── types/                # 前端类型定义
│   │   └── stream.ts         # SSE 事件类型
│   │
│   ├── utils/                # 工具函数（预留）
│   │
│   ├── App.tsx               # 应用根组件
│   └── main.tsx               # 入口文件
│
├── package.json
├── tsconfig.json
├── tsconfig.build.json       # 构建配置
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.mjs
```

**技术栈：** Vite + React 18 + TypeScript + React Router + Tailwind CSS

**启动：** `pnpm --filter @researchbot/web dev`（端口 3000）

---

### apps/server — Node.js 后端

```
apps/server/
├── src/
│   ├── config/               # 配置管理
│   │   └── index.ts          # 环境变量配置（MiniMax、端口等）
│   │
│   ├── middleware/           # HTTP 中间件
│   │   └── ResponseHelper.ts # 响应辅助类
│   │
│   ├── routes/               # API 路由
│   │   ├── research.ts        # 研究 API 处理器
│   │   └── index.ts
│   │
│   ├── services/             # 业务逻辑层
│   │   ├── MiniMaxService.ts  # MiniMax LLM 调用
│   │   ├── ReportService.ts   # 报告保存
│   │   └── index.ts
│   │
│   ├── types/                # 类型定义
│   │   └── index.ts
│   │
│   ├── utils/                # 工具函数
│   │   └── index.ts          # parseBody, sendSSE 等
│   │
│   ├── app.ts                # 应用工厂（createServer）
│   └── index.ts              # 入口文件
│
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

**技术栈：** Node.js + http + dotenv + MiniMax API

**启动：** `pnpm --filter @researchbot/server dev`（端口 3001）

---

### shared — 共享类型库

```
shared/
├── src/
│   ├── search/               # Bing Search 客户端
│   │   ├── types.ts          # SearchResult, SearchConfig 等
│   │   ├── client.ts         # createBingSearchClient
│   │   └── index.ts
│   │
│   └── llm/                  # LLM 客户端（共享）
│       ├── types.ts          # LLMConfig, ChatMessage 等
│       ├── client.ts         # createLLMClient
│       └── index.ts
│
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

**用途：** 被 `apps/web`、`apps/server`、`tools/langchain-tools` 共用

---

### tools/langchain-tools — LangChain 工具

```
tools/langchain-tools/
├── src/
│   ├── base/                 # 基础工具类
│   │   ├── index.ts          # BaseResearchTool 抽象类
│   │   └── types.ts          # ToolMetadata 接口
│   │
│   ├── registry/             # 工具注册表
│   │   └── index.ts          # ToolRegistry 类
│   │
│   ├── tools/                # 工具实现
│   │   ├── search.ts          # BingSearchTool
│   │   └── index.ts
│   │
│   └── index.ts              # 包导出
│
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

**依赖：** `@langchain/core`、`@researchbot/shared`

---

## 开发规范

### 文件创建规则

| 场景 | 规则 |
|------|------|
| 前端新增组件 | 放入 `apps/web/src/components/features/` 或 `apps/web/src/components/ui/` |
| 前端新增 API | 放入 `apps/web/src/api/` |
| 前端新增 Hook | 放入 `apps/web/src/hooks/` |
| 后端新增路由 | 放入 `apps/server/src/routes/` |
| 后端新增服务 | 放入 `apps/server/src/services/` |
| 共享类型/工具 | 放入 `shared/src/` 对应子目录 |
| LangChain 工具 | 放入 `tools/langchain-tools/src/tools/` |

### 命名规则

- **文件命名：** PascalCase（组件） / camelCase（其他）
- **目录命名：** camelCase
- **导出命名：** 组件用 PascalCase，函数用 camelCase

### 导入规则

```typescript
// 前端使用路径别名
import { ChatInput } from '@/components/features';
import { submitResearch } from '@/api';

// 后端使用相对路径
import { MiniMaxService } from '../services';
import { config } from '../config';
```

### 类型导出

```typescript
// types/index.ts 统一导出
export type { StreamEvent } from './stream';

// 使用时
import type { StreamEvent } from '@/types/stream';
```

---

## 启动命令

```bash
# 根目录安装依赖
pnpm install

# 开发（仅前端）
pnpm dev

# 开发（仅后端）
pnpm dev:server

# 开发（同时启动）
pnpm dev:all

# 构建所有包
pnpm build

# 构建单个包
pnpm --filter @researchbot/web build
pnpm --filter @researchbot/server build
pnpm --filter @researchbot/shared build
pnpm --filter @researchbot/langchain-tools build

# 类型检查
pnpm typecheck

# 代码格式化
pnpm format
```

---

## 验证规则

任务完成前必须验证：

```bash
pnpm typecheck   # 所有包类型检查
pnpm build       # 所有包构建成功
```

---

## 提交规范

```
feat: 新功能
fix: 修复 Bug
refactor: 重构
test: 测试
chore: 构建/工具
docs: 文档
```

---

## 注意事项

1. **不要**在根目录放置任何应用代码（src/、public/ 等）
2. **不要**在根目录放置各包的配置文件（vite.config.ts 等）
3. **每个包**必须有独立的 `package.json`、`tsconfig.json`
4. **共享代码**放在 `shared/`，不要在包之间复制代码
5. **环境变量**使用 `.env.example` 模板，不要提交 `.env`