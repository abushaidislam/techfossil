import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import {
  Tag,
  AlertTriangle,
  FileCode2,
  Sparkles,
  BookOpen,
  Layers,
  ShieldAlert,
  ExternalLink,
  Filter,
} from 'lucide-react';

interface Props {
  events: TimelineEvent[];
  onSelectSignal?: (signalId: string) => void;
  title?: string;
  subtitle?: string;
}

export const TimelineView: React.FC<Props> = ({
  events,
  onSelectSignal,
  title,
  subtitle,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredEvents = selectedType === 'all'
    ? events
    : events.filter((e) => e.event_type === selectedType);

  // Group events by year
  const groupedByYear = filteredEvents.reduce<Record<number, TimelineEvent[]>>((acc, event) => {
    const year = event.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'release':
        return <Tag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'breaking_change':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'security':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      case 'rfc':
        return <FileCode2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'research':
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          {title && <h2 className="text-lg font-bold text-white font-sans">{title}</h2>}
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-neutral-400 mr-1" />
          {['all', 'release', 'breaking_change', 'security', 'rfc', 'research', 'ecosystem'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedType === type
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/[0.04]'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Tree */}
      {years.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-xs font-mono border border-dashed border-white/[0.08] rounded-md">
          No historical timeline events recorded matching the selected filter.
        </div>
      ) : (
        <div className="space-y-12">
          {years.map((year) => (
            <div key={year} className="relative">
              {/* Year Pillar */}
              <div className="sticky top-16 z-20 bg-[#0c0d0e]/95 backdrop-blur-sm py-2 mb-4 flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-white tracking-tight border-b-2 border-amber-400/80 pb-0.5">
                  {year}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  ({groupedByYear[year].length} milestones)
                </span>
              </div>

              {/* Vertical branch line */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.12]">
                {groupedByYear[year].map((event) => (
                  <div
                    key={event.id}
                    className="relative group bg-[#121316] border border-white/[0.08] hover:border-white/[0.18] rounded-md p-4 transition-all duration-150"
                  >
                    {/* Node Dot on vertical branch */}
                    <div className="absolute -left-[27px] top-5 w-3 h-3 rounded-full bg-[#16171b] border-2 border-neutral-600 group-hover:border-amber-400 transition-colors" />

                    {/* Event Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-neutral-900 border border-white/[0.04]">
                          {getEventIcon(event.event_type)}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                          {event.event_type.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400">
                          {event.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-neutral-400">
                          imp: <span className="font-semibold text-neutral-200">{event.importance}</span>
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-semibold text-white mb-1.5 font-sans">
                      {event.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-3">
                      {event.description}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 text-xs font-mono pt-2 border-t border-white/[0.04]">
                      {event.signal_id && onSelectSignal && (
                        <button
                          onClick={() => onSelectSignal(event.signal_id!)}
                          className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                        >
                          View Verified Signal Ledger →
                        </button>
                      )}
                      {event.source_url && (
                        <a
                          href={event.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
                        >
                          Upstream Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
