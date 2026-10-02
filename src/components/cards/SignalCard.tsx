import React from 'react';
import { Signal } from '../../types';
import { ChevronRight } from 'lucide-react';

interface Props {
  signal: Signal;
  onClick: () => void;
}

export const SignalCard: React.FC<Props> = ({ signal, onClick }) => {
  return (
    <article
      onClick={onClick}
      className="group bg-[#111215] hover:bg-[#15161a] border border-white/[0.07] hover:border-white/[0.14] rounded-lg p-5 transition-colors cursor-pointer flex flex-col justify-between font-sans space-y-4"
    >
      <div className="space-y-2.5">
        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="font-medium text-neutral-400">{signal.category}</span>
          <span className="font-mono text-[11px] text-neutral-400">
            {signal.published_at.slice(0, 10)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-white group-hover:text-amber-200 transition-colors leading-snug">
          {signal.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3">
          {signal.summary}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span>{signal.source_label}</span>
          {signal.verification_status === 'verified' && (
            <span className="text-[11px] text-neutral-400">
              • Verified
            </span>
          )}
        </div>

        <span className="text-neutral-400 group-hover:text-white transition-colors inline-flex items-center gap-1 font-medium">
          Read <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
