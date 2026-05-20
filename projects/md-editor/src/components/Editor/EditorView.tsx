import { useState, useRef, useEffect, useCallback } from 'react';
import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';
import { renderMarkdown } from '@/lib/markdown/parser';

interface EditorViewProps {
  content?: string;
  onChange?: (content: string) => void;
  isSourceMode?: boolean;
  onSourceModeToggle?: () => void;
}

export function EditorView({ content = '', onChange, isSourceMode = false, onSourceModeToggle }: EditorViewProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const [localContent, setLocalContent] = useState(content);
  const [renderedHtml, setRenderedHtml] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const bgMain = isDark ? COLORS.bgMain : '#FAFAFA';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';
  const bgSidebar = isDark ? COLORS.bgSidebar : '#F0F0F0';
  const border = COLORS.border;

  // Debounced render
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const html = renderMarkdown(localContent);
      setRenderedHtml(html);
    }, 100);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localContent]);

  // Handle textarea input
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalContent(value);
    onChange?.(value);
  }, [onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertFormat('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertFormat('*', '*');
          break;
        case 's':
          e.preventDefault();
          // Save action
          break;
        case '/':
          e.preventDefault();
          onSourceModeToggle?.();
          break;
      }
    }
  }, [onSourceModeToggle]);

  // Insert formatting around selection
  const insertFormat = useCallback((before: string, after: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);

    const newContent = localContent.substring(0, start) + before + selectedText + after + localContent.substring(end);
    setLocalContent(newContent);
    onChange?.(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [localContent, onChange]);

  // Toggle source mode
  if (isSourceMode) {
    return (
      <div className="flex-1 flex flex-col" style={{ backgroundColor: bgMain }}>
        <textarea
          ref={editorRef}
          className="flex-1 p-10 resize-none focus:outline-none"
          style={{
            backgroundColor: bgMain,
            color: textPrimary,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '14px',
            lineHeight: '1.8',
            maxWidth: '900px',
            width: '100%',
          }}
          value={localContent}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="输入 Markdown 内容..."
          spellCheck={false}
        />
      </div>
    );
  }

  // Render mode (instant rendering)
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: bgMain }}>
      {/* Rendered Content */}
      <div
        ref={contentRef}
        className="flex-1 p-10 overflow-y-auto"
        style={{ color: textPrimary }}
      >
        <div
          className="markdown-body max-w-[900px]"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      {/* Source Mode Toggle Hint */}
      <div
        className="h-8 flex items-center justify-center text-[11px] cursor-pointer"
        style={{ backgroundColor: bgSidebar, color: textSecondary, borderTop: `1px solid ${border}` }}
        onClick={onSourceModeToggle}
      >
        按 Ctrl+/ 切换源码模式
      </div>
    </div>
  );
}

// Simple textarea-only mode for source editing
export function SourceEditor({ content = '', onChange }: { content?: string; onChange?: (content: string) => void }) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const [localContent, setLocalContent] = useState(content);
  const bgMain = isDark ? COLORS.bgMain : '#FAFAFA';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';

  return (
    <textarea
      className="flex-1 p-10 resize-none focus:outline-none"
      style={{
        backgroundColor: bgMain,
        color: textPrimary,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '14px',
        lineHeight: '1.8',
        maxWidth: '900px',
        width: '100%',
      }}
      value={localContent}
      onChange={(e) => {
        setLocalContent(e.target.value);
        onChange?.(e.target.value);
      }}
      placeholder="输入 Markdown 内容..."
      spellCheck={false}
    />
  );
}