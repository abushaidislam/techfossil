import React, { useState, useEffect } from 'react';
import { Technology } from '../types';
import { TechnologyCard } from '../components/cards/TechnologyCard';
import { Search, Layers, Filter } from 'lucide-react';

interface Props {
  onSelectTechnology: (slug: string) => void;
}

export const TechnologiesView: React.FC<Props> = ({ onSelectTechnology }) => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/technologies')
      .then((res) => res.json())
      .then((data) => setTechnologies(data.technologies || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(technologies.map((t) => t.category)));

  const filtered = technologies.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      t.name.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.aliases.some((a) => a.toLowerCase().includes(term)) ||
      t.tags.some((tag) => tag.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 py-6">
      <div className="border-b border-white/[0.08] pb-6 space-y-2 font-sans">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Layers className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">Technology directory</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Monitored technologies, runtimes & frameworks
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl">
          Deep historical profiles, release histories, dependency graphs, and vulnerability records for foundational technologies in the modern software stack.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121316] border border-white/[0.08] rounded-md p-3 font-sans">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by technology name, alias, organization, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0c0d0e] border border-white/[0.08] rounded pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#0c0d0e] border border-white/[0.08] rounded px-3 py-1.5 text-xs text-neutral-200 focus:outline-none font-sans"
        >
          <option value="all">All domains ({technologies.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-neutral-400 flex items-center justify-center gap-2 font-sans">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading technology profiles...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 border border-dashed border-white/[0.08] rounded font-sans">
          No technologies found matching &quot;{search}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tech) => (
            <TechnologyCard
              key={tech.slug}
              technology={tech}
              onClick={() => onSelectTechnology(tech.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
