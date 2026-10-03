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
  BookOpen,
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
      <div className="py-20 text-center space-y-3 font-sans">
        <p className="text-sm text-neutral-300">Signal [{signalId}] not found in ledger.</p>
        <button
          onClick={onBack}
          className="text-xs text-neutral-400 hover:text-white underline"
        >
          ← Return to archive
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
    <div className="max-w-4xl mx-auto py-8 space-y-8 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to archive</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 text-neutral-300 hover:text-white px-2.5 py-1 rounded bg-[#121316] border border-white/[0.08] transition-colors"
          >
            <Share2 className="w-3 h-3 text-neutral-400" />
            <span>{copied ? 'Copied link' : 'Share record'}</span>
          </button>
        </div>
      </div>

      {/* Main Signal Header */}
      <header className="space-y-4 border-b border-white/[0.08] pb-6">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-400">
          <span className="text-neutral-300 font-medium">{signal.category}</span>
          <span>·</span>
          <span>{signal.source_label}</span>
          {signal.verification_status === 'verified' && (
            <>
              <span>·</span>
              <span className="text-neutral-300">Verified record</span>
            </>
          )}
          <span>·</span>
          <span className="font-mono text-[11px] text-neutral-400">
            {signal.id}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
          {signal.title}
        </h1>

        {/* Timestamps & Canonical Source */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-neutral-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>Published: <strong className="font-mono text-neutral-200 font-normal">{signal.published_at.slice(0, 10)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Discovered: <strong className="font-mono text-neutral-200 font-normal">{signal.discovered_at.slice(0, 10)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-neutral-400" />
            <span>Importance: <strong className="font-mono text-neutral-200 font-normal">{signal.importance_score}/100</strong></span>
          </div>

          <div>
            <a
              href={signal.canonical_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-neutral-300 hover:text-white underline underline-offset-2"
            >
              <span>Canonical source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Lifecycle Progression */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-4">
        <span className="text-xs text-neutral-400 block mb-2 font-medium">
          Auditable lifecycle progression
        </span>
        <div className="grid grid-cols-5 gap-1.5 text-xs text-center">
          {['Discovered', 'Processed', 'Verified', 'Published', 'Archived'].map((stage, idx) => {
            const isCompleted = true;
            const isCurrent = stage === 'Published';
            return (
              <div
                key={stage}
                className={`py-1.5 px-1 rounded border text-xs ${
                  isCurrent
                    ? 'bg-white/[0.08] border-white/20 text-white font-medium'
                    : isCompleted
                    ? 'bg-neutral-900 border-white/[0.04] text-neutral-300'
                    : 'bg-neutral-950 border-transparent text-neutral-400'
                }`}
              >
                {stage}
              </div>
            );
          })}
        </div>
      </div>

      {/* THREE EXPLICIT PILLARS OF TRUTH */}
      <div className="space-y-6">
        {/* PILLAR 1: SOURCE-DERIVED FACTS */}
        <section className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
            <CheckCircle2 className="w-4 h-4 text-neutral-300" />
            <h3 className="text-sm font-semibold text-white">
              Source-derived facts (deterministic evidence)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Statements directly extracted from official changelogs, release tags, or cryptographic commits without generative interpolation:
          </p>
          <ul className="space-y-2 text-xs text-neutral-200">
            {signal.source_derived_facts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-neutral-400 shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* PILLAR 2: TECHNICAL SYNTHESIS */}
        <section className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-neutral-300" />
              <h3 className="text-sm font-semibold text-white">
                Technical analysis & synthesis
              </h3>
            </div>
            <span className="font-mono text-xs text-neutral-400">
              Confidence: {Math.round(signal.confidence_score * 100)}%
            </span>
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-neutral-300">
            <p className="font-medium text-neutral-100">{signal.summary}</p>
            <p className="text-neutral-400">{signal.detailed_summary}</p>
          </div>
          {signal.ai_analysis && (
            <div className="pt-2 border-t border-white/[0.04] text-xs text-neutral-400 leading-relaxed">
              {signal.ai_analysis}
            </div>
          )}
        </section>

        {/* PILLAR 3: INFERRED RELATIONSHIPS */}
        <section className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
            <GitBranch className="w-4 h-4 text-neutral-300" />
            <h3 className="text-sm font-semibold text-white">
              Ecosystem relationships & dependencies
            </h3>
          </div>
          {signal.inferred_relationships && signal.inferred_relationships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {signal.inferred_relationships.map((rel, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTechnology(rel.target)}
                  className="p-3 rounded bg-neutral-900 border border-white/[0.06] hover:border-white/[0.2] cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-neutral-400 text-[11px] block capitalize">
                      {rel.relationship.replace('_', ' ')}
                    </span>
                    <span className="text-white font-medium">{rel.target_name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {Math.round(rel.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400">
              Direct primary signal. No secondary inferred dependencies recorded.
            </p>
          )}
        </section>
      </div>

      {/* EVIDENCE LEDGER CHECKLIST */}
      <section className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-300" />
            <h3 className="text-sm font-semibold text-white">Evidence ledger & primary proofs</h3>
          </div>
          <span className="text-xs text-neutral-400">
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
                  <span className="font-sans text-[11px] text-neutral-300">
                    {item.verified ? '✓ Verified' : 'Pending audit'}
                  </span>
                  <span className="text-neutral-400">·</span>
                  <span className="font-medium text-white">{item.label}</span>
                </div>
                {item.details && (
                  <p className="text-xs text-neutral-400">{item.details}</p>
                )}
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-300 hover:text-white underline underline-offset-2 flex items-center gap-1 shrink-0"
              >
                <span>View evidence</span>
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
          <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            Associated technologies
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {signal.technologies.map((techSlug) => (
              <button
                key={techSlug}
                onClick={() => onSelectTechnology(techSlug)}
                className="px-2.5 py-1 rounded bg-neutral-900 border border-white/[0.06] hover:border-white/30 text-xs font-mono text-neutral-200 hover:text-white transition-colors"
              >
                #{techSlug}
              </button>
            ))}
          </div>
        </div>

        {/* Named Entities Detected */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-md p-4 space-y-2">
          <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-neutral-400" />
            Extracted entities
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {signal.entities.map((ent, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-neutral-900/60 border border-white/[0.04] text-xs text-neutral-300"
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
