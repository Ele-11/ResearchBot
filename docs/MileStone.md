# ResearchBot - 实施计划

> **Version:** 1.0  
> **Status:** 审阅中  
> **Last Updated:** 2026-05-29  
> **Workflow:** superpowers-writing-plans  
> **Related Documents:** PRD.md, SPEC.md, API.md  

---

## 1. 计划概述

### 1.1 目标

在 7 天内完成 ResearchBot MVP 开发，实现核心功能：用户输入研究主题 → AI 自动搜索 → 浏览网页 → 生成结构化报告 → 流式输出展示。

### 1.2 架构

采用单体架构：
- Frontend: React + Vite + TypeScript
- Backend: Next.js API Routes
- Agent: LangGraph.js 工作流
- LLM: MiniMax DeepSeek
- 浏览器: Playwright
- 部署: Vercel

### 1.3 执行方式

**推荐：** 使用 `superpowers-subagent-driven-development`（子代理驱动开发）

将任务分配给独立子代理，每个代理负责：
1. 实现指定功能
2. 编写对应测试
3. 遵循 TDD 红-绿-重构循环
4. 代码审查

**备选：** 使用 `superpowers-executing-plans`（批量执行）

---

## 2. 任务分解

### 任务 1: 项目初始化

**文件：**
- 创建: `package.json`
- 创建: `tsconfig.json`
- 创建: `vite.config.ts`
- 创建: `next.config.js`
- 创建: `.eslintrc.js`
- 创建: `.prettierrc`
- 创建: `src/app/layout.tsx`
- 创建: `src/app/page.tsx`

---

- [ ] **步骤 1: 初始化 package.json**

```bash
npm init -y
npm install next@14 react@18 react-dom@18 typescript@5 vite@5 @vitejs/plugin-react typescript
npm install @types/react @types/react-dom @types/node
npm install eslint prettier eslint-config-prettier eslint-plugin-react
```

- [ ] **步骤 2: 配置 TypeScript**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **步骤 3: 配置 ESLint + Prettier**

```javascript
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-console': 'warn',
  },
};
```

- [ ] **步骤 4: 创建基础页面**

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

// src/app/page.tsx
export default function HomePage() {
  return <main>ResearchBot</main>;
}
```

- [ ] **步骤 5: 验证项目可运行**

```bash
npm run dev
# 期望：服务启动在 localhost:3000
# 访问 http://localhost:3000 显示 "ResearchBot"
```

- [ ] **步骤 6: 提交代码**

```bash
git add -A
git commit -m "chore: initialize Next.js project with TypeScript"
```

---

### 任务 2: LLM 集成

**文件：**
- 创建: `src/lib/llm.ts`
- 创建: `tests/unit/lib/llm.test.ts`

---

- [ ] **步骤 1: 安装 LangChain 依赖**

```bash
npm install @langchain/core @langchain/minimax
```

- [ ] **步骤 2: 编写失败测试**

```typescript
// tests/unit/lib/llm.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getLLM } from '@/lib/llm';

describe('getLLM', () => {
  it('应该返回 LLM 实例', () => {
    const llm = getLLM();
    expect(llm).toBeDefined();
  });

  it('应该支持流式输出', async () => {
    const llm = getLLM();
    const stream = await llm.stream('你好，请回复简单的话');
    const chunks: string[] = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk.content as string);
    }
    
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join('')).toBeTruthy();
  });
});
```

- [ ] **步骤 3: 运行测试验证失败**

```bash
npm test tests/unit/lib/llm.test.ts
# 期望：FAIL - "getLLM not defined"
```

- [ ] **步骤 4: 编写最小实现**

```typescript
// src/lib/llm.ts
import { ChatMinimax } from '@langchain/minimax';

export function getLLM() {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY is not set');
  }
  
  return new ChatMinimax({
    model: 'deepseek-chat',
    apiKey,
    temperature: 0.7,
  });
}
```

- [ ] **步骤 5: 运行测试验证通过**

```bash
npm test tests/unit/lib/llm.test.ts
# 期望：PASS
```

- [ ] **步骤 6: 提交代码**

```bash
git add src/lib/llm.ts tests/unit/lib/llm.test.ts
git commit -m "feat: integrate MiniMax LLM with streaming support"
```

---

### 任务 3: 搜索工具

**文件：**
- 创建: `src/lib/search.ts`
- 创建: `src/agents/tools/search.ts`
- 创建: `tests/unit/lib/search.test.ts`
- 创建: `tests/unit/agents/tools/search.test.ts`

---

- [ ] **步骤 1: 安装搜索相关依赖**

```bash
npm install @langchain/core
npm install axios  # 用于调用 Bing API
npm install @types/axios
```

- [ ] **步骤 2: 编写失败测试（搜索封装）**

```typescript
// tests/unit/lib/search.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bingSearch } from '@/lib/search';

// Mock axios
vi.mock('axios');

describe('bingSearch', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('应该返回 URL 列表', async () => {
    const mockResponse = {
      webPages: {
        value: [
          { url: 'https://example.com/1', name: 'Example 1' },
          { url: 'https://example.com/2', name: 'Example 2' },
        ],
      },
    };
    
    vi.doMock('axios', () => ({
      default: {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
      },
    }));
    
    const results = await bingSearch('test query', { topK: 10 });
    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBe(2);
  });

  it('应该处理空结果', async () => {
    const mockResponse = { webPages: { value: [] } };
    vi.doMock('axios', () => ({
      default: {
        get: vi.fn().mockResolvedValue({ data: mockResponse }),
      },
    }));
    
    const results = await bingSearch('test query');
    expect(results).toEqual([]);
  });
});
```

- [ ] **步骤 3: 运行测试验证失败**

```bash
npm test tests/unit/lib/search.test.ts
# 期望：FAIL - "bingSearch not defined"
```

- [ ] **步骤 4: 编写最小实现**

```typescript
// src/lib/search.ts
import axios from 'axios';

export interface SearchResult {
  url: string;
  title: string;
  snippet?: string;
}

export interface SearchOptions {
  topK?: number;
  language?: string;
}

export async function bingSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const apiKey = process.env.BING_API_KEY;
  
  if (!apiKey) {
    throw new Error('BING_API_KEY is not set');
  }
  
  const { topK = 10, language = 'zh-CN' } = options;
  
  const response = await axios.get(
    'https://api.bing.microsoft.com/v7.0/search',
    {
      params: {
        q: query,
        count: topK,
        setLang: language,
      },
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    }
  );
  
  return response.data.webPages.value.map((item: any) => ({
    url: item.url,
    title: item.name,
    snippet: item.snippet,
  }));
}
```

- [ ] **步骤 5: 编写失败测试（搜索工具）**

```typescript
// tests/unit/agents/tools/search.test.ts
import { describe, it, expect } from 'vitest';
import { webSearchTool } from '@/agents/tools/search';

describe('webSearchTool', () => {
  it('应该返回 URL 数组', async () => {
    const results = await webSearchTool.execute({ query: 'AI Agent 发展趋势' });
    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatch(/^https?:\/\//);
  });
});
```

- [ ] **步骤 6: 编写搜索工具实现**

```typescript
// src/agents/tools/search.ts
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { bingSearch } from '@/lib/search';

export const webSearchTool = new DynamicStructuredTool({
  name: 'web_search',
  description: '搜索网页，返回相关链接列表',
  schema: z.object({
    query: z.string().describe('搜索查询词'),
  }),
  async execute(input: { query: string }) {
    try {
      const results = await bingSearch(input.query, { topK: 10 });
      return results.map((r) => r.url);
    } catch (error) {
      console.error('[Search Tool Error]', error);
      throw new Error(`搜索失败: ${error.message}`);
    }
  },
});
```

- [ ] **步骤 7: 运行测试验证通过**

```bash
npm test tests/unit/lib/search.test.ts tests/unit/agents/tools/search.test.ts
# 期望：PASS
```

- [ ] **步骤 8: 提交代码**

```bash
git add src/lib/search.ts src/agents/tools/search.ts tests/
git commit -m "feat: implement Bing search tool with LangChain integration"
```

---

### 任务 4: 浏览器工具

**文件：**
- 创建: `src/lib/playwright.ts`
- 创建: `src/agents/tools/browser.ts`
- 创建: `tests/unit/lib/playwright.test.ts`
- 创建: `tests/unit/agents/tools/browser.test.ts`

---

- [ ] **步骤 1: 安装 Playwright**

```bash
npm install playwright
npx playwright install chromium
```

- [ ] **步骤 2: 编写失败测试**

```typescript
// tests/unit/lib/playwright.test.ts
import { describe, it, expect } from 'vitest';
import { browsePage } from '@/lib/playwright';

describe('browsePage', () => {
  it('应该提取页面正文内容', async () => {
    const content = await browsePage('https://example.com');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(100);
  });

  it('应该去除脚本和样式', async () => {
    const content = await browsePage('https://example.com');
    expect(content).not.toContain('<script>');
    expect(content).not.toContain('<style>');
  });

  it('应该在超时时抛出错误', async () => {
    await expect(
      browsePage('https://example.com', { timeout: 1 })
    ).rejects.toThrow();
  });
});
```

- [ ] **步骤 3: 运行测试验证失败**

```bash
npm test tests/unit/lib/playwright.test.ts
# 期望：FAIL - "browsePage not defined"
```

- [ ] **步骤 4: 编写最小实现**

```typescript
// src/lib/playwright.ts
import { chromium, Browser, Page } from 'playwright';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export interface BrowseOptions {
  timeout?: number;
  maxTokens?: number;
}

export async function browsePage(
  url: string,
  options: BrowseOptions = {}
): Promise<string> {
  const { timeout = 15000, maxTokens = 8000 } = options;
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { timeout, waitUntil: 'networkidle' });
    
    // 按优先级尝试内容选择器
    const content = await page.evaluate(() => {
      const selectors = ['article', 'main', '[role="main"]', '.content', '#content'];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent || '';
        }
      }
      
      return document.body.textContent || '';
    });
    
    // 去除多余空白并截断
    const cleaned = content
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxTokens * 4); // 约 4 字符/token
    
    return cleaned;
  } finally {
    await page.close();
  }
}
```

- [ ] **步骤 5: 编写浏览器工具**

```typescript
// src/agents/tools/browser.ts
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { browsePage } from '@/lib/playwright';

export const browseUrlTool = new DynamicStructuredTool({
  name: 'browse_url',
  description: '浏览指定网页，提取主要内容',
  schema: z.object({
    url: z.string().url().describe('目标网页 URL'),
  }),
  async execute(input: { url: string }) {
    try {
      const content = await browsePage(input.url, {
        timeout: 15000,
        maxTokens: 8000,
      });
      return content;
    } catch (error) {
      console.error(`[Browse Tool Error] URL: ${input.url}`, error);
      throw new Error(`浏览失败: ${error.message}`);
    }
  },
});
```

- [ ] **步骤 6: 运行测试验证通过**

```bash
npm test tests/unit/lib/playwright.test.ts
# 期望：PASS
```

- [ ] **步骤 7: 提交代码**

```bash
git add src/lib/playwright.ts src/agents/tools/browser.ts tests/
git commit -m "feat: implement Playwright browser tool for content extraction"
```

---

### 任务 5: LangGraph 工作流

**文件：**
- 创建: `src/agents/workflow/state.ts`
- 创建: `src/agents/workflow/nodes/search.ts`
- 创建: `src/agents/workflow/nodes/browse.ts`
- 创建: `src/agents/workflow/nodes/summarize.ts`
- 创建: `src/agents/workflow/index.ts`
- 创建: `tests/unit/agents/workflow/workflow.test.ts`

---

- [ ] **步骤 1: 安装 LangGraph**

```bash
npm install langgraph
```

- [ ] **步骤 2: 定义状态类型**

```typescript
// src/agents/workflow/state.ts
import { Annotation } from '@langchain/langgraph';

export interface ResearchState {
  topic: string;
  searchQuery: string;
  searchResults: string[];
  visitedContent: string[];
  report: string;
  messages: Array<{ role: string; content: string }>;
  step: 'idle' | 'searching' | 'browsing' | 'summarizing' | 'done' | 'error';
  error?: string;
}

export const StateAnnotation = Annotation.Root<ResearchState>({
  topic: {
    type: 'string',
    default: () => '',
  },
  searchQuery: {
    type: 'string',
    default: () => '',
  },
  searchResults: {
    type: 'array',
    default: () => [],
  },
  visitedContent: {
    type: 'array',
    default: () => [],
  },
  report: {
    type: 'string',
    default: () => '',
  },
  messages: {
    type: 'array',
    default: () => [],
  },
  step: {
    type: 'string',
    default: () => 'idle',
  },
  error: {
    type: 'string',
  },
});
```

- [ ] **步骤 3: 编写失败测试**

```typescript
// tests/unit/agents/workflow/workflow.test.ts
import { describe, it, expect } from 'vitest';
import { createResearchWorkflow } from '@/agents/workflow';

describe('Research Workflow', () => {
  it('应该创建工作流实例', () => {
    const workflow = createResearchWorkflow();
    expect(workflow).toBeDefined();
  });

  it('应该返回初始状态', () => {
    const workflow = createResearchWorkflow();
    const initialState = workflow.getInputSchema();
    expect(initialState).toBeDefined();
  });
});
```

- [ ] **步骤 4: 实现工作流**

```typescript
// src/agents/workflow/index.ts
import { StateGraph } from '@langchain/langgraph';
import { StateAnnotation, ResearchState } from './state';
import { searchNode } from './nodes/search';
import { browseNode } from './nodes/browse';
import { summarizeNode } from './nodes/summarize';

export function createResearchWorkflow() {
  const workflow = new StateGraph(StateAnnotation)
    .addNode('search', searchNode)
    .addNode('browse', browseNode)
    .addNode('summarize', summarizeNode)
    .addEdge('__root__', 'search')
    .addEdge('search', 'browse')
    .addEdge('browse', 'summarize')
    .addEdge('summarize', '__end__')
    .compile();
  
  return workflow;
}
```

- [ ] **步骤 5: 实现各节点**

```typescript
// src/agents/workflow/nodes/search.ts
import { NodeValue } from '@langchain/langgraph';
import { StateAnnotation } from '../state';
import { webSearchTool } from '../tools/search';

export const searchNode: NodeValue = async (state: typeof StateAnnotation.State) => {
  try {
    const urls = await webSearchTool.execute({ query: state.searchQuery || state.topic });
    return {
      searchResults: urls,
      step: 'searching',
    };
  } catch (error) {
    return {
      step: 'error',
      error: `搜索失败: ${error.message}`,
    };
  }
};
```

```typescript
// src/agents/workflow/nodes/browse.ts
import { NodeValue } from '@langchain/langgraph';
import { StateAnnotation } from '../state';
import { browseUrlTool } from '../tools/browser';

export const browseNode: NodeValue = async (state: typeof StateAnnotation.State) => {
  const contents: string[] = [];
  const maxPages = Math.min(state.searchResults.length, 5);
  
  for (const url of state.searchResults.slice(0, maxPages)) {
    try {
      const content = await browseUrlTool.execute({ url });
      contents.push(content);
    } catch (error) {
      // 跳过失败的页面，继续下一个
      console.warn(`跳过页面 ${url}: ${error.message}`);
    }
  }
  
  return {
    visitedContent: contents,
    step: 'browsing',
  };
};
```

```typescript
// src/agents/workflow/nodes/summarize.ts
import { NodeValue } from '@langchain/langgraph';
import { StateAnnotation } from '../state';
import { getLLM } from '@/lib/llm';

const SUMMARIZE_PROMPT = `你是一个专业的研究助手。根据以下网页内容，生成关于"{topic}"的研究报告。

## 已收集的内容
{context}

## 请按以下结构生成报告：
1. 概述（2-3 句话）
2. 主要发现（按主题分类）
3. 关键数据/事实
4. 参考来源
5. 结论

## 要求
- 所有内容必须基于提供的网页内容
- 每项内容注明来源
- 如果信息不足，明确说明`;

export const summarizeNode: NodeValue = async (state: typeof StateAnnotation.State) => {
  try {
    const llm = getLLM();
    const context = state.visitedContent.join('\n\n---\n\n');
    
    const response = await llm.invoke(
      SUMMARIZE_PROMPT.replace('{topic}', state.topic).replace('{context}', context)
    );
    
    return {
      report: response.content as string,
      step: 'done',
    };
  } catch (error) {
    return {
      step: 'error',
      error: `报告生成失败: ${error.message}`,
    };
  }
};
```

- [ ] **步骤 6: 运行测试验证**

```bash
npm test tests/unit/agents/workflow/workflow.test.ts
# 期望：PASS
```

- [ ] **步骤 7: 提交代码**

```bash
git add src/agents/workflow/ tests/
git commit -m "feat: implement LangGraph workflow with search, browse, summarize nodes"
```

---

### 任务 6: API 接口

**文件：**
- 创建: `src/app/api/research/route.ts`
- 创建: `src/app/api/research/stream/route.ts`
- 创建: `tests/unit/app/api/research.test.ts`

---

- [ ] **步骤 1: 编写失败测试**

```typescript
// tests/unit/app/api/research.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/research/route';

describe('POST /api/research', () => {
  it('应该拒绝过短的输入', async () => {
    const request = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({ topic: 'AI' }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('应该接受有效的输入', async () => {
    const request = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({ topic: '研究 2026 年 AI Agent 的发展趋势' }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

- [ ] **步骤 2: 实现 API**

```typescript
// src/app/api/research/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

const CreateResearchSchema = z.object({
  topic: z.string().min(10).max(500),
  maxResults: z.number().min(1).max(10).optional().default(5),
  includeSources: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateResearchSchema.parse(body);
    
    const taskId = `task_${uuid().replace(/-/g, '').slice(0, 16)}`;
    
    return NextResponse.json({
      success: true,
      data: {
        taskId,
        createdAt: new Date().toISOString(),
        streamToken: `stream_${uuid()}`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: error.errors[0].message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '系统内部错误' } },
      { status: 500 }
    );
  }
}
```

- [ ] **步骤 3: 运行测试验证**

```bash
npm test tests/unit/app/api/research.test.ts
# 期望：PASS
```

- [ ] **步骤 4: 提交代码**

```bash
git add src/app/api/research/ tests/
git commit -m "feat: implement POST /api/research endpoint with validation"
```

---

### 任务 7: 前端组件

**文件：**
- 创建: `src/components/ChatInput.tsx`
- 创建: `src/components/StreamOutput.tsx`
- 创建: `tests/unit/components/ChatInput.test.tsx`
- 创建: `tests/unit/components/StreamOutput.test.tsx`

---

- [ ] **步骤 1: 编写失败测试（ChatInput）**

```tsx
// tests/unit/components/ChatInput.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '@/components/ChatInput';

describe('ChatInput', () => {
  it('应该渲染输入框和按钮', () => {
    render(<ChatInput onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText(/研究主题/)).toBeInTheDocument();
    expect(screen.getByText('开始研究')).toBeInTheDocument();
  });

  it('按钮应该在输入过短时禁用', () => {
    render(<ChatInput onSubmit={vi.fn()} />);
    const button = screen.getByText('开始研究');
    expect(button).toBeDisabled();
  });

  it('按钮应该在输入足够时可用', () => {
    render(<ChatInput onSubmit={vi.fn()} />);
    const input = screen.getByPlaceholderText(/研究主题/);
    fireEvent.change(input, { target: { value: '研究 2026 年 AI Agent 的发展趋势' } });
    
    const button = screen.getByText('开始研究');
    expect(button).not.toBeDisabled();
  });
});
```

- [ ] **步骤 2: 实现 ChatInput**

```tsx
// src/components/ChatInput.tsx
'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSubmit: (topic: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [topic, setTopic] = useState('');
  
  const isValid = topic.length >= 10 && topic.length <= 500;
  
  const handleSubmit = () => {
    if (isValid && !disabled) {
      onSubmit(topic);
      setTopic('');
    }
  };
  
  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="请输入您想研究的主题，例如：研究 2026 年 AI Agent 的发展趋势"
        disabled={disabled}
        className="min-h-[48px] max-h-[120px] p-2 border rounded"
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {topic.length}/500
        </span>
        <button
          onClick={handleSubmit}
          disabled={!isValid || disabled}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          开始研究
        </button>
      </div>
    </div>
  );
}
```

- [ ] **步骤 3: 编写失败测试（StreamOutput）**

```tsx
// tests/unit/components/StreamOutput.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreamOutput } from '@/components/StreamOutput';

describe('StreamOutput', () => {
  it('应该渲染空状态', () => {
    render(<StreamOutput events={[]} />);
    expect(screen.getByText('等待开始研究...')).toBeInTheDocument();
  });

  it('应该渲染 thinking 事件', () => {
    const events = [{ type: 'thinking', content: '正在搜索...' }];
    render(<StreamOutput events={events} />);
    expect(screen.getByText('正在搜索...')).toBeInTheDocument();
  });
});
```

- [ ] **步骤 4: 实现 StreamOutput**

```tsx
// src/components/StreamOutput.tsx
'use client';

import { useEffect, useRef } from 'react';

type StreamEvent = {
  type: 'thinking' | 'searching' | 'browsing' | 'report' | 'done' | 'error' | 'ping';
  content?: string;
  url?: string;
  progress?: string;
  stats?: Record<string, number>;
};

interface StreamOutputProps {
  events: StreamEvent[];
}

export function StreamOutput({ events }: StreamOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);
  
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded min-h-[200px]">
      {events.length === 0 ? (
        <p className="text-gray-400">等待开始研究...</p>
      ) : (
        events.map((event, i) => (
          <div key={i} className="flex flex-col gap-1">
            {event.type === 'thinking' && (
              <div className="text-blue-600 flex items-center gap-2">
                <span className="animate-pulse">🤔</span>
                <span>{event.content}</span>
              </div>
            )}
            {event.type === 'browsing' && (
              <div className="text-green-600">
                📖 {event.content} ({event.progress})
              </div>
            )}
            {event.type === 'report' && (
              <div className="text-gray-800 whitespace-pre-wrap">
                {event.content}
              </div>
            )}
            {event.type === 'done' && (
              <div className="text-gray-600">
                ✅ 研究完成！耗时 {event.stats?.totalTime}ms
              </div>
            )}
            {event.type === 'error' && (
              <div className="text-red-600">
                ❌ {event.content}
              </div>
            )}
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}
```

- [ ] **步骤 5: 运行测试验证**

```bash
npm test tests/unit/components/
# 期望：PASS
```

- [ ] **步骤 6: 提交代码**

```bash
git add src/components/ tests/
git commit -m "feat: implement ChatInput and StreamOutput components"
```

---

### 任务 8: E2E 测试

**文件：**
- 创建: `tests/e2e/research.test.ts`
- 创建: `playwright.config.ts`

---

- [ ] **步骤 1: 安装 Playwright Test**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **步骤 2: 配置 Playwright**

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

- [ ] **步骤 3: 编写 E2E 测试**

```typescript
// tests/e2e/research.test.ts
import { test, expect } from '@playwright/test';

test.describe('Research Flow', () => {
  test('完整研究流程', async ({ page }) => {
    await page.goto('/');
    
    // 输入研究主题
    const input = page.locator('textarea');
    await input.fill('研究 React 18 的新特性和改进');
    
    // 提交
    const button = page.locator('button:has-text("开始研究")');
    await expect(button).toBeEnabled();
    await button.click();
    
    // 等待完成
    await expect(page.locator('text=研究完成')).toBeVisible({ timeout: 60000 });
    
    // 验证报告内容
    const report = page.locator('text=# React 18');
    await expect(report).toBeVisible();
  });
});
```

- [ ] **步骤 4: 运行 E2E 测试**

```bash
npm run dev &
sleep 5
npx playwright test tests/e2e/research.test.ts
```

- [ ] **步骤 5: 提交代码**

```bash
git add tests/e2e/ playwright.config.ts
git commit -m "test: add E2E tests for research flow"
```

---

## 3. 验证清单

在声称完成前，必须运行以下验证：

- [ ] `npm test` — 所有单元测试通过
- [ ] `npm run lint` — ESLint 检查通过
- [ ] `npm run build` — 构建成功
- [ ] `npx playwright test` — E2E 测试通过
- [ ] 手动测试核心流程可用

---

## 4. 提交规范

每次提交遵循 Conventional Commits：

```
feat: 实现新功能
fix: 修复 bug
test: 添加测试
chore: 构建/配置变更
docs: 文档更新
refactor: 重构（无行为变更）
```

---

**Document Change Log:**

| 版本 | 日期 | 作者 | 变更内容 |
|-----|------|------|---------|
| 1.0 | 2026-05-29 | Product Team | 初始版本（按 superpowers-writing-plans 格式） |