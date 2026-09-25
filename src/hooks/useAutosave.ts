import { useState, useRef, useCallback, useEffect } from 'react';
import { SaveStatus } from '../types/index.js';
import { pageApi } from '../services/pageApi.js';

interface UseAutosaveOptions {
  pageId: string | null;
  initialTitle: string;
  initialContent: string;
  onSaved?: (updatedTitle: string, updatedContent: string) => void;
  debounceMs?: number;
}

export function useAutosave({
  pageId,
  initialTitle,
  initialContent,
  onSaved,
  debounceMs = 750,
}: UseAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep latest values in refs to avoid stale closures
  const titleRef = useRef(initialTitle);
  const contentRef = useRef(initialContent);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  useEffect(() => {
    titleRef.current = initialTitle;
    contentRef.current = initialContent;
    setSaveStatus('saved');
    setErrorMessage(null);
  }, [pageId, initialTitle, initialContent]);

  const executeSave = useCallback(async () => {
    if (!pageId) return;

    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');
    setErrorMessage(null);

    const titleToSave = titleRef.current;
    const contentToSave = contentRef.current;

    try {
      await pageApi.updatePage(pageId, {
        title: titleToSave,
        content: contentToSave,
      });

      setSaveStatus('saved');
      setErrorMessage(null);
      if (onSaved) {
        onSaved(titleToSave, contentToSave);
      }
    } catch (err: any) {
      console.error('Autosave failure:', err);
      setSaveStatus('error');
      setErrorMessage(err.message || 'Unable to save. Click to retry.');
    } finally {
      isSavingRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        executeSave();
      }
    }
  }, [pageId, onSaved]);

  const triggerChange = useCallback(
    (newTitle?: string, newContent?: string) => {
      let changed = false;

      if (newTitle !== undefined && newTitle !== titleRef.current) {
        titleRef.current = newTitle;
        changed = true;
      }
      if (newContent !== undefined && newContent !== contentRef.current) {
        contentRef.current = newContent;
        changed = true;
      }

      if (changed) {
        setSaveStatus('unsaved');
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          executeSave();
        }, debounceMs);
      }
    },
    [debounceMs, executeSave]
  );

  const retrySave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    executeSave();
  }, [executeSave]);

  const forceSaveImmediately = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return executeSave();
  }, [executeSave]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    errorMessage,
    triggerChange,
    retrySave,
    forceSaveImmediately,
  };
}
