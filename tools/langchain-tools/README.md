# @researchbot/langchain-tools

LangChain 工具包，提供可复用的 AI Agent 搜索工具。

## 安装

```bash
pnpm install @researchbot/langchain-tools
```

## 快速开始

### 1. 直接使用工具

```typescript
import { createSearchTool } from '@researchbot/langchain-tools';

// 创建搜索工具
const searchTool = createSearchTool();

// 调用工具
const results = await searchTool.invoke('AI research trends 2024');
console.log(results);
```

### 2. 使用工具注册表

```typescript
import { createSearchTool, ToolRegistry } from '@researchbot/langchain-tools';

const registry = new ToolRegistry();

// 注册工具
registry.register(createSearchTool(), {
  name: 'bing_search',
  description: 'Search for web URLs related to a query.',
  parameters: createSearchTool().argsSchema,
  category: 'search',
});

// 获取工具
const tool = registry.get('bing_search');
if (tool) {
  const results = await tool.invoke('deep learning healthcare');
}
```

### 3. 在 LangChain Agent 中使用

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { createSearchTool } from '@researchbot/langchain-tools';

const model = new ChatOpenAI({ model: 'MiniMax-M2' });
const tools = [createSearchTool()];

// 使用 agent 时传入 tools
// ...
```

## 工具列表

### bing_search

网络搜索工具，使用 Bing Search API。

**参数：**
| 参数 | 类型 | 描述 |
|------|------|------|
| query | string | 搜索关键词 |

**示例：**
```typescript
const results = await tool.invoke('最新 AI 研究动态');
// 返回格式：
// 1. Title
//    URL: https://...
//    Snippet description
```

## 目录结构

```
src/
├── base/           # 基础类
│   ├── index.ts     # BaseResearchTool 抽象类
│   └── types.ts     # ToolMetadata 接口
├── registry/        # 工具注册表
│   └── index.ts     # ToolRegistry 类
├── tools/           # 工具实现
│   ├── search.ts    # BingSearchTool
│   └── index.ts
└── index.ts          # 包导出
```

## 环境变量

需要设置以下环境变量：

```bash
BING_SEARCH_API_KEY=your_bing_api_key
```

## 开发

```bash
# 构建
pnpm build

# 类型检查
pnpm typecheck

# 测试
pnpm test
```