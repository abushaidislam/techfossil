import React from 'react';
import { VerificationStatus } from '../../types';
import { Check, HelpCircle } from 'lucide-react';

interface Props {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export const VerificationBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  if (status === 'verified') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-sans font-medium rounded border border-white/[0.12] bg-white/[0.04] text-neutral-200 ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'
        }`}
        title="Verified record"
      >
        <Check className={size === 'sm' ? 'w-3 h-3 text-neutral-300' : 'w-3.5 h-3.5 text-neutral-300'} />
        <span>Verified</span>
      </span>
    );
  }

  if (status === 'partially_verified') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-sans font-medium rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'
        }`}
        title="Partially verified record"
      >
        <span>Partially verified</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-sans font-medium rounded border border-white/[0.08] text-neutral-400 ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'
      }`}
      title="Unverified"
    >
      <HelpCircle className={size === 'sm' ? 'w-3 h-3 text-neutral-400' : 'w-3.5 h-3.5 text-neutral-400'} />
      <span>Unverified</span>
    </span>
  );
};
