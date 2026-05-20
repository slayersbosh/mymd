// Editor types
export interface FileNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  expanded?: boolean;
}

export interface EditorTab {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  isDirty: boolean;
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
    tags: string[];
  };
  cursorPosition?: {
    line: number;
    column: number;
  };
}

export interface EditorState {
  currentTabId: string | null;
  tabs: EditorTab[];
  isSourceMode: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  fontSize: number;
  fontFamily: string;
  autoSaveInterval: number;
  sidebarWidth: number;
}

// Theme colors
export const COLORS = {
  primary: '#FF6B00',
  primaryHover: '#FF8533',
  primaryActive: '#CC5500',
  bgMain: '#0D0D0D',
  bgSidebar: '#141414',
  bgPanel: '#1A1A1A',
  border: '#2D2D2D',
  textPrimary: '#E8E8E8',
  textSecondary: '#888888',
  textDisabled: '#555555',
  success: '#00C853',
  warning: '#FFB300',
  error: '#FF1744',
  codeBg: '#1E1E1E',
} as const;

// Supported languages for syntax highlighting
export const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'go', 'rust', 'java',
  'cpp', 'c', 'csharp', 'php', 'ruby', 'swift', 'kotlin',
  'sql', 'bash', 'powershell', 'html', 'css', 'json', 'yaml',
  'markdown', 'xml', 'dockerfile', 'plaintext'
] as const;

// Front matter metadata
export interface FrontMatter {
  title?: string;
  author?: string;
  date?: string;
  tags: string[];
  custom: Record<string, string>;
}