import { useState } from 'react';
import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';
import { downloadHtml, downloadPdf, downloadWord, downloadEpub } from '@/lib/export';

interface ExportPanelProps {
  markdown: string;
  fileName?: string;
  onClose?: () => void;
}

type ExportFormat = 'pdf' | 'html' | 'docx' | 'epub';

export function ExportPanel({ markdown, fileName = 'document', onClose }: ExportPanelProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';
  const [isExporting, setIsExporting] = useState(false);

  const bgPanel = isDark ? COLORS.bgPanel : '#FFFFFF';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';
  const border = COLORS.border;
  const primary = COLORS.primary;

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'pdf':
          await downloadPdf(markdown, fileName);
          break;
        case 'html':
          await downloadHtml(markdown, fileName);
          break;
        case 'docx':
          await downloadWord(markdown, fileName);
          break;
        case 'epub':
          await downloadEpub(markdown, fileName);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      onClose?.();
    }
  };

  const exportOptions: { format: ExportFormat; label: string; icon: string; desc: string }[] = [
    {
      format: 'pdf',
      label: 'PDF',
      icon: '📄',
      desc: '导出为 PDF 格式，适合打印和分享',
    },
    {
      format: 'html',
      label: 'HTML',
      icon: '🌐',
      desc: '导出为自包含单文件 HTML',
    },
    {
      format: 'docx',
      label: 'Word (.docx)',
      icon: '📝',
      desc: '导出为 Microsoft Word 格式',
    },
    {
      format: 'epub',
      label: 'EPUB',
      icon: '📖',
      desc: '导出为电子书格式',
    },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-[400px] rounded-lg overflow-hidden shadow-xl"
        style={{ backgroundColor: bgPanel, border: `1px solid ${border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="h-12 px-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${border}` }}
        >
          <span className="text-[16px] font-semibold" style={{ color: textPrimary }}>
            导出文档
          </span>
          <span
            className="text-[18px] cursor-pointer hover:opacity-70"
            style={{ color: textSecondary }}
            onClick={onClose}
          >
            ×
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-[12px] mb-4" style={{ color: textSecondary }}>
            选择导出格式，当前文件：{fileName}
          </p>

          <div className="flex flex-col gap-2">
            {exportOptions.map((opt) => (
              <button
                key={opt.format}
                className="w-full h-12 px-4 flex items-center justify-between rounded transition-colors"
                style={{
                  backgroundColor: COLORS.bgMain,
                  border: `1px solid ${border}`,
                  color: textPrimary,
                }}
                onClick={() => handleExport(opt.format)}
                disabled={isExporting}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{opt.icon}</span>
                  <div className="text-left">
                    <div className="text-[13px] font-medium">{opt.label}</div>
                    <div className="text-[11px]" style={{ color: textSecondary }}>
                      {opt.desc}
                    </div>
                  </div>
                </div>
                <span style={{ color: primary }}>→</span>
              </button>
            ))}
          </div>

          {isExporting && (
            <div className="mt-4 text-center text-[12px]" style={{ color: textSecondary }}>
              正在导出...
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="h-10 px-4 flex items-center justify-center"
          style={{ borderTop: `1px solid ${border}`, backgroundColor: COLORS.bgSidebar }}
        >
          <span className="text-[11px]" style={{ color: textSecondary }}>
            支持的格式: PDF, HTML, Word, EPUB
          </span>
        </div>
      </div>
    </div>
  );
}