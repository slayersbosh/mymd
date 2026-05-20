import { useEffect, useRef, useCallback, useState } from 'react';

// Storage keys
const CRASH_RECOVERY_KEY = 'mymd-crash-recovery';

interface AutosaveState {
  lastSaved: Date | null;
  isDirty: boolean;
  isSaving: boolean;
}

interface CrashRecovery {
  content: string;
  filePath: string;
  timestamp: number;
}

export function useAutosave(
  content: string,
  filePath: string,
  onSave: (content: string) => Promise<void>,
  interval: number = 30000 // 30 seconds default
) {
  const [state, setState] = useState<AutosaveState>({
    lastSaved: null,
    isDirty: false,
    isSaving: false,
  });

  const contentRef = useRef(content);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const isDirtyRef = useRef(false);

  // Track content changes
  useEffect(() => {
    if (content !== contentRef.current) {
      isDirtyRef.current = true;
      contentRef.current = content;
      setState((s) => ({ ...s, isDirty: true }));
    }
  }, [content]);

  // Save function
  const save = useCallback(async () => {
    if (!isDirtyRef.current) return;

    setState((s) => ({ ...s, isSaving: true }));

    try {
      await onSave(contentRef.current);
      isDirtyRef.current = false;
      setState({
        lastSaved: new Date(),
        isDirty: false,
        isSaving: false,
      });

      // Update crash recovery
      saveCrashRecovery(contentRef.current, filePath);
    } catch (error) {
      console.error('Autosave failed:', error);
      setState((s) => ({ ...s, isSaving: false }));
    }
  }, [onSave, filePath]);

  // Start autosave interval
  useEffect(() => {
    if (interval > 0) {
      intervalRef.current = setInterval(save, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [save, interval]);

  // Save on unmount / beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        // Sync save before unload
        try {
          localStorage.setItem(
            CRASH_RECOVERY_KEY,
            JSON.stringify({
              content: contentRef.current,
              filePath,
              timestamp: Date.now(),
            })
          );
        } catch (err) {
          console.warn('Failed to save crash recovery:', err);
        }

        e.preventDefault();
        e.returnValue = '有未保存的更改，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [filePath]);

  return {
    ...state,
    save,
    forceSave: save,
  };
}

// Crash recovery functions
export function saveCrashRecovery(content: string, filePath: string): void {
  try {
    const data: CrashRecovery = {
      content,
      filePath,
      timestamp: Date.now(),
    };
    localStorage.setItem(CRASH_RECOVERY_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save crash recovery:', error);
  }
}

export function getCrashRecovery(): CrashRecovery | null {
  try {
    const data = localStorage.getItem(CRASH_RECOVERY_KEY);
    if (!data) return null;

    const recovery = JSON.parse(data) as CrashRecovery;

    // Check if recovery is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - recovery.timestamp > maxAge) {
      clearCrashRecovery();
      return null;
    }

    return recovery;
  } catch (error) {
    console.warn('Failed to get crash recovery:', error);
    return null;
  }
}

export function clearCrashRecovery(): void {
  try {
    localStorage.removeItem(CRASH_RECOVERY_KEY);
  } catch (error) {
    console.warn('Failed to clear crash recovery:', error);
  }
}

// Check if there is unsaved work
export function hasUnsavedWork(): boolean {
  const recovery = getCrashRecovery();
  return recovery !== null;
}