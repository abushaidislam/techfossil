import React, { useState, useEffect } from 'react';
import {
  Technology,
  Signal,
  TimelineEvent,
  Release,
  SecurityAdvisory,
  ResearchPaper,
} from '../types';
import { CategoryBadge } from '../components/badges/CategoryBadge';
import { TimelineView } from '../components/timeline/TimelineView';
import { SignalCard } from '../components/cards/SignalCard';
import {
  ArrowLeft,
  Calendar,
  Layers,
  GitBranch,
  Shield,
  BookOpen,
  Activity,
  Tag,
  ExternalLink,
  Code2,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  slug: string;
  onBack: () => void;
  onSelectSignal: (id: string) => void;
  onSelectTechnology: (slug: string) => void;
}

export const TechnologyDetailView: React.FC<Props> = ({
  slug,
  onBack,
  onSelectSignal,
  onSelectTechnology,
}) => {
  const [data, setData] = useState<{
    technology: Technology;
    signals: Signal[];
    timeline: TimelineEvent[];
    releases: Release[];
    security_advisories: SecurityAdvisory[];
    research_papers: ResearchPaper[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'timeline' | 'signals' | 'releases' | 'security' | 'research'>('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/technologies/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load technology');
        return res.json();
      })
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-neutral-400 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Retrieving technology ledger & historical timelines...</span>
      </div>
    );
  }

  if (!data || !data.technology) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-mono text-rose-400">Technology &quot;{slug}&quot; not found in directory.</p>
        <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white underline">
          ← Return to Directory
        </button>
      </div>
    );
  }

  const { technology, signals, timeline, releases, security_advisories, research_papers } = data;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Technologies Directory</span>
        </button>
      </div>

      {/* Main Dossier Header */}
      <header className="bg-[#121316] border border-white/[0.08] rounded-md p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={technology.category} size="md" />
              {technology.organization && (
                <span className="font-mono text-xs text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/[0.04]">
                  {technology.organization}
                </span>
              )}
              {technology.license && (
                <span className="font-mono text-xs text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/[0.04]">
                  {technology.license}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white font-sans tracking-tight">
              {technology.name}
            </h1>

            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              {technology.description}
            </p>

            {/* Aliases & External Links */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-neutral-400">
              {technology.website && (
                <a
                  href={technology.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:underline"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {technology.repository && (
                <a
                  href={technology.repository}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-neutral-300 hover:underline"
                >
                  <span>Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <span>Observed: {technology.first_observed}</span>
              <span>Updated: {technology.latest_update}</span>
            </div>

            {/* Detected Entity Aliases */}
            {technology.aliases.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                <span>Canonical Aliases:</span>
                {technology.aliases.map((alias) => (
                  <span key={alias} className="text-neutral-400 bg-neutral-900/60 px-1.5 py-0.5 rounded border border-white/[0.04]">
                    {alias}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Technology Stats Card */}
          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs w-full md:w-64 bg-neutral-900/80 p-3.5 rounded border border-white/[0.06] shrink-0">
            <div className="bg-[#121316] p-2 rounded border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 block uppercase">SIGNALS</span>
              <span className="text-lg font-bold text-white">{technology.stats.signals_count}</span>
            </div>
            <div className="bg-[#121316] p-2 rounded border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 block uppercase">RELEASES</span>
              <span className="text-lg font-bold text-white">{technology.stats.releases_count}</span>
            </div>
            <div className="bg-[#121316] p-2 rounded border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 block uppercase">CVES</span>
              <span className={`text-lg font-bold ${technology.stats.vulnerabilities_count > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
                {technology.stats.vulnerabilities_count}
              </span>
            </div>
            <div className="bg-[#121316] p-2 rounded border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 block uppercase">VELOCITY</span>
              <span className="text-lg font-bold text-emerald-400">{technology.stats.velocity_score}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-white/[0.08] flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'timeline', label: `Historical Timeline (${timeline.length})`, icon: Calendar },
          { id: 'signals', label: `Verified Signals (${signals.length})`, icon: Layers },
          { id: 'releases', label: `Releases (${releases.length})`, icon: Tag },
          { id: 'security', label: `Security (${security_advisories.length})`, icon: Shield },
          { id: 'research', label: `Research (${research_papers.length})`, icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-amber-400 text-white font-bold bg-white/[0.02]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'timeline' && (
          <TimelineView
            events={timeline}
            onSelectSignal={onSelectSignal}
            title={`${technology.name} Historical Evolution Timeline`}
            subtitle="Verified releases, RFC proposals, breaking changes, and community milestones from 2024 through 2026."
          />
        )}

        {activeTab === 'signals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-300">
                Verified Ingestion Signals for {technology.name}
              </h3>
              <span className="text-xs font-mono text-neutral-400">{signals.length} records</span>
            </div>

            {signals.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-neutral-400 border border-dashed border-white/[0.08] rounded">
                No signals currently recorded for {technology.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map((sig) => (
                  <SignalCard key={sig.id} signal={sig} onClick={() => onSelectSignal(sig.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'releases' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-300">
                Recorded Release Tags & Changelogs
              </h3>
              <span className="text-xs font-mono text-neutral-400">{releases.length} releases</span>
            </div>

            <div className="space-y-3">
              {releases.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-[#121316] border border-white/[0.08] rounded-md p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{rel.version}</span>
                      <span className="font-mono text-xs text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-white/[0.04]">
                        {rel.tag_name}
                      </span>
                      {rel.is_breaking && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-400 font-mono text-[10px] uppercase">
                          Breaking Changes
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-neutral-400">{rel.release_date}</span>
                  </div>

                  {rel.highlights && rel.highlights.length > 0 && (
                    <ul className="space-y-1 text-xs font-mono text-neutral-300 list-disc list-inside">
                      {rel.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                    {rel.signal_id && (
                      <button
                        onClick={() => onSelectSignal(rel.signal_id!)}
                        className="text-amber-400 hover:underline"
                      >
                        View Signal Ledger →
                      </button>
                    )}
                    <a
                      href={rel.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-400 hover:text-white inline-flex items-center gap-1"
                    >
                      <span>Upstream Release</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-300">
                Security Advisories Affecting {technology.name}
              </h3>
              <span className="text-xs font-mono text-neutral-400">{security_advisories.length} CVEs</span>
            </div>

            {security_advisories.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-emerald-400 border border-dashed border-white/[0.08] rounded bg-emerald-950/10">
                ✓ No critical or high security advisories currently recorded for {technology.name}.
              </div>
            ) : (
              <div className="space-y-3">
                {security_advisories.map((cve) => (
                  <div
                    key={cve.id}
                    className="bg-[#121316] border border-white/[0.08] rounded-md p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-rose-400">{cve.cve_id}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-400 font-mono text-[10px] uppercase">
                        {cve.severity} severity
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{cve.title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{cve.description}</p>
                    <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between text-xs font-mono text-neutral-400">
                      <span>Affected: {cve.affected_versions}</span>
                      <span className="text-emerald-400">Patched in: {cve.patched_version}</span>
                      <a href={cve.source_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                        CVE Link
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-300">
                Research Papers Studying {technology.name}
              </h3>
              <span className="text-xs font-mono text-neutral-400">{research_papers.length} preprints</span>
            </div>

            {research_papers.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-neutral-400 border border-dashed border-white/[0.08] rounded">
                No arXiv research papers currently linked directly to this technology.
              </div>
            ) : (
              <div className="space-y-3">
                {research_papers.map((p) => (
                  <div key={p.id} className="bg-[#121316] border border-white/[0.08] rounded-md p-4 space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
                      <span className="text-purple-400 font-semibold">{p.arxiv_id}</span>
                      <span>{p.published_at.slice(0, 10)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{p.abstract}</p>
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400 truncate max-w-sm">{p.authors.join(', ')}</span>
                      <a href={p.source_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                        Read on arXiv →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
