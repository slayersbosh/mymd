import { create } from 'zustand';
import { EditorTab, EditorState } from '@/types';

interface EditorStore extends EditorState {
  // Autosave state
  lastSaved: Date | null;
  isSaving: boolean;

  // Actions
  openTab: (filePath: string, fileName: string, content?: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  updateCursorPosition: (tabId: string, line: number, column: number) => void;
  toggleSourceMode: () => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentTabId: null,
  tabs: [],
  isSourceMode: false,
  lastSaved: null,
  isSaving: false,

  openTab: (filePath, fileName, content = '') => {
    const state = get();
    // Check if tab already exists
    const existingTab = state.tabs.find((t) => t.filePath === filePath);

    if (existingTab) {
      set({ currentTabId: existingTab.id });
    } else {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        filePath,
        fileName,
        content,
        isDirty: false,
        cursorPosition: { line: 1, column: 1 },
      };
      set({
        tabs: [...state.tabs, newTab],
        currentTabId: newTab.id,
      });
    }
  },

  closeTab: (tabId) => {
    const state = get();
    const tabIndex = state.tabs.findIndex((t) => t.id === tabId);
    const newTabs = state.tabs.filter((t) => t.id !== tabId);

    let newCurrentTabId = state.currentTabId;
    if (state.currentTabId === tabId) {
      // Switch to adjacent tab
      if (tabIndex > 0) {
        newCurrentTabId = newTabs[tabIndex - 1].id;
      } else if (newTabs.length > 0) {
        newCurrentTabId = newTabs[0].id;
      } else {
        newCurrentTabId = null;
      }
    }

    set({ tabs: newTabs, currentTabId: newCurrentTabId });
  },

  setActiveTab: (tabId) => {
    set({ currentTabId: tabId });
  },

  updateTabContent: (tabId, content) => {
    const state = get();
    set({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, content, isDirty: true } : t
      ),
    });
  },

  updateCursorPosition: (tabId, line, column) => {
    const state = get();
    set({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, cursorPosition: { line, column } } : t
      ),
    });
  },

  toggleSourceMode: () => {
    set((state) => ({ isSourceMode: !state.isSourceMode }));
  },

  markSaved: () => {
    set({ lastSaved: new Date() });
  },

  setSaving: (saving: boolean) => {
    set({ isSaving: saving });
  },
}));