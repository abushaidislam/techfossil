import React, { useState } from 'react';
import { X } from 'lucide-react';

export const DevBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-[#111214] border-b border-white/[0.06] text-[11px] font-sans py-1.5 px-4 text-neutral-400">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-neutral-300 font-medium">Development dataset active:</span>
          <span>
            Records derived from public registries and official release channels (GitHub, npm, PyPI, arXiv, NVD).
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-neutral-400 hover:text-white p-0.5 transition-colors"
          title="Dismiss notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
