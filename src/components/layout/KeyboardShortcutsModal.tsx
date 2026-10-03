import React from 'react';
import { X, Command } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Open search & AI research mode' },
    { key: 'g then a', description: 'Navigate to Archive' },
    { key: 'g then t', description: 'Navigate to Technologies' },
    { key: 'g then l', description: 'Navigate to Timeline' },
    { key: 'g then k', description: 'Navigate to Knowledge Graph' },
    { key: 'g then r', description: 'Navigate to Research papers' },
    { key: 'g then s', description: 'Navigate to Security advisories' },
    { key: 'g then d', description: 'Navigate to System Dashboard' },
    { key: 'g then i', description: 'Navigate to Ingestion Control' },
    { key: '?', description: 'Toggle this keyboard shortcuts dialog' },
    { key: 'Esc', description: 'Close modals or overlays' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121316] border border-white/[0.12] rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-neutral-400" />
            <h3 className="font-semibold text-sm text-white font-sans">Keyboard shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/[0.04]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-neutral-400 mb-4">
            TechFossil is designed for high-velocity research with keyboard-first navigation.
          </p>

          <div className="space-y-2">
            {shortcuts.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <span className="text-neutral-300">{s.description}</span>
                <kbd className="font-mono text-[11px] bg-neutral-900 border border-neutral-750 px-2 py-0.5 rounded text-neutral-300 shadow-sm">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 bg-[#0e0f11] border-t border-white/[0.06] text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white/[0.08] hover:bg-white/[0.12] text-xs font-medium text-white rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
