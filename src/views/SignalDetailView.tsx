import React, { useState, useEffect } from 'react';
import { Signal } from '../types';
import { VerificationBadge } from '../components/badges/VerificationBadge';
import { CategoryBadge, SourceBadge } from '../components/badges/CategoryBadge';
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitBranch,
  Calendar,
  Layers,
  Share2,
  Clock,
  Database,
  Building,
} from 'lucide-react';

interface Props {
  signalId: string;
  onBack: () => void;
  onSelectTechnology: (slug: string) => void;
  onSelectSignal: (id: string) => void;
}

export const SignalDetailView: React.FC<Props> = ({
  signalId,
  onBack,
  onSelectTechnology,
  onSelectSignal,
}) => {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/signals/${signalId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Signal not found');
        return res.json();
      })
      .then((data) => setSignal(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [signalId]);

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-neutral-400 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Retrieving signal record from archive ledger...</span>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-mono text-rose-400">Signal [{signalId}] not found in ledger.</p>
        <button
          onClick={onBack}
          className="text-xs font-mono text-neutral-400 hover:text-white underline"
        >
          ← Return to Archive
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      } else {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
    } catch {
      // Graceful fallback if clipboard permission restricted
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4 font-sans text-xs">
        <div className="flex items-center gap-2 text-neutral-400 overflow-x-auto">
          <button onClick={onBack} className="hover:text-white transition-colors shrink-0">
            Archive
          </button>
          <span>/</span>
          <span className="text-neutral-400 font-medium shrink-0">{signal.category}</span>
          <span>/</span>
          <span className="text-neutral-200 truncate max-w-xs sm:max-w-md font-medium">
            {signal.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-md bg-[#121316] hover:bg-neutral-800 border border-white/[0.08] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied link!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Signal Header */}
      <header className="space-y-4 border-b border-white/[0.08] pb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <CategoryBadge category={signal.category} size="md" />
          <SourceBadge source={signal.source} label={signal.source_label} />
          <VerificationBadge status={signal.verification_status} size="md" />
          <span className="font-mono text-xs text-neutral-400">
            ID: <span className="text-neutral-300">{signal.id}</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight leading-tight">
          {signal.title}
        </h1>

        {/* Timestamps & Canonical Source */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-mono text-neutral-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>Published: <strong className="text-neutral-200">{signal.published_at.slice(0, 10)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Discovered: <strong className="text-neutral-200">{signal.discovered_at.slice(0, 10)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Importance: <strong className="text-amber-400">{signal.importance_score}/100</strong></span>
          </div>

          <div>
            <a
              href={signal.canonical_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 hover:underline"
            >
              <span>Upstream Canonical URL</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Lifecycle Progress Bar */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-3.5">
        <span className="font-mono text-[11px] text-neutral-400 block mb-2">
          AUDITABLE LIFECYCLE PROGRESSION:
        </span>
        <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px] text-center">
          {['DISCOVERED', 'PROCESSED', 'VERIFIED', 'PUBLISHED', 'ARCHIVED'].map((stage, idx) => {
            const isCompleted = true; // All published signals have completed stages
            const isCurrent = stage === 'PUBLISHED';
            return (
              <div
                key={stage}
                className={`py-1.5 px-1 rounded border ${
                  isCurrent
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 font-semibold'
                    : isCompleted
                    ? 'bg-neutral-900 border-white/[0.06] text-neutral-300'
                    : 'bg-neutral-950 border-transparent text-neutral-400'
                }`}
              >
                {stage}
              </div>
            );
          })}
        </div>
      </div>

      {/* THREE EXPLICIT PILLARS OF TRUTH REQUIRED BY PRODUCT SPEC */}
      <div className="space-y-6">
        {/* PILLAR 1: SOURCE-DERIVED FACTS */}
        <section className="bg-[#121316] border border-emerald-500/30 rounded-md p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              Source-Derived Facts (Deterministic Evidence)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 font-sans">
            These statements are directly extracted from official changelogs, release tags, or cryptographic commits without generative interpolation:
          </p>
          <ul className="space-y-2 text-xs font-mono text-neutral-200">
            {signal.source_derived_facts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span className="leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* PILLAR 2: AI-GENERATED SUMMARY & SYNTHESIS */}
        <section className="bg-[#121316] border border-amber-500/30 rounded-md p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                AI-Generated Technical Analysis (Gemini 3.8 Flash)
              </h3>
            </div>
            <span className="font-mono text-[10px] text-neutral-400">
              Confidence: {Math.round(signal.confidence_score * 100)}%
            </span>
          </div>
          <div className="space-y-2 text-xs font-sans leading-relaxed text-neutral-300">
            <p className="font-medium text-neutral-100">{signal.summary}</p>
            <p className="text-neutral-400">{signal.detailed_summary}</p>
          </div>
          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-sans text-neutral-400 italic">
            &quot;{signal.ai_analysis}&quot;
          </div>
        </section>

        {/* PILLAR 3: INFERRED RELATIONSHIPS */}
        <section className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
            <GitBranch className="w-4 h-4 text-sky-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-sky-400">
              Inferred Ecosystem Relationships
            </h3>
          </div>
          {signal.inferred_relationships && signal.inferred_relationships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {signal.inferred_relationships.map((rel, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTechnology(rel.target)}
                  className="p-2.5 rounded bg-neutral-900 border border-white/[0.04] hover:border-sky-400/40 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase block">
                      {rel.relationship.replace('_', ' ')}
                    </span>
                    <span className="text-white font-semibold">{rel.target_name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {Math.round(rel.confidence * 100)}% conf
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-neutral-400">
              Direct primary signal. No secondary inferred dependencies recorded.
            </p>
          )}
        </section>
      </div>

      {/* EVIDENCE LEDGER CHECKLIST */}
      <section className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-sans">Evidence Ledger & Primary Proofs</h3>
          </div>
          <span className="font-mono text-xs text-neutral-400">
            {signal.evidence.filter((e) => e.verified).length} of {signal.evidence.length} verified
          </span>
        </div>

        <div className="space-y-2">
          {signal.evidence.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded bg-neutral-900/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                      item.verified
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {item.verified ? '✓ VERIFIED' : '? PENDING'}
                  </span>
                  <span className="font-semibold text-white">{item.label}</span>
                </div>
                {item.details && (
                  <p className="text-[11px] font-mono text-neutral-400">{item.details}</p>
                )}
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-sky-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Inspect Evidence Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Associated Entities & Tags */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Technologies Tagged */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-md p-4 space-y-2">
          <h4 className="font-mono text-xs font-semibold uppercase text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            Associated Technologies
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {signal.technologies.map((techSlug) => (
              <button
                key={techSlug}
                onClick={() => onSelectTechnology(techSlug)}
                className="px-2 py-1 rounded bg-neutral-900 border border-white/[0.06] hover:border-amber-400 text-xs font-mono text-white transition-colors"
              >
                #{techSlug}
              </button>
            ))}
          </div>
        </div>

        {/* Named Entities Detected */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-md p-4 space-y-2">
          <h4 className="font-mono text-xs font-semibold uppercase text-neutral-300 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-neutral-400" />
            Extracted Named Entities
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {signal.entities.map((ent, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-neutral-900/60 border border-white/[0.04] text-xs font-sans text-neutral-300"
              >
                {ent}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
