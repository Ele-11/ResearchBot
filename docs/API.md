# ResearchBot - API 接口规格

> **Version:** 1.0
> **Status:** 审阅中
> **Last Updated:** 2026-05-29
> **Related Documents:** PRD.md, SPEC.md, MileStone.md

---

## 1. 接口概览

| 接口 | 方法 | 描述 |
|-----|------|------|
| `POST /api/research` | POST | 创建研究任务 |
| `GET /api/research/stream` | GET | SSE 流式获取进度 |
| `GET /api/health` | GET | 健康检查 |

---

## 2. 统一响应格式

**成功响应：**
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: { requestId: string; timestamp: string; };
}
```

**错误响应：**
```typescript
interface ErrorResponse {
  success: false;
  error: { code: string; message: string; details?: string; };
}
```

---

## 3. POST /api/research

创建新的研究任务。

### 请求

```typescript
interface CreateResearchRequest {
  topic: string;        // 必填，10-500 字符
  maxResults?: number;  // 选填，1-10，默认 5
  includeSources?: boolean; // 选填，默认 true
}
```

### 响应（200）

```typescript
{
  success: true;
  data: {
    taskId: string;       // 格式：task_xxx
    streamToken: string;  // 格式：stream_xxx
    createdAt: string;    // ISO 时间
    config: {
      maxResults: number;
      includeSources: boolean;
    };
  };
}
```

### 响应（400）

```typescript
{
  success: false;
  error: { code: "INVALID_INPUT"; message: "研究主题至少需要 10 个字符"; }
}
```

---

## 4. GET /api/research/stream

SSE 流式获取研究进度。

### 参数

| 参数 | 必填 | 说明 |
|-----|------|------|
| taskId | 是 | 任务 ID，格式：`task_xxx` |
| token | 是 | 流式令牌 |

### SSE 事件类型

| 事件 | 字段 |
|-----|------|
| `thinking` | content |
| `searching` | content, resultsCount |
| `browsing` | content, url, progress |
| `report` | content, isPartial |
| `done` | content, stats |
| `error` | code, message, retryable |
| `ping` | timestamp |

### stats 结构

```typescript
interface TaskStats {
  searchTime: number;     // ms
  browseTime: number;     // ms
  summarizeTime: number;  // ms
  totalTime: number;       // ms
  pagesVisited: number;
  pagesSkipped: number;
}
```

---

## 5. GET /api/health

健康检查。

### 响应

```typescript
{
  success: true;
  data: {
    status: "healthy" | "degraded";
    version: string;
    uptime: number;       // 秒
    checks: {
      search: "ok" | "error";
      llm: "ok" | "error";
      browser: "ok" | "error";
    };
  };
}
```

---

## 6. 错误码表

| 错误码 | HTTP | 可重试 | 说明 |
|-------|------|--------|------|
| INVALID_INPUT | 400 | ❌ | 参数校验失败 |
| SEARCH_FAILED | 500 | ✅ | 搜索引擎调用失败 |
| BROWSE_FAILED | 500 | ❌ | 浏览器工具失败 |
| LLM_ERROR | 500 | ✅ | LLM 调用失败 |
| TIMEOUT | 408 | ✅ | 处理超时 |
| RATE_LIMITED | 429 | ✅ | 触发限流 |
| TASK_NOT_FOUND | 404 | ❌ | 任务不存在 |
| INTERNAL_ERROR | 500 | ✅ | 服务器错误 |

---

## 7. 限流配置

| 维度 | 限制 |
|-----|------|
| 并发任务数 | 3 |
| 每分钟请求数 | 20 |
| 单任务超时 | 60s |

---

## 8. HTTP 状态码

| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 404 | 资源不存在 |
| 408 | 超时 |
| 429 | 限流 |
| 500 | 服务器错误 |

---

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| 1.0 | 2026-05-29 | 初始版本（简化版） |