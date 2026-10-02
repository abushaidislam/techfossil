import { useEffect, useRef } from 'react';

interface Handlers {
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
  onNavigate: (view: string) => void;
}

export function useKeyboardShortcuts({
  onOpenSearch,
  onOpenShortcuts,
  onNavigate,
}: Handlers) {
  const gPressedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Single key: /
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onOpenSearch();
        return;
      }

      // Single key: ?
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        onOpenShortcuts();
        return;
      }

      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
        return;
      }

      // Sequence: g then <key>
      if (e.key.toLowerCase() === 'g') {
        gPressedRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          gPressedRef.current = false;
        }, 1000);
        return;
      }

      if (gPressedRef.current) {
        gPressedRef.current = false;
        const key = e.key.toLowerCase();
        switch (key) {
          case 'a':
            e.preventDefault();
            onNavigate('archive');
            break;
          case 't':
            e.preventDefault();
            onNavigate('technologies');
            break;
          case 'l':
            e.preventDefault();
            onNavigate('timeline');
            break;
          case 'k':
          case 'g':
            e.preventDefault();
            onNavigate('graph');
            break;
          case 'r':
            e.preventDefault();
            onNavigate('research');
            break;
          case 's':
            e.preventDefault();
            onNavigate('security');
            break;
          case 'd':
            e.preventDefault();
            onNavigate('dashboard');
            break;
          case 'i':
            e.preventDefault();
            onNavigate('ingestion');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onOpenSearch, onOpenShortcuts, onNavigate]);
}
