import { useState } from 'react';
import { EditorView } from './EditorView';
import { MermaidRenderer } from '../MermaidRenderer';

const DEMO_CONTENT = `# 产品需求文档

这是一个关于跨平台 Markdown 编辑器的需求文档。核心功能包括即时渲染、代码高亮、Mermaid 图表支持。

## 技术架构

**技术栈:**
- Tauri 2.x (跨平台桌面)
- React 18 (UI框架)
- markdown-it (Markdown解析)
- highlight.js (代码高亮)

### 代码示例

\`\`\`javascript
const greeting = "Hello, MyMD!";
console.log(greeting);
\`\`\`

### 功能列表

1. 即时渲染编辑
2. 代码语法高亮
3. Mermaid 图表
4. 多格式导出

### 流程图示例

\`\`\`mermaid
flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[处理中]
    B -->|否| D[结束]
    C --> D
\`\`\`

### 时序图示例

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant E as 编辑器
    participant F as 文件系统
    U->>E: 打开文件
    E->>F: 读取文件
    F-->>E: 文件内容
    E-->>U: 显示内容
\`\`\`

> 这是一个引用块，用于强调重要内容。

[访问 GitHub](https://github.com)

---

*最后更新: 2026-05-20*
`;

export function EditorContent() {
  const [content] = useState(DEMO_CONTENT);
  const [isSourceMode, setIsSourceMode] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <MermaidRenderer>
        <EditorView
          content={content}
          isSourceMode={isSourceMode}
          onSourceModeToggle={() => setIsSourceMode(!isSourceMode)}
        />
      </MermaidRenderer>
    </div>
  );
}