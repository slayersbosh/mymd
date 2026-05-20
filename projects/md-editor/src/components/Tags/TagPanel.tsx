import React, { useMemo, useState } from 'react';
import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';

interface TagPanelProps {
  allTags: { name: string; count: number }[];
  selectedTags: string[];
  onTagClick?: (tag: string) => void;
  onClearFilter?: () => void;
}

export function TagPanel({ allTags, selectedTags, onTagClick, onClearFilter }: TagPanelProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const bgSidebar = isDark ? COLORS.bgSidebar : '#F0F0F0';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';
  const border = COLORS.border;
  const primary = COLORS.primary;

  void bgSidebar; void textSecondary; // suppress unused warnings

  const sortedTags = useMemo(() => {
    return [...allTags].sort((a, b) => b.count - a.count);
  }, [allTags]);

  if (sortedTags.length === 0) {
    return (
      <div
        className="w-full p-3 text-center"
        style={{ color: textSecondary, fontSize: '12px' }}
      >
        暂无标签
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="h-8 px-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span className="text-[11px] font-medium" style={{ color: textSecondary }}>
          标签
        </span>
        {selectedTags.length > 0 && (
          <span
            className="text-[10px] cursor-pointer hover:opacity-70"
            style={{ color: primary }}
            onClick={onClearFilter}
          >
            清除筛选
          </span>
        )}
      </div>

      {/* Tags List */}
      <div className="p-2 flex flex-wrap gap-1">
        {sortedTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);

          return (
            <div
              key={tag.name}
              className="px-2 py-1 rounded cursor-pointer transition-colors text-[11px]"
              style={{
                backgroundColor: isSelected ? 'rgba(255,107,0,0.2)' : COLORS.bgMain,
                color: isSelected ? primary : textPrimary,
                border: `1px solid ${isSelected ? primary : border}`,
              }}
              onClick={() => onTagClick?.(tag.name)}
            >
              {tag.name}
              <span className="ml-1" style={{ color: textSecondary }}>
                ({tag.count})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tag input component for adding tags to a document
interface TagInputProps {
  tags: string[];
  suggestions?: string[];
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
}

export function TagInput({ tags, suggestions = [], onAddTag, onRemoveTag }: TagInputProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const bgPanel = isDark ? COLORS.bgPanel : '#FFFFFF';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const border = COLORS.border;
  const primary = COLORS.primary;

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onAddTag?.(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="px-2 py-1 rounded flex items-center gap-1 text-[11px]"
            style={{
              backgroundColor: 'rgba(255,107,0,0.15)',
              color: primary,
            }}
          >
            <span>{tag}</span>
            <span
              className="cursor-pointer hover:opacity-70"
              onClick={() => onRemoveTag?.(tag)}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="添加标签..."
        className="w-full h-8 px-3 rounded text-[12px] outline-none"
        style={{
          backgroundColor: bgPanel,
          color: textPrimary,
          border: `1px solid ${border}`,
        }}
      />

      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded shadow-lg overflow-hidden z-10"
          style={{ backgroundColor: bgPanel, border: `1px solid ${border}` }}
        >
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <div
              key={suggestion}
              className="px-3 py-2 cursor-pointer text-[12px]"
              style={{ color: textPrimary }}
              onMouseDown={() => {
                onAddTag?.(suggestion);
                setInputValue('');
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}