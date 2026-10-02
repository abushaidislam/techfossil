import React from 'react';
import { Signal } from '../../types';
import { CategoryBadge, SourceBadge } from '../badges/CategoryBadge';
import { VerificationBadge } from '../badges/VerificationBadge';
import { ChevronRight } from 'lucide-react';

interface Props {
  signal: Signal;
  onClick: () => void;
}

export const SignalCard: React.FC<Props> = ({ signal, onClick }) => {
  return (
    <article
      onClick={onClick}
      className="group bg-[#111215] hover:bg-[#15161a] border border-white/[0.08] hover:border-white/[0.20] rounded-lg p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between font-sans space-y-3.5 shadow-sm"
    >
      <div className="space-y-2">
        {/* Meta row */}
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={signal.category} size="sm" />
            <VerificationBadge status={signal.verification_status} size="sm" />
          </div>
          <span className="font-mono text-[11px] text-neutral-400 shrink-0">
            {signal.published_at.slice(0, 10)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors leading-snug">
          {signal.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
          {signal.summary}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-neutral-400 font-sans">
        <SourceBadge source={signal.source} label={signal.source_label} />

        <span className="text-neutral-400 group-hover:text-white transition-colors inline-flex items-center gap-0.5 font-medium">
          Read <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
