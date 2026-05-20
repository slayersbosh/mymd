import { useSettingsStore } from '@/stores';
import { COLORS } from '@/types';

interface TitleBarProps {
  title?: string;
  subtitle?: string;
}

export function TitleBar({ title = 'MyMD', subtitle = '— 跨平台 Markdown 编辑器' }: TitleBarProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const bgColor = isDark ? COLORS.bgSidebar : '#F0F0F0';
  const textColor = isDark ? COLORS.textPrimary : '#1A1A1A';
  const secondaryColor = isDark ? COLORS.textSecondary : '#666666';

  return (
    <div
      className="h-8 flex items-center px-4 select-none"
      style={{ backgroundColor: bgColor, borderBottom: `1px solid ${COLORS.border}` }}
      data-tauri-drag-region
    >
      <span className="text-[13px] font-semibold" style={{ color: textColor }}>
        {title}
      </span>
      <span className="text-[11px] ml-2" style={{ color: secondaryColor }}>
        {subtitle}
      </span>
    </div>
  );
}