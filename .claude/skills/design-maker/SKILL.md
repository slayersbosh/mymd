---
name: design-maker
description: 设计图制作 — 通过 MCP 连接 Pencil/Figma 生成完整页面原型图
trigger: design-brief-builder 完成后触发
prerequisite: DESIGN-BRIEF.md 已存在，MCP 服务已配置
category: agent-harness/skills
---

# design-maker

## 目的

没有设计图的 Vibe Coding，出来的东西大概率不好看。这个 Skill 通过 MCP 连接设计工具，生成完整的、可视化的页面原型图。**设计稿是整个流程中权重最高的产出物。**

## 输入

- DESIGN-BRIEF.md
- PRODUCT-SPEC.md
- MCP 配置（Pencil 或 Figma）

## 输出

设计工具中的完整页面原型图（线框图 + 视觉稿）

## 执行流程

### Step 1: 确认 MCP 连接

```bash
# 检查 MCP 服务状态
mcp list
# 确认 pencil 或 figma MCP 已配置
```

### Step 2: 页面清单梳理

根据 PRODUCT-SPEC.md 梳理所有页面：

```
pages/
├── 首页 (index)
├── 功能页 A (feature-a)
├── 功能页 B (feature-b)
├── 设置页 (settings)
└── 错误页 (error)
```

### Step 3: 分页面生成

每个页面按以下顺序生成：

1. **布局结构** — 容器、导航、内容区
2. **组件放置** — 按 DESIGN-BRIEF.md 规范
3. **交互标注** — 点击区域、跳转关系
4. **视觉细节** — 配色、字体、间距

### Step 4: 设计图标注

每个页面在设计稿中添加注释层：

- 页面名称和路径
- 对应的 Spec 功能编号
- 状态说明（默认/空/错误/加载）

## 验收标准

- 所有 PRODUCT-SPEC.md 中的页面都有对应设计图
- 每个页面有至少一个交互流程演示
- 设计图与 DESIGN-BRIEF.md 完全一致
- 设计图存储在设计工具中，可通过 MCP 访问

## 视觉优先级（核心原则）

> **有设计图时，一切 UI 以设计图为准。**
> 冲突时：设计图 > DESIGN-BRIEF.md > PRODUCT-SPEC.md

## MCP 命令参考

```javascript
// Pencil MCP 示例
pencil.createPage({ name: "首页", width: 1440, height: 900 })
pencil.addRectangle({ x: 0, y: 0, width: 1440, height: 80, fill: "#1A1A2E" })
pencil.addText({ x: 24, y: 24, text: "Logo", fontSize: 16 })

// Figma MCP 示例
figma.createFrame({ name: "首页", width: 1440, height: 900 })
figmaRectangle: { x: 0, y: 0, width: 1440, height: 80, fill: "#1A1A2E" }
```

## 错误处理

- MCP 连接失败 → 使用代码生成 HTML/CSS 原型作为 fallback
- 设计工具崩溃 → 从最新备份恢复，同时生成代码版原型
