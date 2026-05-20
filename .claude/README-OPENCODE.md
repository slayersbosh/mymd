# 毒舌产品经理 Agent Harness — OpenCode + Oh My OpenAgent 使用指南

## 前提

- OpenCode CLI 已安装（`npm i -g @opencode-ai/plugin`）
- 已完成 `opencode auth login`（配置好 API Key）
- Oh My OpenAgent 已安装（如使用）

---

## 项目初始化

在项目目录下初始化 Harness：

```bash
# 1. 克隆/创建项目
mkdir my-product && cd my-product
git init

# 2. 把 Harness 复制到项目
cp -r ~/.hermes/agent-harness/* ./.claude/

# 3. 目录结构
my-product/
├── .claude/
│   ├── CLAUDE.md          ← 主调度文件（OpenCode 的 agent 读这个）
│   ├── skills/
│   ├── hooks/
│   ├── subagents/
│   └── projects/          ← 每个产品一个子目录
│       └── my-product/
│           ├── PRODUCT-SPEC.md
│           ├── DESIGN-BRIEF.md
│           ├── DEV-PLAN.md
│           └── .claude/
│               ├── feedback/
│               └── EVOLUTION.md
└── src/                  ← 你的代码
```

---

## 核心命令（Oh My OpenAgent 插件方式）

### 启动新项目

```bash
# 在项目目录下运行
opencode "请读取 .claude/CLAUDE.md，然后开始新项目：我要做一个 [你的想法]"

# 示例
opencode "请读取 .claude/CLAUDE.md，然后开始新项目：我要做一个 AI 写作助手"
```

### 继续开发

```bash
opencode "请读取 .claude/CLAUDE.md 和当前项目的 PROJECT_STATE.md，然后继续上次的工作"
```

### 查看状态

```bash
opencode "请读取 PROJECT_STATE.md，列出当前进度和下一个 Task"
```

### 记录反馈（触发进化）

```bash
opencode "请读取 .claude/CLAUDE.md，然后用 /feedback 记录：我发现按钮颜色应该用 #1A1A2E 而不是 #2A2A3E"
```

### 查看进化建议

```bash
opencode "请读取 .claude/CLAUDE.md，然后运行 /evolve 查看进化建议"
```

---

## OpenCode 运行模式

### 交互模式（需要多轮对话时）

```bash
cd my-product
opencode --title "毒舌产品经理"
# 然后输入你的需求
```

### 单次任务模式（快速执行）

```bash
opencode run "读取 PROJECT-STATE.md，列出 Phase-1 的下一个未完成 Task" --workdir ~/my-product
```

### 附加上下文文件

```bash
opencode run "审查这段代码" -f src/components/Button.tsx --workdir ~/my-product
```

---

## 流程操作示例

### 完整流程：做一个 AI 写作助手

**Step 1: 启动并描述想法**

```bash
cd ~/my-product
opencode "请读取 .claude/CLAUDE.md，然后用 product-spec-builder 开始：我要做一个 AI 写作助手，帮助用户写小说"
```

opencode 会进入多轮追问模式（product-spec-builder）：

```
我: 我要做一个 AI 写作助手
opencode: 请问...（追问目标用户、功能范围、交互方式等）
我: [回答问题]
opencode: [继续追问或确认]
...
opencode: 已生成 PRODUCT-SPEC.md，开始 design-brief-builder？
我: 是
```

**Step 2: 设计规范**

opencode 用 design-brief-builder 追问视觉方向，生成 DESIGN-BRIEF.md。

**Step 3: 设计图**

opencode 调用 Pencil/Figma MCP（如已配置），或生成 HTML 原型。

**Step 4: 开发计划**

opencode 用 dev-planner 调研技术栈，拆分 Phase 和 Task，生成 DEV-PLAN.md。

**Step 5: 开发 + Review 循环**

```bash
opencode "请读取 DEV-PLAN.md，然后开始 Phase-1 的 Task-1.1"
```

每个 Task 完成后的流程是：
```
implementer 实现
    → code-reviewer Stage 1 (Spec 合规)
    → code-reviewer Stage 2 (代码质量)
    → 通过 → auto-push
    → 失败 → bug-fixer 修复 → 重新 Review
```

**Step 6: 发布**

```bash
opencode "Phase-1 所有 Task 完成，请运行 release-builder"
```

---

## Hooks 的 Git Hooks 配置

把 Harness 的 Hooks 接入 Git：

```bash
cd ~/my-product

# 复制 Hooks
cp ~/.hermes/agent-harness/hooks/pre-commit-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 编辑 .git/hooks/commit-msg（如果需要 auto-push）
cp ~/.hermes/agent-harness/hooks/auto-push.sh .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

---

## 手动触发特定 Skill

如果需要跳过流程直接用某个 Skill：

```bash
# 直接用某个 Skill
opencode "请用 dev-builder 实现 Task-1.3，读取 DEV-PLAN.md 获取详情"

# 直接用 bug-fixer
opencode "请用 bug-fixer 修这个 bug：[粘贴错误信息]"

# 直接用 code-review
opencode "请用 code-review 审查 src/pages/Home.tsx"
```

---

## Oh My OpenAgent 自定义命令

在 `~/.opencode/commands/` 下创建自定义命令（如果 oh-my-openagent 支持）：

```bash
# ~/.opencode/commands/harness-start.sh
#!/bin/bash
cd $(git rev-parse --show-toplevel)
opencode "读取 .claude/CLAUDE.md，然后用 product-spec-builder 开始：$1"
```

然后：

```bash
harness-start "我要做一个 AI 写作助手"
```

---

## 常见问题

**Q: opencode 不知道 CLAUDE.md 是什么**
A: 确保在项目根目录运行，且 `.claude/` 目录存在。opencode 会自动读取当前目录下的配置文件。

**Q: Hooks 没有自动触发**
A: 需要手动把 `.sh` 文件复制到 `.git/hooks/` 并加执行权限。

**Q: 设计图步骤卡住**
A: 确认 MCP 服务已配置。如果没有 Pencil/Figma MCP，design-maker 会 fallback 到生成 HTML/CSS 原型。

**Q: 跨 session 接续时 opencode 忘了之前的内容**
A: 这是正常行为。DEV-PLAN.md 是跨 session 的进度锚点，每次 `opencode "继续"` 时先读 PROJECT_STATE.md + DEV-PLAN.md 恢复上下文。

---

## 快速参考

| 操作 | 命令 |
|------|------|
| 开始新项目 | `opencode "读取 CLAUDE.md，开始：[想法]"` |
| 继续开发 | `opencode "继续上次的工作"` |
| 记录反馈 | `opencode "/feedback [修正内容]"` |
| 查看进化 | `opencode "/evolve"` |
| 查看状态 | `opencode "查看项目状态"` |
| 跳到某 Task | `opencode "执行 Task-X.Y"` |
| 修 bug | `opencode "用 bug-fixer 修：[错误]"` |
