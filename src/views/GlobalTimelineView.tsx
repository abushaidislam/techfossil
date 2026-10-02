import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '../types';
import { TimelineView } from '../components/timeline/TimelineView';
import { Calendar, Filter } from 'lucide-react';

interface Props {
  onSelectSignal: (id: string) => void;
}

export const GlobalTimelineView: React.FC<Props> = ({ onSelectSignal }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/timeline')
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="border-b border-white/[0.08] pb-6 space-y-2">
        <div className="flex items-center gap-2 font-sans text-xs text-neutral-400">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">Chronological retrospective</span>
        </div>
        <h1 className="text-3xl font-bold text-white font-sans tracking-tight">
          Global Technology Evolution Timeline
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
          A unified, cross-domain historical ledger of version releases, architectural RFCs, security disclosures, and research breakthroughs across 2024–2026.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-neutral-400 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Reconstructing global historical timeline...</span>
        </div>
      ) : (
        <TimelineView
          events={events}
          onSelectSignal={onSelectSignal}
        />
      )}
    </div>
  );
};
