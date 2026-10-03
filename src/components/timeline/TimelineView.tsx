import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import {
  Tag,
  AlertTriangle,
  FileCode2,
  BookOpen,
  Activity,
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
        return <Tag className="w-3.5 h-3.5 text-neutral-300" />;
      case 'breaking_change':
        return <AlertTriangle className="w-3.5 h-3.5 text-neutral-300" />;
      case 'security':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      case 'rfc':
        return <FileCode2 className="w-3.5 h-3.5 text-neutral-300" />;
      case 'research':
        return <BookOpen className="w-3.5 h-3.5 text-neutral-300" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  const filterOptions = [
    { id: 'all', label: 'All milestones' },
    { id: 'release', label: 'Releases' },
    { id: 'breaking_change', label: 'Breaking changes' },
    { id: 'security', label: 'Security' },
    { id: 'rfc', label: 'RFC proposals' },
    { id: 'research', label: 'Research' },
    { id: 'ecosystem', label: 'Ecosystem' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Filter buttons - clean, sentence case */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-neutral-400 mr-1 shrink-0" />
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedType(opt.id)}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                selectedType === opt.id
                  ? 'bg-white text-black font-medium'
                  : 'bg-[#121316] text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Tree */}
      {years.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-xs border border-dashed border-white/[0.08] rounded-md">
          No historical timeline events recorded matching the selected filter.
        </div>
      ) : (
        <div className="space-y-12">
          {years.map((year) => (
            <div key={year} className="relative">
              {/* Year Pillar */}
              <div className="sticky top-16 z-20 bg-[#0d0e10]/95 backdrop-blur-sm py-2 mb-4 flex items-center gap-3">
                <span className="font-sans text-xl font-semibold text-white tracking-tight border-b-2 border-white/20 pb-0.5">
                  {year}
                </span>
                <span className="text-xs text-neutral-400">
                  ({groupedByYear[year].length} milestones)
                </span>
              </div>

              {/* Vertical branch line */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.12]">
                {groupedByYear[year].map((event) => (
                  <div
                    key={event.id}
                    className="relative group bg-[#111215] border border-white/[0.07] hover:border-white/[0.16] rounded-md p-4 transition-colors"
                  >
                    {/* Node Dot on vertical branch */}
                    <div className="absolute -left-[27px] top-5 w-2.5 h-2.5 rounded-full bg-[#16171b] border-2 border-neutral-500 group-hover:border-amber-400 transition-colors" />

                    {/* Event Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-neutral-900 border border-white/[0.04]">
                          {getEventIcon(event.event_type)}
                        </span>
                        <span className="text-neutral-400 font-sans capitalize">
                          {event.event_type.replace('_', ' ')}
                        </span>
                        <span className="text-neutral-400">·</span>
                        <span className="font-mono text-[11px] text-neutral-400">
                          {event.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-400">
                        <span>Importance:</span>
                        <span className="font-mono text-neutral-300">{event.importance}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-neutral-300 leading-relaxed mb-3 font-normal">
                      {event.description}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-4 text-xs pt-2 border-t border-white/[0.04]">
                      {event.signal_id && onSelectSignal && (
                        <button
                          onClick={() => onSelectSignal(event.signal_id!)}
                          className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1 font-medium"
                        >
                          <span>Archival record</span>
                          <span>→</span>
                        </button>
                      )}
                      {event.source_url && (
                        <a
                          href={event.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
                        >
                          <span>Upstream source</span>
                          <ExternalLink className="w-3 h-3" />
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
