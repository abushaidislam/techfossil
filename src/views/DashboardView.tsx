import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/cards/TechnologyCard';
import {
  Activity,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/metrics').then((r) => r.json()),
      fetch('/api/jobs').then((r) => r.json()),
    ])
      .then(([metData, jobData]) => {
        setMetrics(metData);
        setJobs(jobData.jobs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) {
    return (
      <div className="py-24 text-center font-mono text-xs text-neutral-400 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading system analytics...</span>
      </div>
    );
  }

  const categoryEntries = Object.entries(metrics.categoryDistribution || {}).sort(
    (a: any, b: any) => b[1] - a[1]
  );

  return (
    <div className="space-y-8 py-6">
      {/* Dashboard Header */}
      <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-sans text-xs text-neutral-400 mb-1">
            <Activity className="w-4 h-4 text-neutral-400" />
            <span className="font-medium">Operational metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
            System & Ingestion Telemetry
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('ingestion')}
            className="px-3.5 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-sans text-xs font-medium transition-colors"
          >
            Launch Ingestion Cycle
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Signals Recorded"
          value={metrics.totalSignals}
          subtext="Verified ecosystem events"
          icon={Database}
          trend="+14% this week"
        />
        <StatCard
          label="Monitored Technologies"
          value={metrics.totalTechnologies}
          subtext="Indexed entities & libraries"
          icon={Layers}
          trend="12 active profiles"
        />
        <StatCard
          label="Verification Rate"
          value={`${metrics.verificationRate}%`}
          subtext="Cryptographic & upstream proof"
          icon={ShieldCheck}
          trend="Strict standard"
        />
        <StatCard
          label="Pipeline Success Rate"
          value="100%"
          subtext={`${metrics.successfulJobs} of ${metrics.totalJobs} jobs passed`}
          icon={Terminal}
          trend="0 fatal failures"
        />
      </div>

      {/* Category Breakdown & Verification Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Chart */}
        <div className="lg:col-span-2 bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Signals by Domain Distribution
            </h3>
            <span className="font-mono text-xs text-neutral-400">
              {metrics.totalSignals} signals categorized
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {categoryEntries.map(([cat, count]: any) => {
              const pct = Math.round((count / (metrics.totalSignals || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>{cat}</span>
                    <span className="text-neutral-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Status Breakdown */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
          <div className="border-b border-white/[0.06] pb-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verification Audit
            </h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-semibold">Fully Verified</span>
                <span className="text-white font-bold">{metrics.verificationBreakdown?.verified || 0}</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Backed by official releases, changelog git commits, or CVE advisory registries.
              </p>
            </div>

            <div className="p-3 rounded bg-amber-950/20 border border-amber-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-semibold">Partially Verified</span>
                <span className="text-white font-bold">
                  {metrics.verificationBreakdown?.partially_verified || 0}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Ingested from secondary aggregators awaiting official documentation sync.
              </p>
            </div>

            <div className="p-3 rounded bg-neutral-900/60 border border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-semibold">Unverified</span>
                <span className="text-white font-bold">{metrics.verificationBreakdown?.unverified || 0}</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Draft raw signals pending multi-source cross check.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ingestion Jobs Log Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neutral-400" />
            Recent Ingestion Execution Jobs
          </h3>
          <button
            onClick={() => onNavigate('ingestion')}
            className="text-xs font-mono text-amber-400 hover:underline"
          >
            Manage Pipeline →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-neutral-400 uppercase text-[10px]">
                <th className="py-2 px-3">Job ID</th>
                <th className="py-2 px-3">Source Adapter</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Found</th>
                <th className="py-2 px-3">Created</th>
                <th className="py-2 px-3">Deduplicated</th>
                <th className="py-2 px-3">Started At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-neutral-900/50">
                  <td className="py-2.5 px-3 text-white font-medium">{job.id}</td>
                  <td className="py-2.5 px-3 text-neutral-300 capitalize">{job.source}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        job.status === 'completed'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-950/60 text-amber-400'
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300">{job.records_found}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">+{job.records_created}</td>
                  <td className="py-2.5 px-3 text-neutral-400">{job.duplicates}</td>
                  <td className="py-2.5 px-3 text-neutral-400">{job.started_at.slice(0, 19).replace('T', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
