---
name: dev-planner
description: 开发计划 — 技术调研 + Phase 拆分 + 跨 session 进度锚点
trigger: design-maker 完成后触发
prerequisite: PRODUCT-SPEC.md + DESIGN-BRIEF.md + 设计稿 全部存在
category: agent-harness/skills
---

# dev-planner

## 目的

读完需求和设计后，先调研技术栈有没有现成组件，再把项目拆成多个 Phase，每个 Phase 有明确的交付内容。DEV-PLAN 是跨 session 接续开发的进度锚点。

## 输入

- PRODUCT-SPEC.md
- DESIGN-BRIEF.md
- 设计稿截图/链接

## 输出

`DEV-PLAN.md` — 包含 Phase 划分、技术调研、Task 分解

## 执行流程

### Step 1: 技术调研

针对每个功能模块，调研：

```
技术调研清单：
- 有没有成熟的开源库/组件可以集成？
- 有没有官方/社区组件库？
- 依赖的外部 API 是否稳定？
- 安全性如何保障？
- 许可证是否合规？
```

### Step 2: Phase 划分

根据功能依赖和交付价值划分 Phase：

```
Phase-1: 核心 MVP（最小可用版本）
  交付: 用户可以完成主要操作流程
  预计 Task 数: 5-8

Phase-2: 体验完善
  交付: 异常处理、加载状态、错误提示
  预计 Task 数: 3-5

Phase-3: 高级功能
  交付: 高级功能模块
  预计 Task 数: 5-10

Phase-N: 优化与发布
  交付: 性能优化、打包、部署
  预计 Task 数: 3-5
```

### Step 3: Task 分解

每个 Phase 拆成具体的 Task：

```
Phase-1 Tasks:
Task-1.1: 项目脚手架搭建
  交付: 可运行的空项目，编译通过
  涉及文件: package.json, tsconfig.json, src/index.tsx

Task-1.2: 布局框架实现
  交付: 导航 + 内容区布局
  涉及文件: src/layouts/MainLayout.tsx
  依赖: 设计稿页面"首页"
  验收标准:
    - [ ] 导航栏高度 64px
    - [ ] 内容区最大宽度 1200px
    - [ ] 响应式断点 768px/1024px/1440px
```

### Step 4: 生成 DEV-PLAN.md

```markdown
# [产品名称] — DEV-PLAN

> 跨 session 接续开发的进度锚点。新开对话时，AI 读一遍此文档即知道从哪继续。

## 当前 Phase: Phase-1

## 技术选型
- 前端框架: React 18 + TypeScript
- UI 组件库: shadcn/ui
- 状态管理: Zustand
- 路由: React Router v6
- 样式: Tailwind CSS

## Phase 进度

### Phase-1: 核心 MVP
- [ ] Task-1.1: 项目脚手架
- [ ] Task-1.2: 布局框架
- [ ] Task-1.3: 首页功能
- [x] Task-1.4: 用户认证
- [ ] Task-1.5: 数据展示

### Phase-2: 体验完善
- [ ] Task-2.1: 错误处理
- [ ] Task-2.2: 加载状态
```

## 验收标准

- 每个 Task 有明确的交付物和验收标准
- Task 之间无循环依赖
- Phase 之间有清晰的依赖关系
- DEV-PLAN.md 是所有 Task 的执行基准

## 跨 session 恢复流程

新 session 开始时：
1. 读取 DEV-PLAN.md
2. 找到第一个未完成的 Task
3. 读取对应的设计稿和 Spec
4. 继续执行
