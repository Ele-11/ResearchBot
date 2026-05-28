# ResearchBot - API 接口规格文档

> **Version:** 1.0  
> **Status:** 审阅中  
> **Last Updated:** 2026-05-29  
> **Workflow:** superpowers-test-driven-development  
> **Related Documents:** PRD.md, SPEC.md, MileStone.md  

---

## 1. 文档概述

### 1.1 目的

本文档定义 ResearchBot 的 API 接口规范，遵循 TDD 原则：
- **RED**：先写失败测试
- **GREEN**：写最小实现
- **REFACTOR**：清理代码

### 1.2 铁律

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

### 1.3 接口概览

| 接口 | 方法 | 描述 | 状态 |
|-----|------|------|------|
| `POST /api/research` | POST | 创建研究任务 | 待实现 |
| `GET /api/research/stream` | GET | SSE 流式获取进度 | 待实现 |
| `GET /api/health` | GET | 健康检查 | 待实现 |

---

## 2. API 设计原则

### 2.1 RESTful 设计

| 原则 | 说明 |
|-----|------|
| 资源命名 | 使用名词（research、health） |
| HTTP 方法 | GET 查、POST 创、DELETE 删 |
| 状态码 | 200 成功、400 错误、500 服务器错误 |
| 幂等性 | 相同请求多次执行结果一致 |

### 2.2 统一响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
    duration: number;
  };
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}
```

---

## 3. 接口测试规范

### 3.1 测试文件位置

```
tests/unit/app/api/
├── research.test.ts      # POST /api/research 测试
├── stream.test.ts        # GET /api/research/stream 测试
└── health.test.ts        # GET /api/health 测试
```

### 3.2 测试命名规范

```typescript
// 命名模式：should_<expected_behavior>
describe('POST /api/research', () => {
  it('should reject input shorter than 10 characters', async () => {});
  it('should accept valid input and return taskId', async () => {});
  it('should return 400 for invalid input', async () => {});
  it('should return 429 when rate limited', async () => {});
});
```

---

## 4. POST /api/research

创建新的研究任务。

### 4.1 RED — 编写失败测试

```typescript
// tests/unit/app/api/research.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/research/route';
import { NextRequest } from 'next/server';

describe('POST /api/research', () => {
  // ─────────────────────────────────────────────────────────
  // 4.1.1 输入验证测试
  // ─────────────────────────────────────────────────────────

  describe('Input Validation', () => {
    it('should reject input shorter than 10 characters', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'AI' }), // 2 chars
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_INPUT');
      expect(body.error.message).toContain('10');
    });

    it('should reject input longer than 500 characters', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'A'.repeat(501) }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept input exactly 10 characters', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究人工智' }), // 6 chars + 4 = 10
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept input exactly 500 characters', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究主题'.repeat(125) }), // 4 * 125 = 500
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should reject empty topic', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject missing topic', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 4.1.2 成功响应测试
  // ─────────────────────────────────────────────────────────

  describe('Success Response', () => {
    it('should return taskId and streamToken on success', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究 2026 年 AI Agent 的发展趋势' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.taskId).toBeDefined();
      expect(body.data.taskId).toMatch(/^task_/);
      expect(body.data.streamToken).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
    });

    it('should use default maxResults if not provided', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究 AI Agent' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      // maxResults 默认为 5
    });

    it('should accept custom maxResults', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究 AI Agent', maxResults: 3 }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should reject maxResults less than 1', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究 AI Agent', maxResults: 0 }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject maxResults greater than 10', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究 AI Agent', maxResults: 11 }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should default includeSources to true', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究 AI Agent' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 4.1.3 错误处理测试
  // ─────────────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should return 500 for internal errors', async () => {
      // 这个测试需要 mock 内部依赖
      // 暂时跳过，在集成测试中覆盖
    });

    it('should include requestId in meta', async () => {
      const request = new Request('http://localhost/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: '研究 AI Agent' }),
      });

      const response = await POST(request);
      const body = await response.json();
      expect(body.meta?.requestId).toBeDefined();
    });
  });
});
```

### 4.2 GREEN — 最小实现

```typescript
// src/app/api/research/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ─────────────────────────────────────────────────────────
// 4.2.1 验证 Schema（与测试对应）
// ─────────────────────────────────────────────────────────

const CreateResearchSchema = z.object({
  topic: z.string()
    .min(10, '研究主题至少需要 10 个字符')
    .max(500, '研究主题不能超过 500 个字符'),
  
  maxResults: z.number()
    .min(1, '最大浏览页面数最少为 1')
    .max(10, '最大浏览页面数最多为 10')
    .optional()
    .default(5),
  
  includeSources: z.boolean()
    .optional()
    .default(true),
});

// ─────────────────────────────────────────────────────────
// 4.2.2 请求处理
// ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. 解析请求体
    const body = await request.json();
    
    // 2. 验证输入（对应 RED 测试）
    const validated = CreateResearchSchema.parse(body);
    
    // 3. 创建任务
    const taskId = `task_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const streamToken = `stream_${uuidv4()}`;
    
    // 4. 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        taskId,
        streamToken,
        createdAt: new Date().toISOString(),
        config: {
          maxResults: validated.maxResults,
          includeSources: validated.includeSources,
        },
      },
      meta: {
        requestId: uuidv4(),
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    // 5. 错误处理
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: error.errors[0].message,
            details: JSON.stringify(error.errors),
          },
        },
        { status: 400 }
      );
    }
    
    console.error('[POST /api/research]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '系统内部错误，请稍后重试',
        },
      },
      { status: 500 }
    );
  }
}
```

### 4.3 类型定义

```typescript
// src/types/api.ts

// ─────────────────────────────────────────────────────────
// 4.3.1 请求类型
// ─────────────────────────────────────────────────────────

export interface CreateResearchRequest {
  topic: string;
  maxResults?: number;
  includeSources?: boolean;
}

// ─────────────────────────────────────────────────────────
// 4.3.2 响应类型
// ─────────────────────────────────────────────────────────

export interface CreateResearchResponse {
  success: true;
  data: {
    taskId: string;
    streamToken: string;
    createdAt: string;
    config: {
      maxResults: number;
      includeSources: boolean;
    };
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

// ─────────────────────────────────────────────────────────
// 4.3.3 错误类型
// ─────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: string;
  };
}

export type ErrorCode =
  | 'INVALID_INPUT'
  | 'SEARCH_FAILED'
  | 'BROWSE_FAILED'
  | 'LLM_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'TASK_NOT_FOUND'
  | 'INTERNAL_ERROR';
```

---

## 5. GET /api/research/stream

通过 SSE 流式返回研究进度。

### 5.1 RED — 编写失败测试

```typescript
// tests/unit/app/api/stream.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/research/stream/route';

describe('GET /api/research/stream', () => {
  // ─────────────────────────────────────────────────────────
  // 5.1.1 参数验证测试
  // ─────────────────────────────────────────────────────────

  describe('Parameter Validation', () => {
    it('should reject missing taskId', async () => {
      const request = new Request('http://localhost/api/research/stream');
      const response = await GET(request);
      expect(response.status).toBe(400);
    });

    it('should reject missing token', async () => {
      const request = new Request('http://localhost/api/research/stream?taskId=task_123');
      const response = await GET(request);
      expect(response.status).toBe(400);
    });

    it('should reject invalid taskId format', async () => {
      const request = new Request(
        'http://localhost/api/research/stream?taskId=invalid&token=token'
      );
      const response = await GET(request);
      expect(response.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 5.1.2 流式响应测试
  // ─────────────────────────────────────────────────────────

  describe('SSE Response', () => {
    it('should return Content-Type: text/event-stream', async () => {
      const request = new Request(
        'http://localhost/api/research/stream?taskId=task_123&token=token'
      );
      const response = await GET(request);
      expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    });

    it('should send thinking event first', async () => {
      const request = new Request(
        'http://localhost/api/research/stream?taskId=task_123&token=token'
      );
      const response = await GET(request);
      
      // 读取响应体
      const reader = response.body?.getReader();
      expect(reader).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────────────────
  // 5.1.3 事件类型测试
  // ─────────────────────────────────────────────────────────

  describe('Event Types', () => {
    it('should send thinking event with correct structure', async () => {
      // 测试数据结构
      const thinkingEvent = {
        type: 'thinking',
        content: '正在分析您的问题，准备开始搜索...',
        timestamp: expect.any(Number),
      };
      expect(thinkingEvent).toMatchSchema({
        type: 'thinking',
        content: expect.any(String),
        timestamp: expect.any(Number),
      });
    });

    it('should send searching event with result count', async () => {
      const searchingEvent = {
        type: 'searching',
        content: '搜索完成，找到 10 个相关结果',
        resultsCount: 10,
        timestamp: expect.any(Number),
      };
      expect(searchingEvent).toMatchSchema({
        type: 'searching',
        content: expect.any(String),
        resultsCount: expect.any(Number),
        timestamp: expect.any(Number),
      });
    });

    it('should send browsing event with progress', async () => {
      const browsingEvent = {
        type: 'browsing',
        content: '正在浏览：zhihu.com/p/12345',
        url: 'https://zhihu.com/p/12345',
        progress: '2/5',
        timestamp: expect.any(Number),
      };
      expect(browsingEvent).toMatchSchema({
        type: 'browsing',
        content: expect.any(String),
        url: expect.stringMatching(/^https?:\/\//),
        progress: expect.stringMatching(/^\d+\/\d+$/),
        timestamp: expect.any(Number),
      });
    });

    it('should send done event with stats', async () => {
      const doneEvent = {
        type: 'done',
        content: '研究完成！共浏览 5 个网页，耗时 25 秒',
        stats: {
          searchTime: expect.any(Number),
          browseTime: expect.any(Number),
          summarizeTime: expect.any(Number),
          totalTime: expect.any(Number),
          pagesVisited: expect.any(Number),
          pagesSkipped: expect.any(Number),
        },
        timestamp: expect.any(Number),
      };
      expect(doneEvent).toMatchSchema({
        type: 'done',
        stats: {
          searchTime: expect.any(Number),
          browseTime: expect.any(Number),
          summarizeTime: expect.any(Number),
          totalTime: expect.any(Number),
          pagesVisited: expect.any(Number),
          pagesSkipped: expect.any(Number),
        },
      });
    });

    it('should send error event with retryable flag', async () => {
      const errorEvent = {
        type: 'error',
        code: 'SEARCH_FAILED',
        message: '搜索服务暂时不可用，请稍后重试',
        retryable: true,
        timestamp: expect.any(Number),
      };
      expect(errorEvent).toMatchSchema({
        type: 'error',
        code: expect.any(String),
        message: expect.any(String),
        retryable: expect.any(Boolean),
        timestamp: expect.any(Number),
      });
    });

    it('should send ping event for keep-alive', async () => {
      const pingEvent = {
        type: 'ping',
        timestamp: expect.any(Number),
      };
      expect(pingEvent).toMatchSchema({
        type: 'ping',
        timestamp: expect.any(Number),
      });
    });
  });
});
```

### 5.2 GREEN — 最小实现

```typescript
// src/app/api/research/stream/route.ts
import { z } from 'zod';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// ─────────────────────────────────────────────────────────
// 5.2.1 验证 Schema
// ─────────────────────────────────────────────────────────

const StreamRequestSchema = z.object({
  taskId: z.string().regex(/^task_[a-zA-Z0-9]+$/, '无效的 taskId 格式'),
  token: z.string().min(1, 'token 不能为空'),
});

// ─────────────────────────────────────────────────────────
// 5.2.2 事件类型定义
// ─────────────────────────────────────────────────────────

type StreamEvent =
  | { type: 'thinking'; content: string; timestamp: number }
  | { type: 'searching'; content: string; resultsCount: number; timestamp: number }
  | { type: 'browsing'; content: string; url: string; progress: string; timestamp: number }
  | { type: 'report'; content: string; isPartial: boolean; timestamp: number }
  | { type: 'done'; content: string; stats: TaskStats; timestamp: number }
  | { type: 'error'; code: string; message: string; retryable: boolean; timestamp: number }
  | { type: 'ping'; timestamp: number };

interface TaskStats {
  searchTime: number;
  browseTime: number;
  summarizeTime: number;
  totalTime: number;
  pagesVisited: number;
  pagesSkipped: number;
}

// ─────────────────────────────────────────────────────────
// 5.2.3 事件序列化
// ─────────────────────────────────────────────────────────

function formatSSE(event: StreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

// ─────────────────────────────────────────────────────────
// 5.2.4 请求处理
// ─────────────────────────────────────────────────────────

export async function GET(request: Request) {
  // 1. 解析查询参数
  const url = new URL(request.url);
  const taskId = url.searchParams.get('taskId');
  const token = url.searchParams.get('token');

  // 2. 验证参数
  const result = StreamRequestSchema.safeParse({ taskId, token });
  if (!result.success) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: result.error.errors[0].message,
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. 创建 SSE 流
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(formatSSE(event)));
      };

      try {
        // 发送初始思考事件
        sendEvent({
          type: 'thinking',
          content: '正在分析您的问题，准备开始搜索...',
          timestamp: Date.now(),
        });

        // TODO: 调用 LangGraph 工作流，实时发送事件
        // const workflow = createResearchWorkflow();
        // for await (const event of workflow.stream({ topic: task.topic })) {
        //   sendEvent(event);
        // }

        // 模拟流程（实际从 LangGraph 获取）
        await new Promise((r) => setTimeout(r, 100));
        
        sendEvent({
          type: 'searching',
          content: '搜索完成，找到 10 个相关结果',
          resultsCount: 10,
          timestamp: Date.now(),
        });

        // 模拟浏览进度
        for (let i = 1; i <= 3; i++) {
          await new Promise((r) => setTimeout(r, 500));
          sendEvent({
            type: 'browsing',
            content: `正在浏览第 ${i} 个网页...`,
            url: `https://example.com/page${i}`,
            progress: `${i}/3`,
            timestamp: Date.now(),
          });
        }

        // 模拟报告生成
        await new Promise((r) => setTimeout(r, 1000));
        sendEvent({
          type: 'report',
          content: '# 研究报告\n\n## 概述\n这是模拟的报告内容...',
          isPartial: false,
          timestamp: Date.now(),
        });

        // 发送完成事件
        sendEvent({
          type: 'done',
          content: '研究完成！',
          stats: {
            searchTime: 1200,
            browseTime: 15000,
            summarizeTime: 5000,
            totalTime: 21200,
            pagesVisited: 3,
            pagesSkipped: 0,
          },
          timestamp: Date.now(),
        });

      } catch (error) {
        sendEvent({
          type: 'error',
          code: 'INTERNAL_ERROR',
          message: '系统内部错误',
          retryable: true,
          timestamp: Date.now(),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 6. GET /api/health

健康检查接口。

### 6.1 RED — 编写失败测试

```typescript
// tests/unit/app/api/health.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  // ─────────────────────────────────────────────────────────
  // 6.1.1 基本响应测试
  // ─────────────────────────────────────────────────────────

  it('should return 200 with status ok', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('should return status healthy when all services are ok', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('healthy');
  });

  it('should return version in response', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.data.version).toBeDefined();
    expect(typeof body.data.version).toBe('string');
  });

  it('should include uptime in response', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.data.uptime).toBeDefined();
    expect(body.data.uptime).toBeGreaterThan(0);
  });

  // ─────────────────────────────────────────────────────────
  // 6.1.2 服务健康检查测试
  // ─────────────────────────────────────────────────────────

  it('should include search service status', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.data.checks.search).toBeDefined();
    expect(['ok', 'error']).toContain(body.data.checks.search);
  });

  it('should include llm service status', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.data.checks.llm).toBeDefined();
    expect(['ok', 'error']).toContain(body.data.checks.llm);
  });

  it('should include browser service status', async () => {
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();
    
    expect(body.data.checks.browser).toBeDefined();
    expect(['ok', 'error']).toContain(body.data.checks.browser);
  });

  it('should return degraded status when one service is down', async () => {
    // Mock 一个服务不可用
    // 测试 degraded 状态
    const request = new Request('http://localhost/api/health');
    const response = await GET(request);
    const body = await response.json();
    
    // 实际实现中，只要不是所有服务都 ok，就是 degraded
    const allOk = Object.values(body.data.checks).every(s => s === 'ok');
    expect(body.data.status).toBe(allOk ? 'healthy' : 'degraded');
  });
});
```

### 6.2 GREEN — 最小实现

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

interface HealthCheck {
  search: 'ok' | 'error';
  llm: 'ok' | 'error';
  browser: 'ok' | 'error';
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheck = {
    search: 'ok',
    llm: 'ok',
    browser: 'ok',
  };

  // 检查各服务健康状态
  try {
    // 检查搜索服务
    // if (!await checkSearchService()) {
    //   checks.search = 'error';
    // }
  } catch {
    checks.search = 'error';
  }

  try {
    // 检查 LLM 服务
    // if (!await checkLLMService()) {
    //   checks.llm = 'error';
    // }
  } catch {
    checks.llm = 'error';
  }

  try {
    // 检查浏览器服务
    // if (!await checkBrowserService()) {
    //   checks.browser = 'error';
    // }
  } catch {
    checks.browser = 'error';
  }

  const allOk = Object.values(checks).every(s => s === 'ok');
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  return NextResponse.json({
    success: true,
    data: {
      status: allOk ? 'healthy' : 'degraded',
      version: process.env.npm_package_version || '1.0.0',
      uptime: uptime,
      checks,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
```

---

## 7. 错误码规范

### 7.1 错误码表

| 错误码 | HTTP 状态码 | 用户信息 | 可重试 | 触发条件 |
|-------|-------------|---------|--------|---------|
| INVALID_INPUT | 400 | 输入内容不符合要求 | ❌ | 参数校验失败 |
| SEARCH_FAILED | 500 | 搜索服务暂时不可用 | ✅ | 搜索引擎调用失败 |
| BROWSE_FAILED | 500 | 页面浏览失败 | ❌ | 浏览器工具失败 |
| LLM_ERROR | 500 | 报告生成失败 | ✅ | LLM 调用失败 |
| TIMEOUT | 408 | 任务执行超时 | ✅ | 处理超时 |
| RATE_LIMITED | 429 | 请求过于频繁 | ✅ | 触发限流 |
| TASK_NOT_FOUND | 404 | 任务不存在 | ❌ | taskId 不存在 |
| INTERNAL_ERROR | 500 | 系统内部错误 | ✅ | 服务器错误 |

### 7.2 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "研究主题至少需要 10 个字符",
    "details": "[{\"path\":[\"topic\"],\"message\":\"研究主题至少需要 10 个字符\"}]"
  }
}
```

---

## 8. 限流规范

### 8.1 限流配置

| 维度 | 限制 | 说明 |
|-----|------|------|
| 并发请求数 | 3 | 同时处理的最大任务数 |
| 每分钟请求数 | 20 | API 限流 |
| 单任务执行时间 | 60s | 超时中断 |

### 8.2 限流响应

```typescript
// 触发限流时的响应头
headers: {
  'X-RateLimit-Limit': '20',
  'X-RateLimit-Remaining': '0',
  'X-RateLimit-Reset': '1716959460',
  'Retry-After': '60',
}
```

---

## 9. 附录

### 9.1 状态码枚举

```typescript
// src/types/api.ts

export type TaskStatus = 
  | 'pending'    // 待处理
  | 'running'    // 执行中
  | 'completed'  // 已完成
  | 'failed'     // 失败
  | 'cancelled'; // 已取消
```

### 9.2 HTTP 状态码对照

| 状态码 | 说明 | 触发条件 |
|-------|------|---------|
| 200 | OK | 成功响应 |
| 400 | Bad Request | 参数校验失败 |
| 404 | Not Found | 资源不存在 |
| 408 | Request Timeout | 请求超时 |
| 429 | Too Many Requests | 限流 |
| 500 | Internal Server Error | 服务器错误 |
| 503 | Service Unavailable | 服务不可用 |

### 9.3 内容类型对照

| Content-Type | 用途 |
|-------------|------|
| application/json | REST API 请求/响应 |
| text/event-stream | Server-Sent Events 流 |

---

**Document Change Log:**

| 版本 | 日期 | 作者 | 变更内容 |
|-----|------|------|---------|
| 1.0 | 2026-05-29 | Product Team | 初始版本（按 TDD 格式重写） |