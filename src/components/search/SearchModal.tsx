import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Layers, X, ArrowRight, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { Signal, Technology, AIResearchSynthesis } from '../../types';
import { VerificationBadge } from '../badges/VerificationBadge';
import { CategoryBadge } from '../badges/CategoryBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSignal: (id: string) => void;
  onSelectTechnology: (slug: string) => void;
}

export const SearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectSignal,
  onSelectTechnology,
}) => {
  const [query, setQuery] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [aiSynthesis, setAiSynthesis] = useState<AIResearchSynthesis | null>(null);

  // Suggested research questions from product specification
  const suggestedQueries = [
    'What changed in React during 2026?',
    'What were the major AI agent developments in 2026?',
    'How has TypeScript evolved?',
    'What security vulnerabilities affected Node.js this year?',
    'What were the most important open-source releases this month?',
    'Which technologies are rapidly evolving?',
  ];

  // Perform search
  const executeSearch = async (searchQuery: string, forceAi = aiMode) => {
    if (!searchQuery.trim()) {
      setSignals([]);
      setTechnologies([]);
      setAiSynthesis(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&aiMode=${forceAi ? 'true' : 'false'}`
      );
      if (res.ok) {
        const data = await res.json();
        setSignals(data.signals || []);
        setTechnologies(data.technologies || []);
        setAiSynthesis(data.aiSynthesis || null);
      }
    } catch (err) {
      console.error('Search request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setAiSynthesis(null);
    setSignals([]);
    setTechnologies([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121316] border border-white/[0.12] rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3 bg-[#0f1012]">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder={
              aiMode
                ? 'Ask a research question grounded in TechFossil archive...'
                : 'Search technologies, releases, CVEs, or signals...'
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              executeSearch(e.target.value, aiMode);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                executeSearch(query, aiMode);
              }
            }}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-400 focus:outline-none font-sans"
          />

          {/* Research Mode Toggle */}
          <button
            onClick={() => {
              const next = !aiMode;
              setAiMode(next);
              if (query.trim()) executeSearch(query, next);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-sans font-medium transition-colors border ${
              aiMode
                ? 'bg-white text-black border-white'
                : 'bg-neutral-900 border-white/[0.08] text-neutral-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Research mode</span>
          </button>

          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-white/[0.04]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Preset Suggested Questions if empty */}
          {!query && (
            <div className="space-y-3">
              <span className="font-sans text-xs text-neutral-400 font-medium block">
                Suggested research queries:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(q);
                      setAiMode(true);
                      executeSearch(q, true);
                    }}
                    className="text-left p-2.5 rounded bg-neutral-900/60 hover:bg-neutral-800/80 border border-white/[0.04] text-xs text-neutral-300 hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center text-xs font-sans text-neutral-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching structured ledger & synthesizing archive citations...</span>
            </div>
          )}

          {/* Research Synthesis Box */}
          {aiSynthesis && (
            <div className="bg-[#16171b] border border-white/[0.1] rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-neutral-300" />
                  <span className="font-semibold text-xs text-white font-sans">
                    Grounded archive synthesis
                  </span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400">
                  {aiSynthesis.analyzed_signals_count} verified records analyzed
                </span>
              </div>

              {/* Answer content */}
              <div className="text-xs text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap">
                {aiSynthesis.answer}
              </div>

              {/* Direct Citations List */}
              {aiSynthesis.direct_citations.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <span className="font-sans text-[11px] text-neutral-400 font-medium block">
                    Direct archive citations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {aiSynthesis.direct_citations.map((cite) => (
                      <div
                        key={cite.signal_id}
                        onClick={() => {
                          onSelectSignal(cite.signal_id);
                          onClose();
                        }}
                        className="p-1.5 rounded bg-neutral-900 border border-white/[0.04] text-[11px] font-sans cursor-pointer hover:border-white/30 transition-colors flex items-center justify-between"
                      >
                        <span className="truncate text-neutral-300">{cite.title}</span>
                        <span className="font-mono text-neutral-400 text-[10px] shrink-0 ml-2">{cite.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="pt-2 flex items-center gap-1.5 text-[10px] font-sans text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{aiSynthesis.disclaimer}</span>
              </div>
            </div>
          )}

          {/* Matched Technologies */}
          {technologies.length > 0 && (
            <div className="space-y-2">
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider block">
                Matched Technologies ({technologies.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {technologies.map((tech) => (
                  <div
                    key={tech.slug}
                    onClick={() => {
                      onSelectTechnology(tech.slug);
                      onClose();
                    }}
                    className="p-2.5 rounded bg-neutral-900/60 hover:bg-neutral-800 border border-white/[0.04] cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-white">{tech.name}</h4>
                      <p className="text-[11px] text-neutral-400 truncate max-w-xs">
                        {tech.description}
                      </p>
                    </div>
                    <CategoryBadge category={tech.category} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Signals */}
          {signals.length > 0 && (
            <div className="space-y-2">
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider block">
                Archived Signals ({signals.length})
              </span>
              <div className="space-y-2">
                {signals.map((sig) => (
                  <div
                    key={sig.id}
                    onClick={() => {
                      onSelectSignal(sig.id);
                      onClose();
                    }}
                    className="p-3 rounded bg-neutral-900/40 hover:bg-neutral-900 border border-white/[0.04] cursor-pointer transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={sig.category} size="sm" />
                        <span className="font-mono text-[11px] text-neutral-400">
                          {sig.published_at.slice(0, 10)}
                        </span>
                      </div>
                      <VerificationBadge status={sig.verification_status} size="sm" />
                    </div>
                    <h4 className="font-semibold text-xs text-white">{sig.title}</h4>
                    <p className="text-xs text-neutral-400 line-clamp-1">{sig.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && !loading && signals.length === 0 && technologies.length === 0 && !aiSynthesis && (
            <div className="py-12 text-center text-xs font-mono text-neutral-400 border border-dashed border-white/[0.08] rounded">
              No verified records or technology entities found matching &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0e0f11] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Enter</kbd> to search</span>
            <span><kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Esc</kbd> to close</span>
          </div>
          <span>TechFossil Ledger Search</span>
        </div>
      </div>
    </div>
  );
};
