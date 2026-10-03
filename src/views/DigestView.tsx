import React, { useState, useEffect } from 'react';
import { DailyDigest } from '../types';
import { CategoryBadge } from '../components/badges/CategoryBadge';
import { Activity, Calendar, ArrowRight, ShieldCheck, TrendingUp, BookOpen } from 'lucide-react';

interface Props {
  onSelectSignal: (id: string) => void;
  onSelectTechnology: (slug: string) => void;
}

export const DigestView: React.FC<Props> = ({ onSelectSignal, onSelectTechnology }) => {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/digest/daily')
      .then((res) => res.json())
      .then((data) => setDigest(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-neutral-400 flex items-center justify-center gap-2 font-sans">
        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Compiling daily intelligence report...</span>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="py-20 text-center text-xs text-neutral-400 font-sans">
        No digest report published for this date.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10 font-sans">
      {/* Editorial Digest Header */}
      <header className="border-b border-white/[0.08] pb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Activity className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">Daily intelligence digest</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Ecosystem developments: {digest.date}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1 font-sans">
          <span>Signals documented: <strong className="text-white font-mono">{digest.total_signals}</strong></span>
          <span>•</span>
          <span>Verified upstream: <strong className="text-neutral-200">100%</strong></span>
          <span>•</span>
          <span>Compiled: <strong className="text-neutral-300 font-mono text-[11px]">{digest.generated_at}</strong></span>
        </div>
      </header>

      {/* Category Breakdown Ledger */}
      <section className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
        <h3 className="text-xs font-semibold text-neutral-200">
          Signal volume by domain
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
          {Object.entries(digest.category_counts).map(([cat, count]) => (
            <div key={cat} className="p-2.5 rounded bg-neutral-900 border border-white/[0.04] text-center">
              <span className="text-[11px] text-neutral-400 block truncate">{cat}</span>
              <span className="text-base font-semibold text-white font-mono">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Executive Summary & Emerging Trends */}
      <section className="bg-[#121316] border border-white/[0.08] rounded-md p-6 space-y-4">
        <div className="flex items-center gap-2 text-neutral-300 text-xs font-medium">
          <BookOpen className="w-4 h-4 text-neutral-400" />
          <span>Executive synthesis</span>
        </div>

        <p className="text-sm text-neutral-200 leading-relaxed">
          {digest.executive_summary}
        </p>

        {digest.emerging_patterns && (
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <span className="text-xs font-semibold text-neutral-300 block">
              Emerging structural patterns:
            </span>
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {digest.emerging_patterns.map((pat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-neutral-400 font-mono">→</span>
                  <span>{pat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Ranked Top Developments */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/[0.08] pb-2">
          Significant developments (ranked by archival score)
        </h2>

        <div className="space-y-4">
          {digest.top_developments.map((dev) => (
            <div
              key={dev.rank}
              className="bg-[#121316] border border-white/[0.08] hover:border-white/[0.16] rounded-md p-5 transition-colors space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 border border-white/[0.1] font-mono text-xs font-medium text-neutral-300 flex items-center justify-center">
                    0{dev.rank}
                  </span>
                  <CategoryBadge category={dev.category} size="sm" />
                </div>

                <span className="text-xs text-neutral-400">
                  Importance: <strong className="font-mono text-neutral-200">{dev.importance}/100</strong>
                </span>
              </div>

              <h3 className="text-base font-semibold text-white leading-snug">{dev.title}</h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {dev.summary}
              </p>

              {/* Technologies & Sources */}
              <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400">Sources:</span>
                  {dev.sources.map((s, idx) => (
                    <span key={idx} className="text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-white/[0.04] font-mono text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onSelectSignal(dev.signal_id)}
                  className="text-neutral-300 hover:text-white flex items-center gap-1 transition-colors font-medium"
                >
                  <span>Archival record</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
