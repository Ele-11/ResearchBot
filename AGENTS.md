# AGENTS.md

> **项目：** ResearchBot — AI 研究助手（用户输入主题 → 自动搜索 → 浏览网页 → 生成结构化报告 → 流式输出）

---

## 开发前必读

- `docs/SPEC.md` — 功能规格、技术选型、验收标准
- `docs/MileStone.md` — 实施计划、TDD 步骤
- `docs/API.md` — API 定义、测试规范

---

## 技术栈

React + Vite + TypeScript | Next.js API Routes | LangGraph.js | MiniMax DeepSeek | Playwright | Vercel

---

## Skill 使用规则

本项目使用 [superpowers](https://github.com/obra/superpowers) 工作流：

- **TDD 铁律**：RED（写失败测试）→ GREEN（写最小实现）→ REFACTOR
- **Milestone 规则**：一次实现一个，每次新建 Milestone 分支，不提前实现后续 Milestone
- **验证前完成**：声称完成前必须 `npm test && npm run lint && npm run build` 全部通过
- **直接开发**：直接在项目目录中切换/创建分支开发，不使用 worktree

前端 UI 页面开发时，使用项目内的 UI skill：

- `.agents/skills/ele-ui`

---

### 开发规则

- 凡是用户提到"实现 Milestone X / 验证 Milestone X / PR Milestone X"，默认使用 .agents/skills/milestone-superpowers-workflow
- 一次只实现一个 Milestone。
- 每次实现 Milestone 时，先确保从远程仓库拉取最新的代码，然后都必须新建一个 Milestone 分支来开发。
- 直接在项目目录中开发，不使用 worktree。
- 不要提前实现后续 Milestone。
- 保持代码简单、清晰、可维护。
- 不要随意新增依赖。
- 不要硬编码密钥。


## 提交规范

```
feat: | fix: | test: | chore: | docs: | refactor:
```

---


## 验证规则

任务完成前，尽量运行以下命令：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
