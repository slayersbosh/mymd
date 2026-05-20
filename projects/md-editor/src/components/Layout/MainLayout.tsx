import { useState } from 'react';
import { TitleBar } from './TitleBar';
import { TabBar } from './TabBar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { Toolbar } from '../Editor/Toolbar';
import { COLORS } from '@/types';
import { useSettingsStore } from '@/stores';

interface MainLayoutProps {
  children?: React.ReactNode;
  markdown?: string;
  fileName?: string;
}

export function MainLayout({ children, markdown = '', fileName = 'document' }: MainLayoutProps) {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';

  const [tabs] = useState([
    { id: 'tab-1', fileName: '产品需求文档.md', isActive: true },
    { id: 'tab-2', fileName: '会议记录.md' },
    { id: 'tab-3', fileName: '技术方案.md' },
  ]);
  const [activeTabId] = useState<string | null>('tab-1');

  const bgMain = isDark ? COLORS.bgMain : '#FAFAFA';
  const textPrimary = isDark ? COLORS.textPrimary : '#1A1A1A';

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: bgMain, color: textPrimary }}>
      <TitleBar />
      <TabBar tabs={tabs} activeTabId={activeTabId} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar markdown={markdown} fileName={fileName} />
          <div className="flex-1 overflow-auto p-10">{children}</div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}