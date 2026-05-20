import { create } from 'zustand';
import { FileNode } from '@/types';

interface FileStore {
  // State
  workspacePath: string | null;
  fileTree: FileNode[];
  selectedFileId: string | null;
  isLoading: boolean;

  // Actions
  setWorkspace: (path: string | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  selectFile: (fileId: string | null) => void;
  toggleFolder: (folderId: string) => void;
  createFile: (parentId: string, fileName: string) => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
}

// Helper to find and update node in tree
function updateNodeInTree(nodes: FileNode[], targetId: string, updater: (node: FileNode) => FileNode): FileNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return updater(node);
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, targetId, updater) };
    }
    return node;
  });
}

export const useFileStore = create<FileStore>((set, get) => ({
  workspacePath: null,
  fileTree: [],
  selectedFileId: null,
  isLoading: false,

  setWorkspace: (path) => {
    set({ workspacePath: path, fileTree: [], selectedFileId: null });
  },

  setFileTree: (tree) => {
    set({ fileTree: tree });
  },

  selectFile: (fileId) => {
    set({ selectedFileId: fileId });
  },

  toggleFolder: (folderId) => {
    const state = get();
    set({
      fileTree: updateNodeInTree(state.fileTree, folderId, (node) => ({
        ...node,
        expanded: !node.expanded,
      })),
    });
  },

  createFile: (parentId, fileName) => {
    const state = get();
    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      name: fileName,
      path: `${parentId}/${fileName}`,
      isDirectory: false,
    };

    set({
      fileTree: updateNodeInTree(state.fileTree, parentId, (node) => ({
        ...node,
        children: [...(node.children || []), newFile],
      })),
    });
  },

  deleteFile: (fileId) => {
    const state = get();

    // Helper to remove from parent
    const removeFromParent = (nodes: FileNode[], targetId: string): FileNode[] => {
      return nodes.filter((node) => node.id !== targetId).map((node) => {
        if (node.children) {
          return { ...node, children: removeFromParent(node.children, targetId) };
        }
        return node;
      });
    };

    set({
      fileTree: removeFromParent(state.fileTree, fileId),
      selectedFileId: state.selectedFileId === fileId ? null : state.selectedFileId,
    });
  },

  renameFile: (fileId, newName) => {
    const state = get();
    set({
      fileTree: updateNodeInTree(state.fileTree, fileId, (node) => ({
        ...node,
        name: newName,
      })),
    });
  },
}));