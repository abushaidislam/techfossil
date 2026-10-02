import React, { useState, useEffect } from 'react';
import {
  Signal,
  Technology,
  TimelineEvent,
  DailyDigest,
  SecurityAdvisory,
  ResearchPaper,
} from '../types';
import { VerificationBadge } from '../components/badges/VerificationBadge';
import {
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  Layers,
  Shield,
  BookOpen,
} from 'lucide-react';

interface Props {
  onNavigate: (view: string, param?: string) => void;
  onSelectSignal: (id: string) => void;
  onSelectTechnology: (slug: string) => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<Props> = ({
  onNavigate,
  onSelectSignal,
  onSelectTechnology,
  onOpenSearch,
}) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [advisories, setAdvisories] = useState<SecurityAdvisory[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sigRes, techRes, timeRes, metRes, secRes, papRes] = await Promise.all([
          fetch('/api/signals'),
          fetch('/api/technologies'),
          fetch('/api/timeline'),
          fetch('/api/metrics'),
          fetch('/api/security'),
          fetch('/api/research'),
        ]);

        if (sigRes.ok) {
          const d = await sigRes.json();
          setSignals(d.signals || []);
        }
        if (techRes.ok) {
          const d = await techRes.json();
          setTechnologies(d.technologies || []);
        }
        if (timeRes.ok) {
          const d = await timeRes.json();
          setTimelineEvents((d.events || []).slice(0, 5));
        }
        if (metRes.ok) {
          const d = await metRes.json();
          setMetrics(d);
        }
        if (secRes.ok) {
          const d = await secRes.json();
          setAdvisories((d.advisories || []).slice(0, 3));
        }
        if (papRes.ok) {
          const d = await papRes.json();
          setPapers((d.papers || []).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="py-12 md:py-16 space-y-20 max-w-5xl mx-auto font-sans">
      {/* 1 & 2. HERO: Identity & Core Proposition */}
      <section className="space-y-6 pt-4 pb-12 border-b border-white/[0.08]">
        <div className="text-xs font-sans font-medium text-neutral-400 tracking-normal">
          Technology archive
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.1] max-w-3xl">
          Preserving the evolution
          <br className="hidden sm:inline" /> of technology.
        </h1>

        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl font-normal">
          A continuously growing archive of software, AI, research, security, and developer ecosystem changes.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-sm font-sans">
          <button
            onClick={() => onNavigate('archive')}
            className="px-4 py-2 rounded-md bg-white hover:bg-neutral-200 text-black font-medium transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <span>Explore the archive</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('timeline')}
            className="px-4 py-2 text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>View the latest timeline</span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </section>

      {/* 3. TODAY'S ARCHIVE (Editorial Scannable Rows) */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
          <h2 className="text-lg font-semibold text-white font-sans">
            Today&apos;s archive
          </h2>
          <span className="text-xs text-neutral-400 font-sans">
            October 2026
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {signals.slice(0, 5).map((signal, index) => (
            <div
              key={signal.id}
              onClick={() => onSelectSignal(signal.id)}
              className="py-4 group cursor-pointer flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 hover:bg-white/[0.02] -mx-3 px-3 rounded-md transition-colors"
            >
              <div className="flex items-baseline gap-4 max-w-3xl">
                <span className="font-mono text-xs text-neutral-400 font-medium shrink-0 w-6">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-medium text-neutral-100 group-hover:text-white transition-colors leading-snug">
                    {signal.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-1 leading-relaxed">
                    {signal.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:pl-4 text-xs">
                <span className="text-neutral-400 font-sans">
                  {signal.category}
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {signal.published_at.slice(0, 10)}
                </span>
                <span className="text-neutral-400 group-hover:text-neutral-200 transition-colors">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. IMPORTANT SIGNALS (Curated In-Depth Dossiers) */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
          <h2 className="text-lg font-semibold text-white font-sans">
            Important signals
          </h2>
          <button
            onClick={() => onNavigate('archive')}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            View all records →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {signals.slice(0, 4).map((sig) => (
            <article
              key={sig.id}
              onClick={() => onSelectSignal(sig.id)}
              className="p-5 rounded-lg border border-white/[0.07] bg-[#111215] hover:border-white/[0.14] transition-colors cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium font-sans">
                    {sig.category}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {sig.published_at.slice(0, 10)}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white leading-snug">
                  {sig.title}
                </h3>

                <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3">
                  {sig.detailed_summary || sig.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-sans text-neutral-400">
                <span>Source: {sig.source_label}</span>
                <span className="text-neutral-300 hover:text-white font-medium inline-flex items-center gap-1">
                  Inspect ledger <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. TECHNOLOGY TIMELINE (Restrained Archival Timeline) */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h2 className="text-lg font-semibold text-white font-sans">
              Technology timeline
            </h2>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Verified ecosystem milestones and architectural inflection points.
            </p>
          </div>
          <button
            onClick={() => onNavigate('timeline')}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Full timeline →
          </button>
        </div>

        <div className="space-y-4 pl-2">
          {timelineEvents.map((evt) => (
            <div
              key={evt.id}
              className="relative pl-6 py-2 border-l border-white/[0.12] space-y-1 group"
            >
              <div className="absolute -left-[5px] top-3 w-2 h-2 rounded-full bg-neutral-400 group-hover:bg-amber-400 transition-colors" />

              <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
                <span className="font-mono text-[11px] text-neutral-400">
                  {evt.date}
                </span>
                <span className="text-neutral-400 font-medium capitalize">
                  {evt.event_type.replace('_', ' ')}
                </span>
                <span className="font-mono text-neutral-400 text-[11px]">
                  #{evt.technology_slug}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white">
                {evt.title}
              </h3>

              <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
                {evt.description}
              </p>

              {evt.signal_id && (
                <div className="pt-1">
                  <button
                    onClick={() => onSelectSignal(evt.signal_id!)}
                    className="text-xs text-neutral-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-sans"
                  >
                    View archival record →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. RECENTLY UPDATED TECHNOLOGIES (Scannable Editorial Table) */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
          <h2 className="text-lg font-semibold text-white font-sans">
            Recently updated technologies
          </h2>
          <button
            onClick={() => onNavigate('technologies')}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Directory ({technologies.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] text-neutral-400">
                <th className="py-2.5 font-medium">Technology</th>
                <th className="py-2.5 font-medium">Category</th>
                <th className="py-2.5 font-medium hidden sm:table-cell">First observed</th>
                <th className="py-2.5 font-medium">Latest update</th>
                <th className="py-2.5 font-medium text-right">Signals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {technologies.slice(0, 6).map((tech) => (
                <tr
                  key={tech.slug}
                  onClick={() => onSelectTechnology(tech.slug)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-3 font-semibold text-white">
                    {tech.name}
                  </td>
                  <td className="py-3 text-neutral-300">
                    {tech.category}
                  </td>
                  <td className="py-3 font-mono text-neutral-400 text-[11px] hidden sm:table-cell">
                    {tech.first_observed.slice(0, 4)}
                  </td>
                  <td className="py-3 font-mono text-neutral-400 text-[11px]">
                    {tech.latest_update}
                  </td>
                  <td className="py-3 font-mono text-neutral-300 text-right">
                    {tech.stats.signals_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7 & 8. RESEARCH & SECURITY (Dual Editorial Columns) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-white/[0.08]">
        {/* Research Column */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-2">
            <h3 className="text-base font-semibold text-white font-sans flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span>Research</span>
            </h3>
            <button
              onClick={() => onNavigate('research')}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              All papers →
            </button>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {papers.map((paper) => (
              <div key={paper.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>{paper.arxiv_id}</span>
                  <span>{paper.published_at.slice(0, 10)}</span>
                </div>
                <h4 className="text-sm font-medium text-white leading-snug">
                  {paper.title}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {paper.abstract}
                </p>
                <div className="pt-1">
                  <a
                    href={paper.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1 font-sans"
                  >
                    <span>Read on arXiv</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Column */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-2">
            <h3 className="text-base font-semibold text-white font-sans flex items-center gap-2">
              <Shield className="w-4 h-4 text-neutral-400" />
              <span>Security</span>
            </h3>
            <button
              onClick={() => onNavigate('security')}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              All advisories →
            </button>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {advisories.map((cve) => (
              <div key={cve.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span className="font-semibold text-neutral-200">{cve.cve_id}</span>
                  <span className="text-neutral-400 capitalize">{cve.severity} severity</span>
                </div>
                <h4 className="text-sm font-medium text-white leading-snug">
                  {cve.title}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {cve.description}
                </p>
                <div className="pt-1 flex items-center justify-between text-xs font-sans text-neutral-400">
                  <span>Patched: <strong className="font-mono text-neutral-200">{cve.patched_version}</strong></span>
                  <a
                    href={cve.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white inline-flex items-center gap-1"
                  >
                    <span>Advisory</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. ARCHIVE STATISTICS (Supporting Numbers at the Bottom) */}
      {metrics && (
        <section className="pt-6 border-t border-white/[0.08] text-xs font-sans text-neutral-400">
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-8">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-white text-base">
                {metrics.totalSignals}
              </span>
              <span>signals documented</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-white text-base">
                {metrics.totalTechnologies}
              </span>
              <span>monitored technologies</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-white text-base">
                {metrics.verificationRate}%
              </span>
              <span>verification rate</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-white text-base">
                100%
              </span>
              <span>open source & CC0</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
