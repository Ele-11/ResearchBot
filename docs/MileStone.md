# ResearchBot - 实施计划

> **Version:** 1.0
> **Status:** 审阅中
> **Last Updated:** 2026-05-29
> **Workflow:** TDD (红→绿→重构)
> **执行方式:** superpowers-subagent-driven-development

---

## 目标概述

在 7 天内完成 ResearchBot MVP 开发：用户输入研究主题 → AI 自动搜索 → 浏览网页 → 生成结构化报告 → 流式输出展示。

**技术栈：** React + Vite + TypeScript | Next.js API Routes | LangGraph.js | MiniMax DeepSeek | Playwright | Vercel

---

## Milestone 1: 项目初始化

- [ ] 初始化 Next.js + TypeScript + Vite 项目
- [ ] 配置 ESLint + Prettier
- [ ] 创建基础页面框架
- [ ] 验证项目可运行

---

## Milestone 2: LLM 集成

- [ ] 集成 MiniMax DeepSeek API
- [ ] 支持流式输出（streaming）

---

## Milestone 3: 搜索工具

- [ ] 实现 Bing Search API 封装
- [ ] 实现 LangChain Tool 接口
- [ ] 单元测试

---

## Milestone 4: 浏览器工具

- [ ] 实现 Playwright 网页抓取
- [ ] 实现 LangChain Tool 接口
- [ ] 单元测试

---

## Milestone 5: LangGraph 工作流

- [ ] 定义 ResearchState 状态类型
- [ ] 实现 Search 节点
- [ ] 实现 Browse 节点
- [ ] 实现 Summarize 节点
- [ ] 单元测试

---

## Milestone 6: API 接口

- [ ] 实现 POST /api/research（任务创建）
- [ ] 实现流式输出接口
- [ ] 输入校验
- [ ] 单元测试

---

## Milestone 7: 前端组件

- [ ] ChatInput 组件（输入框 + 提交）
- [ ] StreamOutput 组件（流式渲染）
- [ ] 单元测试

---

## Milestone 8: E2E 测试

- [ ] 配置 Playwright
- [ ] 完整研究流程测试
- [ ] 验证清单：`npm test && npm run lint && npm run build`

---

## 提交规范

```
feat: | fix: | test: | chore: | docs: | refactor:
```

---

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| 1.0 | 2026-05-29 | 初始版本（简化版） |