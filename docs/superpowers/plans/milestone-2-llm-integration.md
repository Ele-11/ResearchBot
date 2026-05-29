# Milestone 2: LLM 集成

**分支:** `milestone/2-llm-integration`
**基于:** `origin/dev`

---

## 目标

集成 MiniMax DeepSeek API，支持流式输出（streaming），为后续搜索结果总结提供基础。

---

## 验收标准

- [ ] MiniMax DeepSeek API 成功调用（非流式）
- [ ] 支持流式输出（streaming）
- [ ] 单元测试通过
- [ ] `pnpm lint && pnpm typecheck && pnpm test` 全部通过

---

## 文件结构

```
src/lib/
├── llm.ts          # LLM 调用封装（流式 + 非流式）
└── types.ts        # LLM 类型定义
```

---

## 工作步骤

### Step 1: 安装依赖

安装 LangChain 相关包：

```
pnpm add @langchain/core langchain
pnpm add @langchain/minimax
```

### Step 2: 创建类型定义

创建 `src/lib/types.ts`：

- `LLMConfig` - LLM 配置（model, temperature, apiKey 等）
- `StreamChunk` - 流式输出块类型

### Step 3: 创建 LLM 调用封装

创建 `src/lib/llm.ts`：

- `createLLM()` - 创建 LLM 实例（非流式）
- `createStreamingLLM()` - 创建流式 LLM 实例
- `streamToGenerator()` - 将流式输出转为异步生成器

### Step 4: 编写单元测试

创建 `tests/lib/llm.test.ts`：

- Mock MiniMax API 调用
- 测试流式输出解析
- 测试错误处理

### Step 5: 验证

```bash
pnpm lint
pnpm typecheck
pnpm test
```

---

## 约束

- 使用 MiniMax DeepSeek API（via @langchain/minimax）
- 不硬编码 API 密钥（使用环境变量 `MINIMAX_API_KEY`）
- 流式输出需兼容 SSE 格式
- 不实现 LangGraph 工作流（Milestone 5）

---

## 提交记录

```
feat: milestone 2 - LLM integration with streaming support
```