---
name: dev-builder
description: 项目开发 — Task 级编码 + 编译验证，不空跑
trigger: dev-planner 完成后，按 DEV-PLAN.md 顺序执行
prerequisite: DEV-PLAN.md 存在
category: agent-harness/skills
---

# dev-builder

## 目的

不是一口气把整个 Phase 写完，而是拆成多个 Task 逐个完成。每完成一个 Task，先编译验证确保没有报错，再进入下一个。出了问题能精确定位是哪个 Task 引入的。

## 核心原则

### Task 粒度
一个 Task = 2-5 分钟的专注工作。超过这个时间还没完成，说明 Task 拆得不够细，需要拆分。

### 不空跑
写完代码必须立即验证：
1. 编译/类型检查通过
2. 对应的测试通过（如果有）
3. 手动检查关键逻辑

### 一次一个变更
同时改多处无法判断哪个是真正的修复。一次只改一个文件或一个模块。

## 执行流程

### Step 1: 读取 Task 上下文

读取以下文件：
- PRODUCT-SPEC.md（相关功能部分）
- DESIGN-BRIEF.md（相关组件部分）
- 设计稿（相关页面）
- DEV-PLAN.md（当前 Task）

### Step 2: 实现 Task

按照以下顺序执行：

```
1. 写测试（如果有）
2. 写实现代码
3. 编译验证
4. 运行测试
5. 自我检查（代码质量）
```

### Step 3: 验证后提交

Task 验证通过后：
1. git add 对应文件
2. git commit（格式：`type: Task-编号 简短描述`）
3. Hook: auto-push 推送到远程

### Step 4: 触发 Review

Commit 成功后：
1. Hook: mark-review-needed 标记文件为待审查
2. 派发 code-reviewer 执行两阶段审查
3. Review 通过则进入下一 Task

## Task 实现模板

```markdown
### Task-X.Y: [任务名称]

**目标**: [一句话描述交付物]

**涉及文件**:
- 新建: `src/components/X.tsx`
- 修改: `src/pages/Y.tsx:20-45`
- 测试: `tests/components/X.test.tsx`

**实现步骤**:

Step 1: 创建组件结构
```tsx
// src/components/X.tsx
export const X = () => {
  return <div>X</div>;
};
```

Step 2: 添加样式（依据 DESIGN-BRIEF.md）
```tsx
// 使用 clsx + tailwind-merge
import { clsx } from 'clsx';

export const X = ({ className }) => {
  return <div className={clsx('rounded-md border border-slate-200', className)}>X</div>;
};
```

**验收标准**:
- [ ] 编译通过（tsc --noEmit）
- [ ] 单元测试通过
- [ ] 与设计稿视觉一致
```

## 编译验证命令

```bash
# TypeScript
tsc --noEmit

# ESLint
eslint src --max-warnings 0

# 单元测试
vitest run

# 集成测试
playwright test
```

## 错误处理

- 编译失败 → 停在当前 Task，不进入下一个
- 测试失败 → 停在当前 Task，不进入下一个
- Review 失败 → bug-fixer 介入，修复后重新 Review

## 与其他 Skill 的关系

- 依赖 product-spec-builder 的验收标准
- 依赖 design-maker 的设计稿
- 依赖 dev-planner 的 Task 分解
- 完成后触发 code-review
