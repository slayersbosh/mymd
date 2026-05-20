import { useMemo } from 'react';
import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';

interface Heading {
  level: number;
  text: string;
  line: number;
}

interface OutlineViewProps {
  content: string;
  onHeadingClick?: (line: number) => void;
  activeHeadingLine?: number | null;
}

export function OutlineView({ content, onHeadingClick, activeHeadingLine = null }: OutlineViewProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const headings = useMemo(() => {
    const lines = content.split('\n');
    const result: Heading[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        result.push({
          level: match[1].length,
          text: match[2].trim(),
          line: index + 1,
        });
      }
    });

    return result;
  }, [content]);

  const bgPanel = isDark ? COLORS.bgPanel : '#FFFFFF';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';
  const border = COLORS.border;
  const primary = COLORS.primary;

  void bgPanel; void border; // suppress unused warnings

  if (headings.length === 0) {
    return (
      <div
        className="w-full p-4 text-center"
        style={{ color: textSecondary, fontSize: '12px' }}
      >
        暂无标题
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto">
      {headings.map((heading, index) => {
        const isActive = activeHeadingLine === heading.line;

        return (
          <div
            key={`${heading.line}-${index}`}
            className="w-full cursor-pointer transition-colors duration-150"
            style={{
              paddingLeft: `${(heading.level - 1) * 12 + 12}px`,
              paddingTop: '6px',
              paddingBottom: '6px',
              backgroundColor: isActive ? 'rgba(255,107,0,0.15)' : 'transparent',
              borderLeft: isActive ? `2px solid ${primary}` : '2px solid transparent',
            }}
            onClick={() => onHeadingClick?.(heading.line)}
          >
            <div
              className="text-[12px] truncate"
              style={{
                color: isActive ? primary : textPrimary,
                fontWeight: heading.level <= 2 ? '600' : '400',
              }}
            >
              {heading.text}
            </div>
            <div
              className="text-[10px] mt-0.5"
              style={{ color: textSecondary }}
            >
              行 {heading.line}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Hook to track active heading based on scroll position
export function useActiveHeading(headings: Heading[], scrollTop: number) {
  void headings; void scrollTop; // suppress unused warnings
  // This would be connected to scroll position in real implementation
  // For now, return null (no active heading)
  return null;
}