import { useState, useCallback } from 'react';

export const useEditorHistory = <T>(initialState: T | null) => {
  const [history, setHistory] = useState<T[]>(initialState ? [initialState] : []);
  const [index, setIndex] = useState(initialState ? 0 : -1);

  const reset = useCallback((state: T) => {
    setHistory([state]);
    setIndex(0);
  }, []);

  const push = useCallback((state: T) => {
    const newHistory = history.slice(0, index + 1);
    setHistory([...newHistory, state]);
    setIndex(newHistory.length);
  }, [history, index]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
      return history[index - 1];
    }
    return null;
  }, [index, history]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(index + 1);
      return history[index + 1];
    }
    return null;
  }, [index, history]);

  return { 
    undo, 
    redo, 
    push, 
    reset,
    canUndo: index > 0, 
    canRedo: index < history.length - 1 
  };
};