import React from 'react';
import { Technology } from '../../types';
import { ChevronRight } from 'lucide-react';

interface Props {
  technology: Technology;
  onClick: () => void;
}

export const TechnologyCard: React.FC<Props> = ({ technology, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-[#111215] hover:bg-[#15161a] border border-white/[0.07] hover:border-white/[0.14] rounded-lg p-5 transition-colors cursor-pointer flex flex-col justify-between font-sans space-y-4"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="font-medium text-neutral-400">{technology.category}</span>
          <span className="font-mono text-[11px] text-neutral-400">
            Observed {technology.first_observed.slice(0, 4)}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-white group-hover:text-amber-200 transition-colors">
            {technology.name}
          </h3>
          {technology.organization && (
            <span className="text-xs text-neutral-400">
              {technology.organization}
            </span>
          )}
        </div>

        <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
          {technology.description}
        </p>
      </div>

      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-neutral-400">
        <span>Updated {technology.latest_update}</span>
        <span className="text-neutral-400 group-hover:text-white transition-colors inline-flex items-center gap-1 font-medium">
          Timeline <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

export const StatCard: React.FC<{
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}> = ({ label, value, subtext, icon: Icon, trend }) => {
  return (
    <div className="bg-[#111215] border border-white/[0.07] rounded-lg p-4 font-sans space-y-1">
      <div className="flex items-center justify-between text-neutral-400 text-xs">
        <span className="font-medium text-neutral-400">{label}</span>
        <Icon className="w-4 h-4 text-neutral-400" />
      </div>
      <div className="text-2xl font-semibold text-white tracking-tight">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-neutral-400">
          {subtext}
        </div>
      )}
    </div>
  );
};
