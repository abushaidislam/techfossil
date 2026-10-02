import React, { useState, useEffect } from 'react';
import { ProcessingJob } from '../types';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  GitMerge,
  Filter,
  RefreshCw,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';

interface Props {
  onSelectSignal?: (id: string) => void;
}

export const IngestionControlView: React.FC<Props> = ({ onSelectSignal }) => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [adapters, setAdapters] = useState<any[]>([]);
  const [duplicateCandidates, setDuplicateCandidates] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isRunning, setIsRunning] = useState(false);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; action: string; title: string }>({
    open: false,
    action: '',
    title: '',
  });

  const pipelineStages = [
    'COLLECT',
    'NORMALIZE',
    'DEDUPLICATE',
    'CLASSIFY',
    'EXTRACT ENTITIES',
    'VERIFY',
    'CALCULATE IMPORTANCE',
    'CREATE RELATIONSHIPS',
    'STORE',
    'INDEX',
    'TIMELINE UPDATE',
    'DIGEST SYNC',
  ];

  const loadData = async () => {
    try {
      const [jobsRes, dupRes] = await Promise.all([
        fetch('/api/jobs').then((r) => r.json()),
        fetch('/api/duplicates').then((r) => r.json()),
      ]);

      setJobs(jobsRes.jobs || []);
      setAdapters(jobsRes.adapters || []);
      setDuplicateCandidates(dupRes.candidates || []);
      if (jobsRes.jobs && jobsRes.jobs.length > 0 && !currentJob) {
        setCurrentJob(jobsRes.jobs[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/jobs').then((r) => r.json()),
      fetch('/api/duplicates').then((r) => r.json()),
    ])
      .then(([jobsRes, dupRes]) => {
        if (!active) return;
        setJobs(jobsRes.jobs || []);
        setAdapters(jobsRes.adapters || []);
        setDuplicateCandidates(dupRes.candidates || []);
        if (jobsRes.jobs && jobsRes.jobs.length > 0) {
          setCurrentJob((prev) => prev || jobsRes.jobs[0]);
        }
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, []);

  const triggerIngestion = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/ingestion/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: selectedSource }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentJob(data.job);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResolveDuplicate = async (id: string, action: 'merge' | 'reject') => {
    try {
      const res = await fetch('/api/duplicates/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setDuplicateCandidates((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: action === 'merge' ? 'merged' : 'rejected' } : c))
        );
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-neutral-400 mb-1">
            <Terminal className="w-4 h-4 text-neutral-400" />
            <span className="font-medium">Ingestion control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
            Ingestion Pipeline Orchestrator
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl font-sans">
            Trigger automated upstream cycles, inspect deterministic deduplication and entity resolution, and audit real-time pipeline execution logs.
          </p>
        </div>

        {/* Trigger Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-[#121316] border border-white/[0.08] rounded px-3 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none"
          >
            <option value="all">All Sources (Batch)</option>
            <option value="github_releases">GitHub Releases</option>
            <option value="npm_registry">npm Registry</option>
            <option value="arxiv_cs">arXiv Computer Science</option>
            <option value="cve_security">CVE & NVD Feed</option>
          </select>

          <button
            disabled={isRunning}
            onClick={triggerIngestion}
            className="px-4 py-1.5 rounded bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-medium text-xs font-sans transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Run Ingestion Cycle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 14-Stage Visualizer */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            14-Stage Data Pipeline Architecture
          </h3>
          <span className="font-mono text-xs text-neutral-400">
            Lifecycle: Discovered → Verified → Published
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 font-mono text-xs">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage}
              className={`p-2.5 rounded border text-center flex flex-col justify-between ${
                isRunning
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-neutral-900/60 border-white/[0.04] text-neutral-300'
              }`}
            >
              <span className="text-[10px] text-neutral-400 block font-bold mb-1">
                STAGE {idx + 1}
              </span>
              <span className="font-semibold text-xs">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Current Job Logs & Duplicate Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution Logs */}
        <div className="lg:col-span-2 bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Pipeline Execution Log Terminal {currentJob ? `[Job ${currentJob.id}]` : ''}
            </h3>
            {currentJob && (
              <span className="font-mono text-xs text-emerald-400 font-bold">
                {currentJob.status.toUpperCase()}
              </span>
            )}
          </div>

          <div className="bg-[#0a0b0d] border border-white/[0.04] rounded p-3 font-mono text-xs text-neutral-300 space-y-1.5 h-80 overflow-y-auto">
            {currentJob?.logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-neutral-400 text-[11px] shrink-0">[{log.timestamp}]</span>
                <span
                  className={`text-[11px] uppercase font-bold shrink-0 ${
                    log.level === 'error'
                      ? 'text-rose-400'
                      : log.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-sky-400'
                  }`}
                >
                  {log.level}:
                </span>
                <span className="text-neutral-200">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Duplicate Entity Resolution Ledger */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
          <div className="border-b border-white/[0.06] pb-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-sky-400" />
              Entity Aliasing & Deduplication
            </h3>
          </div>

          <p className="text-xs text-neutral-400 font-sans">
            The entity system detects alias variations (e.g. &quot;ReactJS&quot; → &quot;React&quot;) to maintain a clean canonical knowledge base.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {duplicateCandidates.map((cand) => (
              <div
                key={cand.id}
                className="p-3 rounded bg-neutral-900 border border-white/[0.04] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">{cand.targetName}</span>
                  <span className="text-[10px] text-neutral-400">
                    {Math.round(cand.confidence * 100)}% match
                  </span>
                </div>
                <div className="text-[11px] text-neutral-300">
                  Maps to canonical: <strong className="text-white font-mono">#{cand.canonicalSlug}</strong>
                </div>

                {cand.status === 'pending' ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleResolveDuplicate(cand.id, 'merge')}
                      className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] rounded transition-colors"
                    >
                      Approve Merge
                    </button>
                    <button
                      onClick={() => handleResolveDuplicate(cand.id, 'reject')}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-[10px] rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span
                    className={`inline-block text-[10px] uppercase font-bold ${
                      cand.status === 'merged' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Status: {cand.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Source Adapters Ledger */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300">
          Configured Source Adapters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {adapters.map((adapter) => (
            <div key={adapter.id} className="p-3.5 rounded bg-neutral-900/60 border border-white/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate">{adapter.name}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans line-clamp-2 leading-relaxed">
                {adapter.description}
              </p>
              <div className="text-[10px] text-neutral-400 pt-1 border-t border-white/[0.04] flex items-center justify-between">
                <span>Rate: {adapter.rateLimitPerMinute}/min</span>
                <span>{adapter.frequency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
