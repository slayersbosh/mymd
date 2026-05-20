import { useState } from 'react';
import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';
import { ExportPanel } from '../Export';

interface ToolbarProps {
  markdown?: string;
  fileName?: string;
}

export function Toolbar({ markdown = '', fileName = 'document' }: ToolbarProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';
  const [showExport, setShowExport] = useState(false);

  const bgPanel = isDark ? COLORS.bgPanel : '#FFFFFF';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const border = COLORS.border;
  const primary = COLORS.primary;

  return (
    <>
      <div
        className="h-10 flex items-center px-2 gap-1"
        style={{ backgroundColor: bgPanel, borderBottom: `1px solid ${border}` }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-150 hover:bg-white/[0.05]"
          style={{ color: textPrimary }}
          title="加粗 (Ctrl+B)"
        >
          B
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-150 hover:bg-white/[0.05]"
          style={{ color: textPrimary }}
          title="斜体 (Ctrl+I)"
        >
          I
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-150 hover:bg-white/[0.05]"
          style={{ color: textPrimary }}
          title="标题 1"
        >
          H1
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-150 hover:bg-white/[0.05]"
          style={{ color: textPrimary }}
          title="标题 2"
        >
          H2
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-150 hover:bg-white/[0.05]"
          style={{ color: textPrimary }}
          title="插入链接"
        >
          🔗
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-150 hover:bg-white/[0.05]"
          style={{ color: textPrimary }}
          title="插入图片"
        >
          📷
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-150 hover:bg-white/[0.05]"
          style={{ color: textPrimary }}
          title="插入图表"
        >
          📊
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-colors duration-150 hover:bg-white/[0.05]"
          style={{ color: textPrimary }}
          title="代码块"
        >
          &lt;/&gt;
        </div>
        <div className="flex-1" />
        <div
          className="h-7 px-3 flex items-center gap-1.5 rounded cursor-pointer transition-colors duration-150"
          style={{ backgroundColor: primary, color: '#FFFFFF', fontSize: '12px', fontWeight: 500 }}
          onClick={() => setShowExport(true)}
        >
          导出
        </div>
      </div>

      {showExport && (
        <ExportPanel
          markdown={markdown}
          fileName={fileName}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
}