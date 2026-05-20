import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';

interface StatusBarProps {
  line?: number;
  column?: number;
  encoding?: string;
  language?: string;
  isSaved?: boolean;
}

export function StatusBar({
  line = 1,
  column = 1,
  encoding = 'UTF-8',
  language = 'Markdown',
  isSaved = true,
}: StatusBarProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const bgSidebar = isDark ? COLORS.bgSidebar : '#F0F0F0';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';
  const border = COLORS.border;
  const success = COLORS.success;
  const warning = COLORS.warning;

  return (
    <div
      className="h-6 flex items-center px-2 text-[11px]"
      style={{ backgroundColor: bgSidebar, borderTop: `1px solid ${border}`, color: textSecondary }}
    >
      <span>
        Ln {line}, Col {column}
      </span>
      <span className="ml-4">{encoding}</span>
      <span className="ml-4">{language}</span>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <span className="text-[8px]" style={{ color: isSaved ? success : warning }}>
          ●
        </span>
        <span>{isSaved ? '已保存' : '保存中...'}</span>
      </div>
    </div>
  );
}