---
name: code-review
description: 两阶段代码审查 — Spec 合规 + 代码质量，推理型传感器
trigger: dev-builder 每个 Task 完成后自动触发
prerequisite: 有待审查的代码变更
category: agent-harness/skills
---

# code-review

## 目的

代码不是写完就算，写完必须过审。两阶段审查是 Harness 里最重要的推理型传感器——不只是看编译过不过，而是让 reviewer Agent 理解代码和需求的关系。

## 传感器类型

| 类型 | 特点 | 示例 |
|------|------|------|
| 计算型（Hook）| 确定性，跑得快 | pre-commit-check |
| 推理型（Review）| 非确定性，语义级检查 | code-review |

## 两阶段审查

### Stage 1: Spec 合规性检查（功能完整性）

对照 PRODUCT-SPEC.md，逐条检查：

```
检查清单：
- [ ] Spec 每条 Feature 都有对应代码实现
- [ ] 没有多做的（Spec 没写但代码里有的）
- [ ] 没有漏做的（Spec 写了但代码里没实现的）
- [ ] 验收标准逐条通过
- [ ] UI 与设计稿一致
```

**判断标准**：
- HIGH priority 问题 → **停在 Stage 1，不往下走**
- MEDIUM priority 问题 → 记录，进入 Stage 2
- LOW priority 问题 → 记录，不阻止

### Stage 2: 代码质量检查

```
检查清单：
- [ ] 命名规范（变量/函数/文件）
- [ ] 类型安全（TypeScript 类型完备）
- [ ] 错误处理（try-catch、边界条件）
- [ ] 安全漏洞（注入、XSS、CORS）
- [ ] 性能问题（N+1、内存泄漏）
- [ ] 可读性（注释、复杂度）
```

**判断标准**：
- HIGH priority 问题 → 返回 bug-fixer 修复
- MEDIUM/LOW → 记录，可以合并到主分支

## 审查流程

```
dev-builder 完成 Task
    ↓
派发 code-reviewer（全新实例）
    ↓
Stage 1: Spec 合规检查
    ↓ [失败]
补实现 → 重新审查
    ↓ [通过]
Stage 2: 代码质量检查
    ↓ [失败]
调用 bug-fixer → 修复 → 重新审查
    ↓ [通过]
自动 commit + push
    ↓
进入下一个 Task
```

## 审查报告模板

```markdown
# Code Review Report

## Task: Task-X.Y
## Reviewer: code-reviewer
## Timestamp: YYYY-MM-DD HH:MM

---

## Stage 1: Spec Compliance

| Spec 条目 | 状态 | 说明 |
|-----------|------|------|
| Feature-001 | ✅ PASS | |
| Feature-002 | ❌ FAIL | 缺少错误处理 |

**Stage 1 结果**: ❌ FAIL — 1 HIGH issue

### Issues:
1. [HIGH] 缺少错误处理
   - 文件: src/components/X.tsx
   - 行号: 45-50
   - 说明: API 错误时没有 try-catch

---

## Stage 2: Code Quality

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 命名规范 | ✅ PASS | |
| 类型安全 | ⚠️ MEDIUM | userId 缺少类型定义 |
| 错误处理 | ❌ HIGH | 同上 |

**Stage 2 结果**: ⚠️ PASS（with issues）

### Issues:
1. [MEDIUM] userId 类型缺失
   - 文件: src/api/y.ts
   - 说明: any 类型，应定义为 string
```

## 审查原则

1. **每个 Task 单独审查**，不攒到 Phase 结束
2. **全新实例**，不继承实现者的上下文
3. **有据可查**，每个判断都要有证据
4. **高标准**，低级别问题也可能被提升

## 与其他 Skill 的关系

- 被 dev-builder 触发（每个 Task 完成时）
- 失败时调用 bug-fixer
- 完成后触发 auto-push Hook
- 反复出现的模式 → 触发 evolution-runner
