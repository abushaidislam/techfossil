import React from 'react';
import { CategoryType, SourceType } from '../../types';

export const CategoryBadge: React.FC<{ category: CategoryType | string; size?: 'sm' | 'md' }> = ({
  category,
  size = 'sm',
}) => {
  return (
    <span
      className={`inline-flex items-center font-sans font-medium rounded border border-white/[0.08] bg-white/[0.03] text-neutral-300 ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span>{category}</span>
    </span>
  );
};

export const SourceBadge: React.FC<{ source: SourceType | string; label?: string }> = ({
  source,
  label,
}) => {
  const displayLabel = label || source.replace('_', ' ');

  return (
    <span className="inline-flex items-center font-sans text-[11px] text-neutral-400 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.06]">
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
};
