import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores';
import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';
import { renderMarkdown } from '@/lib/markdown/parser';
import { writeFile } from '@/lib/tauri';
import { useAutosave } from '@/lib/autosave';

export function EditorContent() {
  const { tabs, currentTabId, updateTabContent, updateCursorPosition, markSaved, setSaving, scrollToLine } = useEditorStore();
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const currentTab = tabs.find(t => t.id === currentTabId);
  const content = currentTab?.content || '';
  const filePath = currentTab?.filePath || '';

  const [localContent, setLocalContent] = useState(content);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Autosave hook - 30 second interval
  useAutosave(
    content,
    filePath,
    async (contentToSave) => {
      setSaving(true);
      await writeFile(filePath, contentToSave);
      markSaved();
      setSaving(false);
    },
    30000
  );

  // Initialize history when content changes from store (e.g., tab switch)
  useEffect(() => {
    if (content && (history.length === 0 || history[history.length - 1] !== content)) {
      setHistory([content]);
      setHistoryIndex(0);
    }
  }, [content]);

  // Push to history when local content changes significantly (not during typing)
  useEffect(() => {
    if (localContent === content) return;

    const lastHistory = history[historyIndex];
    // Only add to history if content differs significantly (e.g., after format or paste)
    if (!lastHistory || Math.abs(localContent.length - lastHistory.length) > 5) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(localContent);
      // Keep history limited to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [localContent]);

  // Handle scroll to line from outline navigation
  useEffect(() => {
    if (scrollToLine !== null && editorRef.current) {
      const textarea = editorRef.current;
      const lines = localContent.split('\n');
      let charCount = 0;
      for (let i = 0; i < scrollToLine - 1 && i < lines.length; i++) {
        charCount += lines[i].length + 1; // +1 for newline
      }
      textarea.focus();
      textarea.setSelectionRange(charCount, charCount);
    }
  }, [scrollToLine, localContent]);

  // Handle textarea scroll to track cursor position
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    if (currentTabId) {
      updateCursorPosition(currentTabId, line, column);
    }
  }, [currentTabId, updateTabContent]);

  useEffect(() => {
    setLocalContent(content);
    setRenderedHtml(renderMarkdown(content));
  }, [content, currentTabId]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setRenderedHtml(renderMarkdown(localContent));
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localContent]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalContent(value);
    if (currentTabId) {
      updateTabContent(currentTabId, value);
    }
  }, [currentTabId, updateTabContent]);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          if (filePath && currentTabId) {
            try {
              await writeFile(filePath, localContent);
              markSaved();
            } catch (err) {
              console.error('Save failed:', err);
            }
          }
          break;
        case 'z':
          // Undo
          e.preventDefault();
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const prevContent = history[newIndex];
            setHistoryIndex(newIndex);
            setLocalContent(prevContent);
            if (currentTabId) {
              updateTabContent(currentTabId, prevContent);
            }
          }
          break;
        case 'y':
          // Redo
          e.preventDefault();
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextContent = history[newIndex];
            setHistoryIndex(newIndex);
            setLocalContent(nextContent);
            if (currentTabId) {
              updateTabContent(currentTabId, nextContent);
            }
          }
          break;
        case 'b':
          e.preventDefault();
          insertFormat('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertFormat('*', '*');
          break;
      }
    }
  }, [filePath, currentTabId, localContent, markSaved, history, historyIndex, updateTabContent]);

  const insertFormat = useCallback((before: string, after: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);

    const newContent = localContent.substring(0, start) + before + selectedText + after + localContent.substring(end);
    setLocalContent(newContent);
    if (currentTabId) {
      updateTabContent(currentTabId, newContent);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [localContent, currentTabId, updateTabContent]);

  const bgMain = isDark ? COLORS.bgMain : '#FAFAFA';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const border = COLORS.border;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: bgMain }}>
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col" style={{ borderRight: `1px solid ${border}` }}>
        <textarea
          ref={editorRef}
          className="flex-1 p-4 resize-none focus:outline-none overflow-y-auto"
          style={{
            backgroundColor: bgMain,
            color: textPrimary,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '15px',
            lineHeight: '1.8',
          }}
          value={localContent}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onSelect={handleScroll}
          onClick={handleScroll}
          placeholder="输入 Markdown 内容..."
          spellCheck={false}
        />
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 p-4 overflow-y-auto"
          style={{ color: textPrimary }}
        >
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
    </div>
  );
}