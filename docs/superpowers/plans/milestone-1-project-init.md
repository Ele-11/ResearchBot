# Milestone 1: 项目初始化

**分支:** `milestone/1-project-init`  
**基于:** `origin/dev`

---

## 目标

搭建可运行的 Next.js + TypeScript + Vite 项目骨架，配置代码规范工具，验证开发服务器启动。

---

## 验收标准

- [ ] `npm run dev` 成功启动，浏览器可访问
- [ ] ESLint + Prettier 已配置（`pnpm lint` 无报错）
- [ ] TypeScript 编译通过（`pnpm typecheck` 无报错）
- [ ] `package.json` scripts 完整：dev / build / lint / typecheck / test

---

## 工作步骤

### Step 1: 初始化 Next.js 项目

使用 `create-next-app` 创建项目：

- App Router (`src/app`)
- TypeScript
- ESLint
- Tailwind CSS (按需)
- src/ 目录结构

### Step 2: 安装额外依赖

- Prettier + ESLint 插件（如果 create-next-app 未自带）
- Vitest + @testing-library/react（测试框架）
- 根据 SPEC.md 技术栈需要：langgraph, @langchain/core, playwright

### Step 3: 配置 ESLint / Prettier

- `.eslintrc` / `eslint.config.mjs`
- `.prettierrc` / `.prettierrc.json`
- `.gitignore` 确认包含 node_modules/, .next/, dist/

### Step 4: 创建基础页面框架

根据 SPEC.md `docs/SPEC.md` 项目结构：

```
src/app/
├── api/
│   └── research/
│       ├── route.ts
│       └── stream/
│           └── route.ts
├── page.tsx
└── layout.tsx
src/components/
├── ChatInput.tsx
└── StreamOutput.tsx
```

只需占位组件，不需要实现功能。

### Step 5: 验证构建

按 AGENTS.md 验证规则执行：

```bash
pnpm lint
pnpm typecheck
pnpm build
```

---

## 约束

- 不实现任何业务逻辑（搜索、LLM 调用等）
- 不硬编码 API 密钥
- 不提前实现 Milestone 2+ 的功能
- 保持目录结构与 SPEC.md 一致

---

## 提交记录

```
chore: milestone 1 - project initialization
```