import { create } from 'zustand';
import { AppSettings } from '@/types';

interface SettingsStore extends AppSettings {
  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setAutoSaveInterval: (interval: number) => void;
  setSidebarWidth: (width: number) => void;
}

// Load settings from localStorage
function loadSettings(): Partial<AppSettings> {
  try {
    const saved = localStorage.getItem('mymd-settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return {};
}

// Save settings to localStorage
function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem('mymd-settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: "'Noto Sans', 'Source Han Sans CN', sans-serif",
  autoSaveInterval: 30000, // 30 seconds
  sidebarWidth: 240,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings,
  ...loadSettings(),

  setTheme: (theme) => {
    set({ theme });
    saveSettings({ ...get() });
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    saveSettings({ ...get() });
  },

  setFontFamily: (fontFamily) => {
    set({ fontFamily });
    saveSettings({ ...get() });
  },

  setAutoSaveInterval: (autoSaveInterval) => {
    set({ autoSaveInterval });
    saveSettings({ ...get() });
  },

  setSidebarWidth: (sidebarWidth) => {
    set({ sidebarWidth });
    saveSettings({ ...get() });
  },
}));