import React, { useState, useEffect } from 'react';
import { SecurityAdvisory } from '../types';
import { Shield, ShieldAlert, ExternalLink, Search } from 'lucide-react';

interface Props {
  onSelectSignal?: (id: string) => void;
  onSelectTechnology?: (slug: string) => void;
}

export const SecurityView: React.FC<Props> = ({ onSelectSignal, onSelectTechnology }) => {
  const [advisories, setAdvisories] = useState<SecurityAdvisory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/security')
      .then((res) => res.json())
      .then((data) => setAdvisories(data.advisories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = advisories.filter(
    (a) =>
      a.cve_id.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.affected_technology_slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 font-sans">
      <div className="border-b border-white/[0.08] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <ShieldAlert className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">Security advisories & CVE surveillance</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Security advisories & vulnerability feeds
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
          National Vulnerability Database (NVD) CVE disclosures, runtime sandbox escapes, and cryptographic patch verifications across monitored technologies.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Filter CVEs by ID, title, affected technology, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#121316] border border-white/[0.08] rounded pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-400 focus:outline-none focus:border-amber-400 font-sans"
        />
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Retrieving security bulletins...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 border border-dashed border-white/[0.08] rounded">
          No security advisories match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((cve) => (
            <article
              key={cve.id}
              className="bg-[#121316] border border-white/[0.08] hover:border-white/[0.16] rounded-md p-5 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-sm font-medium text-white">{cve.cve_id}</span>
                <span className="text-xs text-neutral-400 capitalize">
                  {cve.severity} severity
                </span>
              </div>

              <h2 className="text-base font-semibold text-white leading-snug">
                {cve.title}
              </h2>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {cve.description}
              </p>

              <div className="pt-2 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-400">
                <div>
                  Affected: <span className="text-neutral-300 font-mono">{cve.affected_versions}</span>
                </div>
                <div>
                  Patched: <span className="text-neutral-200 font-mono font-medium">{cve.patched_version}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                {cve.affected_technology_slug && onSelectTechnology && (
                  <button
                    onClick={() => onSelectTechnology(cve.affected_technology_slug)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Affected technology: <span className="text-neutral-200 font-mono font-medium">#{cve.affected_technology_slug}</span>
                  </button>
                )}
                <a
                  href={cve.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>Advisory source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
