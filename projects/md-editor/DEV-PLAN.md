# MyMD — DEV-PLAN

> 跨 session 接续开发的进度锚点。新开对话时，AI 读一遍此文档即知道从哪继续。

---

## 当前 Phase: Phase-3 完成（所有 Phase 已完成）

---

## 1. 技术选型

| 组件 | 技术 | 说明 |
|------|------|------|
| 桌面框架 | **Tauri 2.x** | 跨平台（Win/Mac/Linux），体积小，原生性能 |
| 前端框架 | **React 18 + TypeScript** | Vite 构建 |
| Markdown 解析 | **markdown-it** | 支持插件扩展 |
| 代码高亮 | **highlight.js** | 190+ 语言支持 |
| 图表渲染 | **mermaid.js** | flowchart, sequence, gantt |
| 状态管理 | **Zustand** | 轻量，TypeScript 友好 |
| 样式 | **Tailwind CSS** | 快速开发 |
| 文件导出 | PDF/HTML/Word/EPUB | 见导出模块技术调研 |

### 技术约束

- **Rust** (Tauri 后端): 处理文件系统和原生对话框
- **WebView2** (Windows): Tauri 默认嵌入，无需预装
- **Node.js** (前端构建): Vite 配合 tauri-cli

---

## 2. 项目结构

```
src/                          # 前端 React 代码
├── main.tsx                  # 应用入口
├── App.tsx                   # 根组件
├── components/
│   ├── Layout/               # 布局组件
│   │   ├── TitleBar.tsx      # 标题栏
│   │   ├── Sidebar.tsx       # 侧边栏（文件树）
│   │   ├── TabBar.tsx        # 标签栏
│   │   └── StatusBar.tsx     # 状态栏
│   ├── Editor/               # 编辑器核心
│   │   ├── EditorView.tsx    # 即时渲染编辑器
│   │   ├── Toolbar.tsx       # 工具栏
│   │   └── Outline.tsx       # 大纲视图
│   ├── Export/               # 导出面板
│   │   └── ExportPanel.tsx
│   └── Settings/             # 设置面板
├── lib/
│   ├── markdown/
│   │   ├── parser.ts         # markdown-it 配置
│   │   ├── plugins/
│   │   │   ├── codeHighlight.ts
│   │   │   └── mermaid.ts
│   ├── export/
│   │   ├── toPdf.ts
│   │   ├── toHtml.ts
│   │   ├── toDocx.ts
│   │   └── toEpub.ts
│   └── fs/                   # Tauri 文件系统封装
├── stores/
│   ├── editorStore.ts        # 编辑器状态
│   ├── fileStore.ts          # 文件树状态
│   └── settingsStore.ts     # 设置状态
├── styles/
│   └── globals.css           # 全局样式 + Tailwind
└── types/
    └── index.ts              # 类型定义

src-tauri/                    # Tauri Rust 后端
├── src/
│   ├── main.rs               # 入口
│   ├── commands.rs          # Tauri 命令
│   └── lib.rs
├── Cargo.toml
└── tauri.conf.json

白皮书/
├── PRODUCT-SPEC.md
├── DESIGN-BRIEF.md
└── DEV-PLAN.md
```

---

## 3. Phase 划分

### Phase-1: 核心 MVP ✓ (当前)
**目标**: 可运行的编辑器，支持主要编辑流程

| Task | 名称 | 交付 | 依赖 |
|------|------|------|------|
| Task-1.1 | 项目脚手架 | Tauri + React 空项目，编译通过 | — |
| Task-1.2 | 布局框架 | 标题栏+侧边栏+标签栏+编辑器+状态栏 | Task-1.1 |
| Task-1.3 | 即时渲染编辑器 | markdown-it 即时渲染，源码切换 | Task-1.2 |
| Task-1.4 | 代码高亮 | highlight.js 集成，20+语言 | Task-1.3 |
| Task-1.5 | 本地文件管理 | 打开文件夹、文件树、新建/删除/重命名 | Task-1.2 |
| Task-1.6 | 深浅主题切换 | 主题切换，持久化 | Task-1.2 |

**预计 6 个 Task**

---

### Phase-2: 功能完善
**目标**: Mermaid 图表、多格式导出、搜索、大纲

| Task | 名称 | 交付 | 依赖 |
|------|------|------|------|
| Task-2.1 | Mermaid 图表 | 代码块内联渲染 flowchart/sequence | Task-1.4 |
| Task-2.2 | PDF 导出 | 导出为 PDF，保留样式 | Task-1.4 |
| Task-2.3 | HTML/Word 导出 | HTML 单文件 + .docx | Task-2.2 |
| Task-2.4 | 搜索与替换 | Ctrl+F 当前文档，正则替换 | Task-1.3 |
| Task-2.5 | 大纲视图 | 标题树形结构，点击跳转 | Task-1.3 |

**预计 5 个 Task**

---

### Phase-3: 稳定与发布
**目标**: 自动保存、性能优化、打包发布

| Task | 名称 | 交付 | 依赖 |
|------|------|------|------|
| Task-3.1 | 自动保存 | 30秒定时保存，崩溃恢复 | Task-1.5 |
| Task-3.2 | 标签与元数据 | YAML front matter，标签筛选 | Task-1.5 |
| Task-3.3 | 性能优化 | 启动 < 2s，内存 < 200MB | Phase-1/2 |
| Task-3.4 | Windows 打包 | .exe 安装包，签名 | Task-3.1 |
| Task-3.5 | macOS/Linux 打包 | .dmg / .AppImage | Task-3.4 |

**预计 5 个 Task**

---

## 4. Task 详细分解

### Task-1.1: 项目脚手架

**交付物**:
- `package.json` (React 18 + Vite + TypeScript)
- `src-tauri/Cargo.toml` (Tauri 2.x)
- `src/main.tsx` (空白的 React 入口)
- `src/App.tsx` (根组件)
- 编译通过，可 `npm run tauri dev` 启动

**验收标准**:
- [ ] `npm install` 成功，无 peer dependency 警告
- [ ] `npm run tauri dev` 启动 Tauri 窗口
- [ ] 窗口显示 React 默认页面
- [ ] 无 TypeScript 编译错误

**技术要点**:
- Tauri 2.x 相比 1.x: 使用 `tauri.conf.json` 而不是 `tauri.conf.js`
- WebView2 自动嵌入（Windows），无需用户预装
- Vite 配置: `@vitejs/plugin-react`

---

### Task-1.2: 布局框架

**交付物**:
- `TitleBar.tsx` — 32px，应用名 + 窗口控制占位
- `Sidebar.tsx` — 240px 宽，文件树组件
- `TabBar.tsx` — 36px，文件标签
- `StatusBar.tsx` — 24px，行号/编码/保存状态
- `MainLayout.tsx` — 组合以上组件

**验收标准**:
- [ ] 标题栏高度 32px，深色背景 `#141414`
- [ ] 侧边栏宽度 240px，可折叠
- [ ] 标签栏高度 36px，支持多标签
- [ ] 状态栏高度 24px，显示 `Ln X, Col Y`
- [ ] 响应式：无内容时居中显示

**技术要点**:
- Tailwind CSS 配置自定义颜色变量（DESIGN-BRIEF 颜色）
- 侧边栏可拖拽调整宽度（180-400px）
- 窗口控制按钮（Windows 风格）

---

### Task-1.3: 即时渲染编辑器

**交付物**:
- `EditorView.tsx` — 基于 contenteditable 的渲染层
- `Toolbar.tsx` — 格式化按钮（B/I/H1/H2/链接/图片/代码/图表）
- 快捷键支持: `Ctrl+B` 粗体, `Ctrl+I` 斜体, `Ctrl+/` 源码模式

**验收标准**:
- [ ] 输入 `# 标题` 立即显示大字标题（非源码）
- [ ] 输入 `**粗体**` 立即显示粗体效果
- [ ] 输入 `[链接](url)` 立即显示可点击链接
- [ ] 光标可在渲染内容中移动并继续编辑
- [ ] `Ctrl+/` 切换源码模式（显示原始 Markdown）
- [ ] 支持拖拽调整编辑器宽度

**技术要点**:
- 使用 `markdown-it` 解析，配置 `html: true, linkify: true`
- 编辑区域: `contenteditable` + 光标位置追踪
- 渲染策略: 用户停止输入 100ms 后触发解析（防抖）
- 源码模式: 切换为 `<textarea>`，保留光标位置

---

### Task-1.4: 代码高亮

**交付物**:
- `highlight.js` 集成到 markdown-it 插件
- 代码块样式（深色背景、行号、复制按钮）
- 20+ 语言支持

**验收标准**:
- [ ] ` ```javascript ` 代码块语法高亮
- [ ] 代码块背景 `#1E1E1E`，圆角 6px
- [ ] 复制按钮（右上角），点击复制到剪贴板
- [ ] 行号显示
- [ ] 支持语言: JS/TS/Python/Go/Rust/Java/C++/SQL/Bash 等

**技术要点**:
- `highlight.js` 主题: 自定义深色主题（匹配 DESIGN-BRIEF）
- markdown-it 插件: `markdown-it-highlight.js` 或手写插件
- 复制功能: `navigator.clipboard.writeText`

---

### Task-1.5: 本地文件管理

**交付物**:
- 文件树组件（文件夹展开/折叠、文件图标）
- 新建文件、删除文件、重命名文件
- 打开文件夹对话框（Tauri 原生）
- 实时监听文件变化（文件系统watch）

**验收标准**:
- [ ] "打开文件夹" 按钮，调用 Tauri 对话框选择目录
- [ ] 侧边栏显示文件夹树结构
- [ ] 双击 .md 文件在标签栏打开
- [ ] 右键菜单: 新建/删除/重命名
- [ ] 删除文件确认提示
- [ ] 新文件自动打开标签页

**技术要点**:
- Tauri 命令: `read_dir`, `read_file`, `write_file`, `remove_file`, `rename_file`
- 文件树数据结构: 递归目录树
- 状态管理: `fileStore.ts` 管理当前工作区和打开的文件

---

### Task-1.6: 深浅主题切换

**交付物**:
- 主题切换按钮（标题栏或设置面板）
- CSS 变量定义深色/浅色两套配色
- 主题偏好持久化（localStorage）

**验收标准**:
- [ ] 切换主题时整个应用立即响应
- [ ] 深色主题: 背景 `#0D0D0D`，橙黄色强调
- [ ] 浅色主题: 背景 `#FAFAFA`，橙黄色强调
- [ ] 刷新页面保持上次主题

**技术要点**:
- Tailwind CSS + CSS 变量
- `<html class="dark">` 或 `<html class="light">`
- `localStorage.setItem('theme', 'dark')`

---

## 5. 导出模块技术调研

### PDF 导出

| 方案 | 优点 | 缺点 |
|------|------|------|
| `html2pdf.js` | 简单，浏览器端 | 样式丢失 |
| `jspdf` + `html2canvas` | 较成熟 | 复杂，内存占用 |
| Tauri PDF 插件 `@tauri-apps/plugin-print` | 原生，样式保留 | 依赖系统 |

**推荐**: `@tauri-apps/plugin-print`（Tauri 2.x 内置）或 `html2pdf.js` 作为 fallback

### HTML 导出

- 使用 `markdown-it` 输出 HTML 字符串
- 内联 CSS 样式（自包含单文件）
- 代码高亮样式内联

### Word (.docx) 导出

| 方案 | 优点 | 缺点 |
|------|------|------|
| `docx` npm 包 | 纯 JS，简单 | 不支持复杂样式 |
| `mammoth` | 保留样式较好 | 复杂 |

**推荐**: `docx` 库，简单文本导出

### EPUB 导出

- `epub-gen` npm 包
- 需要处理 YAML front matter 为 metadata

**推荐**: Phase-2 后期实现，优先级 P1

---

## 6. Phase 依赖图

```
Phase-1 ──────────────────────────────→ Phase-2 ──────────────────────────────→ Phase-3
                                       │
Task-1.1 ─→ Task-1.2 ───────────────→ Task-1.3 ───────────────→ Task-1.4 ────┐
                                       │                      │                │
                                       ↓                      ↓                ↓
                                   Task-1.5              Task-1.6            ...
                                   (文件管理)            (主题)
                                       │
                                       ↓
                              Task-2.1 (Mermaid)
                              Task-2.2 (PDF导出)
                              Task-2.3 (HTML/Word)
                              Task-2.4 (搜索)
                              Task-2.5 (大纲)
```

---

## 7. 验收流程

每个 Task 完成时：
1. 代码符合 DESIGN-BRIEF.md 视觉规范
2. Tauri 编译无错误
3. 功能本身可运作（手动验证）
4. 更新 DEV-PLAN.md 进度

---

## 8. 已知风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| 即时渲染编辑器复杂度 | 高 | 使用 contenteditable 而非自研渲染引擎 |
| Tauri 文件系统权限 | 中 | 配置 `fs` 权限，正确请求用户授权 |
| Mermaid 渲染性能 | 中 | 代码块懒加载，滚动时按需渲染 |

---

*最后更新: 2026-05-20*
*当前进度: Phase-1, Task-1.1 未开始*