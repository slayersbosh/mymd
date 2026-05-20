import { useState, useCallback, useEffect, useRef } from 'react';
import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';

interface SearchResult {
  line: number;
  column: number;
  match: string;
  context: string;
}

interface SearchPanelProps {
  content: string;
  onNavigate?: (line: number, column: number) => void;
  onClose?: () => void;
}

export function SearchPanel({ content, onNavigate, onClose }: SearchPanelProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRegex, setIsRegex] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const bgPanel = isDark ? COLORS.bgPanel : '#FFFFFF';
  const bgMain = isDark ? COLORS.bgMain : '#FAFAFA';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';
  const border = COLORS.border;
  const primary = COLORS.primary;
  const errorColor = COLORS.error;

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Perform search
  const performSearch = useCallback(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    try {
      const lines = content.split('\n');
      const searchResults: SearchResult[] = [];
      const regexFlags = isCaseSensitive ? 'g' : 'gi';
      const regex = isRegex
        ? new RegExp(query, regexFlags)
        : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), regexFlags);

      lines.forEach((line, lineIndex) => {
        let match;
        const lineNum = lineIndex + 1;

        // Reset regex lastIndex for global regex
        regex.lastIndex = 0;

        while ((match = regex.exec(line)) !== null) {
          searchResults.push({
            line: lineNum,
            column: match.index + 1,
            match: match[0],
            context: line.trim(),
          });

          // Prevent infinite loop for zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      });

      setResults(searchResults);
      setCurrentIndex(0);
      setError(null);

      // Navigate to first result
      if (searchResults.length > 0) {
        onNavigate?.(searchResults[0].line, searchResults[0].column);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex pattern');
      setResults([]);
    }
  }, [query, content, isRegex, isCaseSensitive, onNavigate]);

  // Handle search on query change
  useEffect(() => {
    const timer = setTimeout(performSearch, 200);
    return () => clearTimeout(timer);
  }, [query, isRegex, isCaseSensitive]);

  // Navigate to result
  const navigateToResult = (index: number) => {
    if (results.length === 0) return;
    const result = results[index];
    setCurrentIndex(index);
    onNavigate?.(result.line, result.column);
  };

  // Navigate prev/next
  const navigatePrev = () => {
    if (results.length === 0) return;
    const newIndex = (currentIndex - 1 + results.length) % results.length;
    navigateToResult(newIndex);
  };

  const navigateNext = () => {
    if (results.length === 0) return;
    const newIndex = (currentIndex + 1) % results.length;
    navigateToResult(newIndex);
  };

  // Replace single
  const replaceSingle = () => {
    if (results.length === 0 || !replaceText) return;

    // This is a simplified replace - in real implementation
    // would need to modify content through parent
    const result = results[currentIndex];
    console.log(`Replace at line ${result.line}, col ${result.column}: "${result.match}" -> "${replaceText}"`);
  };

  // Replace all
  const replaceAll = () => {
    if (!replaceText) return;
    console.log(`Replace all "${query}" with "${replaceText}"`);
  };

  return (
    <div
      className="w-full rounded-lg overflow-hidden shadow-xl"
      style={{ backgroundColor: bgPanel, border: `1px solid ${border}` }}
    >
      {/* Header */}
      <div
        className="h-10 px-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span className="text-[14px] font-medium" style={{ color: textPrimary }}>
          搜索
        </span>
        <span
          className="text-[18px] cursor-pointer hover:opacity-70"
          style={{ color: textSecondary }}
          onClick={onClose}
        >
          ×
        </span>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入搜索内容..."
            className="flex-1 h-8 px-3 rounded text-[13px] outline-none"
            style={{
              backgroundColor: bgMain,
              color: textPrimary,
              border: `1px solid ${border}`,
            }}
          />
          <span className="text-[12px]" style={{ color: textSecondary }}>
            {results.length} 个结果
          </span>
        </div>

        {error && (
          <div className="text-[11px] mb-2" style={{ color: errorColor }}>
            {error}
          </div>
        )}

        {/* Options */}
        <div className="flex items-center gap-4 mb-2">
          <label className="flex items-center gap-1 text-[12px] cursor-pointer" style={{ color: textSecondary }}>
            <input
              type="checkbox"
              checked={isRegex}
              onChange={(e) => setIsRegex(e.target.checked)}
              className="w-3 h-3"
            />
            正则
          </label>
          <label className="flex items-center gap-1 text-[12px] cursor-pointer" style={{ color: textSecondary }}>
            <input
              type="checkbox"
              checked={isCaseSensitive}
              onChange={(e) => setIsCaseSensitive(e.target.checked)}
              className="w-3 h-3"
            />
            区分大小写
          </label>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 mb-3">
          <button
            className="px-2 py-1 rounded text-[11px]"
            style={{ backgroundColor: bgMain, color: textSecondary }}
            onClick={navigatePrev}
          >
            ↑
          </button>
          <span className="text-[11px]" style={{ color: textSecondary }}>
            {results.length > 0 ? `${currentIndex + 1}/${results.length}` : '0/0'}
          </span>
          <button
            className="px-2 py-1 rounded text-[11px]"
            style={{ backgroundColor: bgMain, color: textSecondary }}
            onClick={navigateNext}
          >
            ↓
          </button>
        </div>

        {/* Replace */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="替换为..."
            className="flex-1 h-8 px-3 rounded text-[13px] outline-none"
            style={{
              backgroundColor: bgMain,
              color: textPrimary,
              border: `1px solid ${border}`,
            }}
          />
          <button
            className="px-3 h-8 rounded text-[12px]"
            style={{ backgroundColor: border, color: textPrimary }}
            onClick={replaceSingle}
          >
            替换
          </button>
          <button
            className="px-3 h-8 rounded text-[12px]"
            style={{ backgroundColor: primary, color: '#FFFFFF' }}
            onClick={replaceAll}
          >
            全部
          </button>
        </div>
      </div>

      {/* Results List */}
      {results.length > 0 && (
        <div
          className="max-h-[200px] overflow-y-auto"
          style={{ borderTop: `1px solid ${border}` }}
        >
          {results.slice(0, 50).map((result, index) => (
            <div
              key={`${result.line}-${result.column}`}
              className="px-3 py-2 cursor-pointer flex items-center gap-2"
              style={{
                backgroundColor: index === currentIndex ? 'rgba(255,107,0,0.15)' : 'transparent',
                borderBottom: `1px solid ${border}`,
              }}
              onClick={() => navigateToResult(index)}
            >
              <span className="text-[10px]" style={{ color: textSecondary }}>
                {result.line}:{result.column}
              </span>
              <span className="text-[12px] truncate" style={{ color: textPrimary }}>
                {result.context}
              </span>
            </div>
          ))}
          {results.length > 50 && (
            <div className="px-3 py-2 text-[11px]" style={{ color: textSecondary }}>
              还有 {results.length - 50} 个结果...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for managing search shortcut
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
}