---
name: ele-ui
description: Use when building or polishing the ResearchBot UI in React 18, TypeScript, and Tailwind CSS.
---

# Ele UI

实现简洁、清爽、可用优先的前端页面。

## Before Coding

- 先读 `docs/SPEC.md`、`docs/MILESTONES.md`、`docs/API.md`，确认当前 Milestone。
- 判断页面类型：用户端移动页，或管理端 PC 后台页。
- 不改后端逻辑、Prisma schema 或 API 设计，除非用户明确要求。

## Style

- 视觉：浅色背景、白色卡片、细边框、轻阴影、`8px` 内圆角。
- 主色：绿色、青绿色或蓝绿色；价格、状态、主按钮要突出。
- 避免紫蓝/粉蓝 AI 渐变、装饰光球、复杂玻璃拟态、大量 emoji、超大圆角。

## Implementation

- 使用 Tailwind CSS，除非项目已有其他 UI 系统；不新增 UI 库，除非用户同意。

## Final Report

- 说明改了哪些文件、页面/组件、状态覆盖和验证命令。
- 如有范围限制或后续优化，简短列出。
