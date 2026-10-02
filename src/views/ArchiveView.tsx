import React, { useState, useEffect } from 'react';
import { Signal, Technology, VerificationStatus, CategoryType } from '../types';
import { SignalCard } from '../components/cards/SignalCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

interface Props {
  onSelectSignal: (id: string) => void;
  initialCategory?: string;
  initialTechnology?: string;
}

export const ArchiveView: React.FC<Props> = ({
  onSelectSignal,
  initialCategory,
  initialTechnology,
}) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(initialCategory || 'all');
  const [techFilter, setTechFilter] = useState<string>(initialTechnology || 'all');
  const [source, setSource] = useState<string>('all');
  const [verification, setVerification] = useState<string>('all');
  const [minImportance, setMinImportance] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'date' | 'importance'>('date');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const categories: CategoryType[] = [
    'AI',
    'AI Agents',
    'Frontend',
    'Frameworks',
    'TypeScript',
    'Python',
    'Rust',
    'Backend',
    'Databases',
    'Security',
    'DevTools',
    'Research',
    'Open Source',
  ];

  useEffect(() => {
    let isCurrent = true;
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'all') params.set('category', category);
    if (techFilter !== 'all') params.set('technology', techFilter);
    if (source !== 'all') params.set('source', source);
    if (verification !== 'all') params.set('verification', verification);
    if (minImportance > 0) params.set('minImportance', String(minImportance));

    fetch(`/api/signals?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!isCurrent) return;
        let list: Signal[] = data.signals || [];
        if (sortBy === 'importance') {
          list = list.sort((a, b) => b.importance_score - a.importance_score);
        } else {
          list = list.sort(
            (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
        }
        setSignals(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch signals:', err);
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [category, techFilter, source, verification, minImportance, sortBy, search]);

  useEffect(() => {
    fetch('/api/technologies')
      .then((r) => r.json())
      .then((d) => setTechnologies(d.technologies || []))
      .catch(console.error);
  }, []);

  const fetchSignals = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'all') params.set('category', category);
    if (techFilter !== 'all') params.set('technology', techFilter);
    if (source !== 'all') params.set('source', source);
    if (verification !== 'all') params.set('verification', verification);
    if (minImportance > 0) params.set('minImportance', String(minImportance));

    fetch(`/api/signals?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        let list: Signal[] = data.signals || [];
        if (sortBy === 'importance') {
          list = list.sort((a, b) => b.importance_score - a.importance_score);
        } else {
          list = list.sort(
            (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
        }
        setSignals(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch signals:', err);
        setLoading(false);
      });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setTechFilter('all');
    setSource('all');
    setVerification('all');
    setMinImportance(0);
    setSortBy('date');
    setPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(signals.length / pageSize) || 1;
  const paginatedSignals = signals.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 py-6">
      {/* Archive Header */}
      <div className="border-b border-white/[0.08] pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight mb-2">
          Technology Signals Archive
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-3xl leading-relaxed">
          The verified structured ledger of software ecosystem changes, version releases, RFC proposals, security advisories, and architectural breakthroughs.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-4 space-y-4">
        {/* Search & Reset Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter by title, keywords, tags, or facts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchSignals();
              }}
              className="w-full bg-[#0c0d0e] border border-white/[0.08] rounded pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSignals}
              className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-xs font-mono text-white rounded transition-colors"
            >
              Apply Filter
            </button>
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-1.5 text-neutral-400 hover:text-white bg-[#0c0d0e] border border-white/[0.08] rounded hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Facet Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
          {/* Category */}
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0c0d0e] border border-white/[0.08] rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Technology */}
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">Technology</label>
            <select
              value={techFilter}
              onChange={(e) => {
                setTechFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0c0d0e] border border-white/[0.08] rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none"
            >
              <option value="all">All Technologies</option>
              {technologies.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">Source Type</label>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0c0d0e] border border-white/[0.08] rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="official_blog">Official Blog</option>
              <option value="github_release">GitHub Release</option>
              <option value="cve_feed">CVE Advisory</option>
              <option value="arxiv">arXiv Preprint</option>
              <option value="npm">npm Registry</option>
              <option value="pypi">PyPI</option>
            </select>
          </div>

          {/* Verification */}
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">Verification</label>
            <select
              value={verification}
              onChange={(e) => {
                setVerification(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0c0d0e] border border-white/[0.08] rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="partially_verified">Partially Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {/* Importance */}
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">Min Importance ({minImportance})</label>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minImportance}
              onChange={(e) => {
                setMinImportance(Number(e.target.value));
                setPage(1);
              }}
              className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-amber-400 mt-2"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="w-full bg-[#0c0d0e] border border-white/[0.08] rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none"
            >
              <option value="date">Newest First</option>
              <option value="importance">Highest Importance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result Status Count */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
        <div>
          Showing {paginatedSignals.length} of {signals.length} archived signals
        </div>
        <div className="flex items-center gap-2">
          <span>Page {page} of {totalPages}</span>
        </div>
      </div>

      {/* Signals Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-neutral-400 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Querying archive ledger...</span>
        </div>
      ) : paginatedSignals.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/[0.08] rounded-md space-y-2">
          <p className="text-xs font-mono text-neutral-400">
            No signals match the specified filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="text-xs font-mono text-amber-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedSignals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onClick={() => onSelectSignal(signal.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/[0.08] font-mono text-xs">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded bg-[#121316] border border-white/[0.08] text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-7 h-7 rounded text-xs transition-colors ${
                page === i + 1
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#121316] text-neutral-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 rounded bg-[#121316] border border-white/[0.08] text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
