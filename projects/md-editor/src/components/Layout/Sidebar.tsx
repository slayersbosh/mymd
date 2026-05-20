import { COLORS, FileNode } from '@/types';
import { useSettingsStore } from '@/stores';

interface SidebarProps {
  fileTree?: FileNode[];
  selectedFileId?: string | null;
  onFileSelect?: (fileId: string) => void;
  onFileCreate?: () => void;
  onFolderToggle?: (folderId: string) => void;
}

export function Sidebar({
  fileTree = [],
  selectedFileId = null,
  onFileSelect,
  onFileCreate,
  onFolderToggle,
}: SidebarProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const bgSidebar = isDark ? COLORS.bgSidebar : '#F0F0F0';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';
  const textSecondary = isDark ? COLORS.textSecondary : '#666666';
  const border = COLORS.border;
  const primary = COLORS.primary;

  // Default file tree for demo
  const defaultTree: FileNode[] = [
    {
      id: 'folder-1',
      name: '工作',
      path: '/work',
      isDirectory: true,
      expanded: true,
      children: [
        { id: 'file-1', name: '产品需求文档.md', path: '/work/产品需求文档.md', isDirectory: false },
        { id: 'file-2', name: '会议记录.md', path: '/work/会议记录.md', isDirectory: false },
        { id: 'file-3', name: '技术方案.md', path: '/work/技术方案.md', isDirectory: false },
      ],
    },
    {
      id: 'folder-2',
      name: '个人',
      path: '/personal',
      isDirectory: true,
      children: [],
    },
  ];

  const tree = fileTree.length > 0 ? fileTree : defaultTree;

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isSelected = node.id === selectedFileId;

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-1.5 p-2 rounded cursor-pointer transition-colors duration-150"
          style={{
            paddingLeft: `${12 + depth * 16}px`,
            backgroundColor: isSelected ? 'rgba(255,107,0,0.15)' : 'transparent',
            color: isSelected ? primary : textPrimary,
          }}
          onClick={() => {
            if (node.isDirectory) {
              onFolderToggle?.(node.id);
            } else {
              onFileSelect?.(node.id);
            }
          }}
        >
          <span className="text-[11px]" style={{ color: textSecondary }}>
            {node.isDirectory ? (node.expanded ? '📂' : '📁') : '📄'}
          </span>
          <span className="text-[12px]">{node.name}</span>
        </div>
        {node.isDirectory && node.expanded && node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div
      className="w-60 flex flex-col select-none"
      style={{ backgroundColor: bgSidebar, borderRight: `1px solid ${border}` }}
    >
      {/* Header */}
      <div
        className="h-10 px-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>
          文件
        </span>
        <span
          className="text-lg cursor-pointer transition-colors"
          style={{ color: primary }}
          onClick={onFileCreate}
        >
          +
        </span>
      </div>

      {/* File Tree */}
      <div className="flex-1 p-2 overflow-y-auto">{tree.map((node) => renderNode(node))}</div>
    </div>
  );
}