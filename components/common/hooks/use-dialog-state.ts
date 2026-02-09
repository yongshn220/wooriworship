import { useState, useCallback } from 'react';

/**
 * Common dialog state management hook
 * Provides consistent API for dialog open/close state
 */
export function useDialogState(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle
  };
}
