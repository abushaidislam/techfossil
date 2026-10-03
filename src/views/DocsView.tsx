import React, { useState } from 'react';
import { BookOpen, Code, Database, Terminal, Shield, GitBranch, Layers, FileText } from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'architecture' | 'data-model' | 'ingestion' | 'ai' | 'api' | 'contributing'>('architecture');

  const docs = [
    { id: 'architecture', title: 'Architecture specification', icon: Layers },
    { id: 'data-model', title: 'Data model & evidence rules', icon: Database },
    { id: 'ingestion', title: 'Ingestion pipeline & adapters', icon: Terminal },
    { id: 'ai', title: 'Gemini grounding protocols', icon: FileText },
    { id: 'api', title: 'REST API reference', icon: Code },
    { id: 'contributing', title: 'Contributing & source adapters', icon: GitBranch },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 font-sans">
      <div className="border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <BookOpen className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">Archive documentation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          System documentation & specifications
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1 text-xs">
          {docs.map((d) => {
            const Icon = d.icon;
            const isActive = activeDoc === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDoc(d.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-medium border border-white/[0.1]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{d.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="md:col-span-3 bg-[#121316] border border-white/[0.08] rounded-md p-6 text-xs text-neutral-300 leading-relaxed space-y-6">
          {activeDoc === 'architecture' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">TechFossil core architecture</h2>
              <p>
                TechFossil is architected as an immutable, open-source technology intelligence ledger. Unlike ephemeral RSS aggregators or social trackers, TechFossil converts unstructured upstream announcements into verified, typed entities with deep historical timelines.
              </p>

              <h3 className="text-xs font-semibold text-neutral-200 pt-2">
                14-stage processing pipeline:
              </h3>
              <pre className="p-3 bg-neutral-900/90 rounded border border-white/[0.06] font-mono text-[11px] text-neutral-200 overflow-x-auto leading-relaxed">
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
              <h2 className="text-lg font-semibold text-white">Data model & three pillars of truth</h2>
              <p>
                A core product principle of TechFossil is never presenting AI speculations or inferred conjectures as ground facts. Every record strictly isolates three facets:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded bg-neutral-900 border border-white/[0.06]">
                  <span className="text-white font-medium block mb-1">1. Source-derived facts (deterministic)</span>
                  <p className="text-neutral-300">
                    Exact claims verifiable in the primary source document (release notes, CVE advisory, arXiv abstract). No generative hallucination.
                  </p>
                </div>

                <div className="p-3 rounded bg-neutral-900 border border-white/[0.06]">
                  <span className="text-white font-medium block mb-1">2. AI-generated synthesis</span>
                  <p className="text-neutral-300">
                    Contextual interpretation produced by Gemini 3.8 Flash summarizing architectural significance. Explicitly marked with confidence score.
                  </p>
                </div>

                <div className="p-3 rounded bg-neutral-900 border border-white/[0.06]">
                  <span className="text-white font-medium block mb-1">3. Derived relationships</span>
                  <p className="text-neutral-300">
                    Ecosystem knowledge graph edges (e.g. Next.js depends_on React, Anthropic developed Claude) with confidence metrics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDoc === 'ingestion' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Source adapter specification</h2>
              <p>
                All sources implement the standard <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-neutral-200">SourceAdapter</code> interface:
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
              <h2 className="text-lg font-semibold text-white">Gemini AI grounding protocol</h2>
              <p>
                TechFossil uses the official modern <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-neutral-200">@google/genai</code> SDK with model <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded text-neutral-200">gemini-3.8-flash</code> strictly on the server-side.
              </p>
              <p>
                When a user queries the archive in AI Research Mode, TechFossil first retrieves candidate signals from the historical ledger and prompts Gemini exclusively with retrieved evidence. Direct citations back to signal IDs are mandatory.
              </p>
            </div>
          )}

          {activeDoc === 'api' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">REST API reference</h2>
              <p>TechFossil exposes standard JSON endpoints for programmatic integration:</p>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04] flex items-center gap-2">
                  <span className="text-neutral-400 font-semibold">GET</span>
                  <span className="text-neutral-200">/api/signals?category=&technology=&q=</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04] flex items-center gap-2">
                  <span className="text-neutral-400 font-semibold">GET</span>
                  <span className="text-neutral-200">/api/signals/:id</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04] flex items-center gap-2">
                  <span className="text-neutral-400 font-semibold">GET</span>
                  <span className="text-neutral-200">/api/technologies</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04] flex items-center gap-2">
                  <span className="text-neutral-400 font-semibold">GET</span>
                  <span className="text-neutral-200">/api/technologies/:slug</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04] flex items-center gap-2">
                  <span className="text-neutral-400 font-semibold">GET</span>
                  <span className="text-neutral-200">/api/digest/daily?date=</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04] flex items-center gap-2">
                  <span className="text-neutral-400 font-semibold">GET</span>
                  <span className="text-neutral-200">/api/graph</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04] flex items-center gap-2">
                  <span className="text-neutral-400 font-semibold">POST</span>
                  <span className="text-neutral-200">/api/ai/research</span>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-white/[0.04] flex items-center gap-2">
                  <span className="text-neutral-400 font-semibold">GET</span>
                  <span className="text-neutral-200">/api/export?format=json|jsonl|csv|markdown</span>
                </div>
              </div>
            </div>
          )}

          {activeDoc === 'contributing' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Contributing to TechFossil</h2>
              <p>
                TechFossil welcomes new source adapters, entity alias definitions, and classification improvements. To add a new source:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300">
                <li>Create an adapter class under <code className="font-mono text-neutral-200">src/server/adapters/</code> implementing <code className="font-mono text-neutral-200">SourceAdapter</code>.</li>
                <li>Register the adapter in <code className="font-mono text-neutral-200">src/server/pipeline.ts</code>.</li>
                <li>Add integration tests verifying deterministic normalization and deduplication.</li>
                <li>Submit a Pull Request with conventional commit messages (e.g. <code className="font-mono text-neutral-200">feat(adapter): add crates.io adapter</code>).</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
