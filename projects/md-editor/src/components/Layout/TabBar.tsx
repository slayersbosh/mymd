import { useSettingsStore } from '@/stores';
import { COLORS } from '@/types';

interface Tab {
  id: string;
  fileName: string;
  isActive?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
}

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose }: TabBarProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const bgPanel = isDark ? COLORS.bgPanel : '#FFFFFF';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';
  const border = COLORS.border;

  return (
    <div
      className="h-9 flex items-center px-2 gap-1"
      style={{ backgroundColor: bgPanel, borderBottom: `1px solid ${border}` }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="h-7 px-3 flex items-center gap-1.5 text-[12px] rounded cursor-pointer transition-colors duration-150"
          style={{
            backgroundColor: tab.id === activeTabId ? 'rgba(255,107,0,0.15)' : 'transparent',
            color: tab.id === activeTabId ? textPrimary : textSecondary,
          }}
          onClick={() => onTabClick?.(tab.id)}
        >
          <span>{tab.fileName}</span>
          <span
            className="hover:opacity-80"
            style={{ color: textSecondary }}
            onClick={(e) => {
              e.stopPropagation();
              onTabClose?.(tab.id);
            }}
          >
            ×
          </span>
        </div>
      ))}
    </div>
  );
}