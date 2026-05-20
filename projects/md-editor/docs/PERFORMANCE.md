# 性能优化指南

## 目标指标

| 指标 | 目标值 |
|------|--------|
| 冷启动时间 | < 2 秒 |
| 热启动时间 | < 500ms |
| 内存占用（空闲） | < 200MB |
| 包体积（安装后） | < 15MB |

---

## 1. 前端优化

### React 性能优化

#### Code Splitting (代码分割)
```typescript
// 按需加载非核心组件
const ExportPanel = React.lazy(() => import('./components/Export'));
const SearchPanel = React.lazy(() => import('./components/Search'));
```

#### 避免不必要的重渲染
```typescript
// 使用 React.memo 缓存组件
const MemoizedEditorView = React.memo(EditorView);

// 使用 useMemo 缓存计算结果
const renderedHtml = useMemo(() => renderMarkdown(content), [content]);

// 使用 useCallback 稳定回调引用
const handleSave = useCallback(() => { ... }, []);
```

#### 虚拟化长列表
```typescript
// 对于大纲视图等长列表，使用虚拟滚动
import { FixedSizeList } from 'react-window';
```

### Markdown 解析优化

#### 防抖渲染
```typescript
// 100ms 防抖避免频繁解析
const debouncedRender = useMemo(() => {
  let timeout: NodeJS.Timeout;
  return (content: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => setRenderedHtml(renderMarkdown(content)), 100);
  };
}, []);
```

#### 增量解析
- 对于大文档（>10000行），考虑增量解析
- 只解析可见区域的内容

### 资源优化

#### 图片懒加载
```typescript
<img loading="lazy" src={...} />
```

#### 字体优化
```css
/* 只加载使用的字符 */
font-display: swap;
```

---

## 2. Tauri/Rust 优化

### 启动优化

#### 禁用不必要的功能
```toml
# Cargo.toml
[dependencies]
tauri = { version = "2", features = ["custom-protocol"] } # 禁用默认协议
```

#### 预加载关键资源
```rust
// 在 main.rs 中预加载
fn main() {
    // 预加载窗口配置
    tauri::Builder::default()
        .setup(|app| {
            // 预加载文件系统
            // 预加载首屏数据
        })
}
```

### 文件系统优化

#### 异步读写
```rust
// commands.rs - 使用异步文件操作
#[tauri::command]
async fn read_file(file_path: String) -> Result<String, String> {
    tokio::fs::read_to_string(file_path).await
        .map_err(|e| e.to_string())
}
```

#### 增量读取（对于大文件）
```rust
// 只读取文件的前 N 行
#[tauri::command]
async fn read_file_head(file_path: String, lines: usize) -> Result<String, String> {
    let file = tokio::fs::File::open(&file_path).await?;
    let mut reader = BufReader::new(file);
    let mut result = String::new();
    for _ in 0..lines {
        let mut line = String::new();
        if reader.read_line(&mut line).await? == 0 {
            break;
        }
        result.push_str(&line);
    }
    Ok(result)
}
```

### 内存优化

#### 减少 WebView 内存占用
```json
// tauri.conf.json
{
  "app": {
    "windows": [{
      "webviewAttributes": {
        "backgroundColor": "#0D0D0D"
      }
    }]
  }
}
```

---

## 3. 包体积优化

### 依赖裁剪

#### 分析依赖
```bash
# 使用 cargo tree 分析 Rust 依赖
cargo tree --features
```

#### 移除未使用的 npm 包
```bash
# 分析未使用的包
npm prune --dry-run
```

### 代码压缩

#### Tailwind CSS 裁剪
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // 只包含使用的颜色
  theme: {
    extend: {
      colors: { /* 只包含设计稿颜色 */ }
    }
  },
  // 禁用未使用的变体
  corePlugins: { preflight: false }
}
```

#### Tree Shaking
```typescript
// 导入时使用具名导入
import { highlightCode } from '@/lib/markdown/highlight'; // ✅
import hljs from 'highlight.js'; // ❌ 导入全部
```

---

## 4. 启动速度优化

### 预加载策略

```typescript
// src/App.tsx
function App() {
  // 预加载核心组件
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    // 延迟加载非核心组件
    setTimeout(() => setShowEditor(true), 100);
  }, []);

  return showEditor ? <MainLayout /> : <LoadingScreen />;
}
```

### Tauri 配置优化

```json
// tauri.conf.json
{
  "build": {
    "devtools": false, // 生产环境禁用 devtools
    "minify": true
  },
  "app": {
    "windows": [{
      "visible": false, // 启动时隐藏，等 ready 后显示
      "waitingForInit": true
    }]
  }
}
```

---

## 5. 内存优化

### 监控内存使用

```typescript
// 添加内存监控
const useMemoryMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          console.log(`Heap Used: ${memory.usedJSHeapSize / 1024 / 1024} MB`);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);
};
```

### 及时释放资源

```typescript
// 清理不再使用的资源
useEffect(() => {
  const container = editorRef.current;

  return () => {
    // 清理事件监听器
    // 清理定时器
    // 清理大型数据结构
    if (container) {
      container.innerHTML = '';
    }
  };
}, []);
```

---

## 6. 性能测试

### 测试脚本

```typescript
// tests/performance.ts
describe('Performance', () => {
  it('should start within 2 seconds', async () => {
    const start = performance.now();
    // 启动应用
    const end = performance.now();
    expect(end - start).toBeLessThan(2000);
  });

  it('should use less than 200MB memory', async () => {
    const memory = (performance as any).memory;
    expect(memory.usedJSHeapSize).toBeLessThan(200 * 1024 * 1024);
  });
});
```

---

## 7. 持续监控

### 关键指标

1. **First Contentful Paint (FCP)** - 首屏绘制
2. **Time to Interactive (TTI)** - 可交互时间
3. **Total Blocking Time (TBT)** - 总阻塞时间
4. **Cumulative Layout Shift (CLS)** - 累积布局偏移

### 上报机制

```typescript
// 性能数据上报
const reportPerformance = (metric: string, value: number) => {
  // 上报到监控系统
  console.log(`[Performance] ${metric}: ${value}`);
};
```