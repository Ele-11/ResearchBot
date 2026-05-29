# ResearchBot - Vite Edition

AI 论文研究助手，基于 Vite + React 18 + React Router 构建。

## 快速开始

```bash
# 1. 安装依赖（需要先删除旧的 node_modules 和 pnpm-lock.yaml）
rm -rf node_modules pnpm-lock.yaml package-lock.json

# 2. 安装新依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 同时启动 API 服务（如需要）
npm run dev:all
```

## 手动清理（推荐）

删除以下 Next.js 残留文件后再安装：

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next, next-env.d.ts, next.config.ts, postcss.config.mjs

# 删除旧 API 路由目录
Remove-Item -Recurse -Force src\app

# 删除旧的 langchain 依赖
# （可选，如果不再使用 LangChain）
```

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 (端口 3000) |
| `npm run build` | TypeScript 检查 + Vite 构建 |
| `npm run preview` | 预览构建产物 |
| `npm run server` | 启动独立 API 服务 (端口 3001) |
| `npm run dev:all` | 同时启动前端 + API 服务 |
| `npm run test` | Vitest 测试 |

## 架构说明

- **前端**: Vite + React 18 + React Router 6
- **样式**: Tailwind CSS v3 (保留原有设计系统)
- **API**: 独立 Node.js 服务 (替代 Next.js API Routes)
- **测试**: Vitest + React Testing Library

## 目录结构

```
src/
├── main.tsx          # React 入口
├── App.tsx           # 路由配置
├── index.css         # Tailwind + 全局样式
├── pages/
│   └── Home.tsx     # 主页
├── components/
│   ├── ChatInput.tsx
│   └── StreamOutput.tsx
├── lib/
│   ├── llm.ts       # LLM 工具类（前端用）
│   └── types.ts
└── server/
    ├── index.ts     # API 服务入口
    └── lib/llm.ts   # LLM 工具类（服务端用）
```

## API 服务

API 服务运行在 `http://localhost:3001`，代理配置已在 Vite 中设置：

- `POST /api/research` - 研究主题
- `GET /health` - 健康检查

## 环境变量

创建 `.env` 文件：

```env
MINIMAX_API_KEY=your_api_key_here
```