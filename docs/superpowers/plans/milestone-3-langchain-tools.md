# Milestone 3: LangChain 搜索工具集成

## 目标

将 BingSearchTool 集成到 ResearchAgent 中，实现：
1. 研究前先搜索相关信息
2. 基于搜索结果生成更准确的研究报告

## 技术方案

### 架构

```
用户输入 → ResearchAgent.research()
         ↓
    BingSearchTool.invoke(topic)  ← 先搜索
         ↓
    把搜索结果传给 MiniMax LLM  ← 再生成报告
         ↓
    流式返回报告
```

### 目录结构

```
apps/server/src/services/
├── MiniMaxService.ts     # MiniMax LLM 调用（保留）
├── ReportService.ts       # 报告保存服务
└── ResearchAgent.ts      # 新增：研究 Agent（使用工具）

tools/langchain-tools/src/
├── base/                  # 基础类
│   ├── index.ts           # BaseResearchTool
│   └── types.ts           # ToolMetadata
├── registry/             # 工具注册表
│   └── index.ts           # ToolRegistry
├── tools/                # 工具实现
│   ├── search.ts          # BingSearchTool
│   └── index.ts
└── index.ts               # 包导出
```

## 实现步骤

### Step 1: 创建 LangChain Tools 包

- [x] 定义 `BingSearchTool` 继承 `Tool`
- [x] 实现 `argsSchema`（zod schema）
- [x] 实现 `_call()` 方法调用 Bing Search API
- [x] 创建 `ToolRegistry` 管理工具

### Step 2: 创建 ResearchAgent

- [x] 在 `apps/server/src/services/ResearchAgent.ts` 中实现
- [x] Agent 使用 `createSearchTool()` 获取工具
- [x] 研究流程：
  1. 调用 `BingSearchTool.invoke(topic)` 搜索
  2. 将搜索结果作为上下文
  3. 调用 MiniMax LLM 生成报告

### Step 3: 集成到路由

- [x] 修改 `apps/server/src/routes/research.ts`
- [x] 使用 `ResearchAgent` 替代直接调用 `MiniMaxService`
- [x] SSE 流式返回搜索状态和报告

## 环境变量

```bash
# MiniMax API（必须）
MINIMAX_API_KEY=your_key

# Bing Search API（必须）
BING_SEARCH_API_KEY=your_key
```

## 验收标准

- [ ] ResearchAgent 成功调用 BingSearchTool
- [ ] 搜索结果作为上下文传给 LLM
- [ ] 最终报告包含引用来源
- [ ] SSE 流式输出正常工作
- [ ] `pnpm typecheck` 通过

## 交付物

| 文件 | 描述 |
|------|------|
| `tools/langchain-tools/src/tools/search.ts` | BingSearchTool 实现 |
| `tools/langchain-tools/src/registry/index.ts` | ToolRegistry |
| `apps/server/src/services/ResearchAgent.ts` | 研究 Agent |
| `apps/server/src/routes/research.ts` | 集成路由 |