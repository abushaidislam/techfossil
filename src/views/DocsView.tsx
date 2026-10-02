import React, { useState } from 'react';
import { BookOpen, Code, Database, Terminal, Shield, Sparkles, GitBranch, Layers } from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'architecture' | 'data-model' | 'ingestion' | 'ai' | 'api' | 'contributing'>('architecture');

  const docs = [
    { id: 'architecture', title: 'Architecture Specification', icon: Layers },
    { id: 'data-model', title: 'Data Model & Evidence Rules', icon: Database },
    { id: 'ingestion', title: 'Ingestion Pipeline & Adapters', icon: Terminal },
    { id: 'ai', title: 'Gemini AI & Grounding Protocols', icon: Sparkles },
    { id: 'api', title: 'REST API Reference', icon: Code },
    { id: 'contributing', title: 'Contributing & Source Adapters', icon: GitBranch },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div className="border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 font-sans text-xs text-neutral-400 mb-1">
          <BookOpen className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">Archive specification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
          System Documentation & Specifications
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1 font-mono text-xs">
          {docs.map((d) => {
            const Icon = d.icon;
            const isActive = activeDoc === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDoc(d.id as any)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors ${
                  isActive
                    ? 'bg-white/[0.1] text-white font-bold border border-white/[0.1]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{d.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="md:col-span-3 bg-[#121316] border border-white/[0.08] rounded-md p-6 font-sans text-xs text-neutral-300 leading-relaxed space-y-6">
          {activeDoc === 'architecture' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-sans">TechFossil Core Architecture</h2>
              <p>
                TechFossil is architected as an immutable, open-source technology intelligence ledger. Unlike ephemeral RSS aggregators or social trackers, TechFossil converts unstructured upstream announcements into verified, typed entities with deep historical timelines.
              </p>

              <h3 className="font-mono text-xs font-bold uppercase text-amber-400 pt-2">
                14-Stage Processing Pipeline:
              </h3>
              <pre className="p-3 bg-neutral-900/90 rounded border border-white/[0.06] font-mono text-[11px] text-neutral-200 overflow-x-auto">
{`SOURCE (GitHub, npm, PyPI, arXiv, CVE, Official Blogs)
  ↓
COLLECT (Generic SourceAdapter Interface)
  ↓
NORMALIZE (Canonical URL, ISO 8601 Timestamps, Schema Enforcement)
  ↓
DEDUPLICATE (URL Deduplication & Content Fingerprinting)
  ↓
CLASSIFY (Category & Domain Assignment)
  ↓
EXTRACT ENTITIES (Technology, Organization, Person Named Recognition)
  ↓
VERIFY (Primary Proof Validation & Cryptographic Commit Check)
  ↓
GENERATE SUMMARY (Concise Technical Overview via Gemini 3.8 Flash)
  ↓
CALCULATE IMPORTANCE (Algorithmic Velocity & Ecosystem Impact Score)
  ↓
CREATE RELATIONSHIPS (Knowledge Graph Edge Binding)
  ↓
STORE (Relational & Normalized Archive Ledger)
  ↓
INDEX (Inverted Token Index & Semantic Vector Projection)
  ↓
TIMELINE (Milestone Projection across Year / Quarter)
  ↓
DAILY DIGEST & PUBLIC ARCHIVE EXPORT`}
              </pre>
            </div>
          )}

          {activeDoc === 'data-model' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-sans">Data Model & Three Pillars of Truth</h2>
              <p>
                A core product principle of TechFossil is never presenting AI speculations or inferred conjectures as ground facts. Every record strictly isolates three facets:
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-emerald-400 font-bold block mb-1">1. SOURCE-DERIVED FACTS</span>
                  <p className="font-sans text-neutral-300">
                    Exact claims verifiable in the primary source document (release notes, CVE advisory, arXiv abstract). No generative hallucination.
                  </p>
                </div>

                <div className="p-3 rounded bg-amber-950/20 border border-amber-500/20">
                  <span className="text-amber-400 font-bold block mb-1">2. AI-GENERATED SYNTHESIS</span>
                  <p className="font-sans text-neutral-300">
                    Contextual interpretation produced by Gemini 3.8 Flash summarizing architectural significance. Explicitly marked with confidence score.
                  </p>
                </div>

                <div className="p-3 rounded bg-sky-950/20 border border-sky-500/20">
                  <span className="text-sky-400 font-bold block mb-1">3. DERIVED RELATIONSHIPS</span>
                  <p className="font-sans text-neutral-300">
                    Ecosystem knowledge graph edges (e.g. Next.js depends_on React, Anthropic developed Claude) with confidence metrics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDoc === 'ingestion' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-sans">Source Adapter Specification</h2>
              <p>
                All sources implement the standard <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-amber-300">SourceAdapter</code> interface:
              </p>
              <pre className="p-3 bg-neutral-900 rounded border border-white/[0.06] font-mono text-[11px] text-neutral-200">
{`interface SourceAdapter {
  getSourceMetadata(): SourceMetadata;
  fetch(): Promise<RawDiscoveredItem[]>;
  normalize(item: RawDiscoveredItem): Promise<Partial<Signal>>;
  identify(item: RawDiscoveredItem): string; // unique hash
}`}
              </pre>
              <p>
                Connectors respect upstream rate limits, robots.txt, and authentication policies. Official sources are prioritized over secondary aggregators.
              </p>
            </div>
          )}

          {activeDoc === 'ai' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-sans">Gemini AI Grounding Protocol</h2>
              <p>
                TechFossil uses the official modern <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-amber-300">@google/genai</code> SDK with model <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-amber-300">gemini-3.8-flash</code> strictly on the server-side.
              </p>
              <p>
                When a user queries the archive in AI Research Mode, TechFossil first retrieves candidate signals from the historical ledger and prompts Gemini exclusively with retrieved evidence. Direct citations back to signal IDs are mandatory.
              </p>
            </div>
          )}

          {activeDoc === 'api' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-sans">REST API Reference</h2>
              <p>TechFossil exposes standard JSON endpoints for programmatic integration:</p>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04]">
                  <span className="text-emerald-400 font-bold">GET</span> /api/signals?category=&technology=&q=
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04]">
                  <span className="text-emerald-400 font-bold">GET</span> /api/signals/:id
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04]">
                  <span className="text-emerald-400 font-bold">GET</span> /api/technologies
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04]">
                  <span className="text-emerald-400 font-bold">GET</span> /api/technologies/:slug
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04]">
                  <span className="text-emerald-400 font-bold">GET</span> /api/digest/daily?date=
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04]">
                  <span className="text-emerald-400 font-bold">GET</span> /api/graph
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04]">
                  <span className="text-amber-400 font-bold">POST</span> /api/ai/research
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04]">
                  <span className="text-emerald-400 font-bold">GET</span> /api/export?format=json|jsonl|csv|markdown
                </div>
              </div>
            </div>
          )}

          {activeDoc === 'contributing' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-sans">Contributing to TechFossil</h2>
              <p>
                TechFossil welcomes new source adapters, entity alias definitions, and classification improvements. To add a new source:
              </p>
              <ol className="list-decimal list-inside space-y-2 font-mono text-xs text-neutral-300">
                <li>Create an adapter class under <code className="text-amber-300">src/server/adapters/</code> implementing <code className="text-amber-300">SourceAdapter</code>.</li>
                <li>Register the adapter in <code className="text-amber-300">src/server/pipeline.ts</code>.</li>
                <li>Add integration tests verifying deterministic normalization and deduplication.</li>
                <li>Submit a Pull Request with conventional commit messages (e.g. <code className="text-amber-300">feat(adapter): add Rust crates.io adapter</code>).</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
