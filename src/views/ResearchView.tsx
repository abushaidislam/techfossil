import React, { useState, useEffect } from 'react';
import { ResearchPaper } from '../types';
import { BookOpen, ExternalLink, Search, Sparkles } from 'lucide-react';

interface Props {
  onSelectSignal?: (id: string) => void;
  onSelectTechnology?: (slug: string) => void;
}

export const ResearchView: React.FC<Props> = ({ onSelectSignal, onSelectTechnology }) => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/research')
      .then((res) => res.json())
      .then((data) => setPapers(data.papers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.abstract.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="border-b border-white/[0.08] pb-6 space-y-2">
        <div className="flex items-center gap-2 font-sans text-xs text-neutral-400">
          <BookOpen className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">Academic & preprint intelligence</span>
        </div>
        <h1 className="text-3xl font-bold text-white font-sans tracking-tight">
          arXiv Computer Science Research Archive
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
          Peer-reviewed preprints and research breakthroughs in autonomous agents, formal code verification, runtime optimization, and distributed systems.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Filter research papers by title, author, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#121316] border border-white/[0.08] rounded pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-purple-400 font-sans"
        />
      </div>

      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-neutral-400 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Retrieving research preprints...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-neutral-400 border border-dashed border-white/[0.08] rounded">
          No research papers match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((paper) => (
            <article
              key={paper.id}
              className="bg-[#121316] border border-white/[0.08] hover:border-white/[0.18] rounded-md p-5 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-bold">{paper.arxiv_id}</span>
                <span className="text-neutral-400">{paper.published_at.slice(0, 10)}</span>
              </div>

              <h2 className="text-base font-bold text-white font-sans leading-snug">
                {paper.title}
              </h2>

              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                {paper.abstract}
              </p>

              <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
                <span>Authors: <strong className="text-neutral-300">{paper.authors.join(', ')}</strong></span>
                <div className="flex items-center gap-3">
                  {paper.signal_id && onSelectSignal && (
                    <button
                      onClick={() => onSelectSignal(paper.signal_id!)}
                      className="text-amber-400 hover:underline"
                    >
                      View Signal Ledger →
                    </button>
                  )}
                  <a
                    href={paper.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>arXiv Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
