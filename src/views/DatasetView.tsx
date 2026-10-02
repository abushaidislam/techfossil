import React, { useState } from 'react';
import { Database, Download, FileCode, FileText, Table, Check, ExternalLink, Terminal } from 'lucide-react';

export const DatasetView: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (format: string) => {
    setDownloading(format);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `techfossil-export.${format === 'markdown' ? 'md' : format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export download error:', err);
    } finally {
      setTimeout(() => setDownloading(null), 1200);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      {/* Header */}
      <header className="border-b border-white/[0.08] pb-6 space-y-2">
        <div className="flex items-center gap-2 font-sans text-xs text-neutral-400">
          <Database className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">Public technology dataset</span>
        </div>
        <h1 className="text-3xl font-bold text-white font-sans tracking-tight">
          TechFossil Structured Intelligence Dataset
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed max-w-2xl">
          All verified ecosystem signals, releases, and timelines are released as open public datasets for AI training, academic research, and ecosystem analytics under Open Data Commons (CC0).
        </p>
      </header>

      {/* Export Formats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            format: 'json',
            name: 'Full JSON Bundle',
            desc: 'Complete structured hierarchy with evidence ledgers & relations.',
            icon: FileCode,
            color: 'text-amber-400',
          },
          {
            format: 'jsonl',
            name: 'NDJSON / JSONL',
            desc: 'Line-delimited stream format ideal for LLM fine-tuning pipelines.',
            icon: Terminal,
            color: 'text-emerald-400',
          },
          {
            format: 'csv',
            name: 'Tabular CSV',
            desc: 'Flattened tabular rows for Pandas, Excel, and SQL ingestion.',
            icon: Table,
            color: 'text-sky-400',
          },
          {
            format: 'markdown',
            name: 'Markdown Digest',
            desc: 'Human-readable documentation format with citations & facts.',
            icon: FileText,
            color: 'text-purple-400',
          },
        ].map((item) => {
          const Icon = item.icon;
          const isCurrent = downloading === item.format;
          return (
            <div
              key={item.format}
              className="bg-[#121316] border border-white/[0.08] rounded-md p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <h3 className="font-mono text-sm font-bold text-white">{item.name}</h3>
                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => handleDownload(item.format)}
                className="w-full py-1.5 px-3 rounded bg-white/[0.08] hover:bg-white/[0.14] text-xs font-mono text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isCurrent ? 'Downloading...' : `Download .${item.format}`}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Partitioning Architecture */}
      <section className="bg-[#121316] border border-white/[0.08] rounded-md p-6 space-y-4">
        <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
          <span>Sensible Directory Partitioning</span>
        </h3>
        <p className="text-xs text-neutral-300 font-sans leading-relaxed">
          To maintain human-readable Git history without repository bloat, data is partitioned chronologically by year, month, and domain:
        </p>

        <pre className="p-4 rounded bg-[#0a0b0d] border border-white/[0.06] font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed">
{`/data
  ├── signals/
  │   └── 2026/
  │       ├── 09/
  │       │   └── signals-2026-09.json
  │       └── 10/
  │           └── signals-2026-10.json
  ├── technologies/
  │   └── index.json
  ├── releases/
  │   └── 2026-releases.json
  ├── security/
  │   └── cve-advisories.json
  ├── research/
  │   └── arxiv-papers.json
  └── digests/
      └── daily/
          └── 2026-10-01.json`}
        </pre>
      </section>

      {/* Reproducibility & Open Source Commitment */}
      <section className="bg-[#121316] border border-white/[0.08] rounded-md p-6 space-y-3">
        <h3 className="text-base font-bold text-white font-sans">
          Zero Synthetic Commit Guarantee
        </h3>
        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
          Every Git commit to the TechFossil data repository maps to verified upstream source arrivals (GitHub releases, npm manifests, CVE disclosures, or arXiv publications). TechFossil strictly rejects empty whitespace commits or vanity graph manipulations.
        </p>
      </section>
    </div>
  );
};
