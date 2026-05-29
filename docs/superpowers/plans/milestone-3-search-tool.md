# Milestone 3: 搜索工具

**分支:** `milestone/3-search-tool`  
**基于:** `origin/dev`

---

## 目标

实现 Bing Search API 封装和 LangChain Tool 接口，为 LangGraph 工作流提供搜索能力。

---

## 验收标准

- [ ] Bing Search API 封装正常工作
- [ ] 实现 LangChain Tool 接口（`SearchTool`）
- [ ] 单元测试通过
- [ ] `pnpm lint && pnpm typecheck && pnpm test` 全部通过

---

## 文件结构

```
src/lib/
├── search.ts          # Bing Search API 封装
├── types.ts           # 搜索相关类型定义

src/agents/tools/
├── search.ts          # LangChain Tool 实现

tests/lib/
├── search.test.ts     # 搜索 API 单元测试
```

---

## 工作步骤

### Step 1: 安装依赖

安装 Bing Search SDK 或使用 HTTP 请求封装：

```
pnpm add @langchain/community
```

### Step 2: 创建类型定义

在 `src/lib/types.ts` 中补充：

- `SearchResult` - 单条搜索结果
- `SearchResponse` - 搜索 API 响应
- `SearchConfig` - 搜索配置

### Step 3: 实现 Bing Search API 封装

创建 `src/lib/search.ts`：

- `createBingSearchClient()` - 创建 Bing Search 客户端
- `search(query, options?)` - 执行搜索，返回 URL 列表
- 环境变量 `BING_SEARCH_API_KEY` / `BING_SEARCH_ENDPOINT`

### Step 4: 实现 LangChain Tool

创建 `src/agents/tools/search.ts`：

- 实现 LangChain `Tool` 接口
- `name`: `"search"`
- `description`: `"Search for web URLs related to a query"`
- `call()` 方法调用 `search.ts`

### Step 5: 编写单元测试

创建 `tests/lib/search.test.ts`：

- Mock Bing Search API 响应
- 测试搜索结果解析
- 测试错误处理（API 失败、超时）

---

## 约束

- 使用 Bing Search API（备选 Brave Search 自动降级）
- API 密钥通过环境变量注入，不硬编码
- 最多返回 10 个 URL
- 不实现 LangGraph 工作流（Milestone 5）
- 不提前实现浏览器工具（Milestone 4）

---

## 提交记录

```
feat: milestone 3 - search tool with Bing Search API
```