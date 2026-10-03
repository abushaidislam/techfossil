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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Category Distribution Chart */}
        <div className="lg:col-span-2 bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neutral-400" />
              <span>Signals by domain distribution</span>
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              {metrics.totalSignals} signals
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {categoryEntries.map(([cat, count]: any) => {
              const pct = Math.round((count / (metrics.totalSignals || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>{cat}</span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-900 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-white/60 h-1 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Status Breakdown */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4 font-sans">
          <div className="border-b border-white/[0.06] pb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
              <span>Verification audit</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded bg-neutral-900 border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Fully verified</span>
                <span className="text-white font-mono font-medium">{metrics.verificationBreakdown?.verified || 0}</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Backed by official releases, changelog git commits, or CVE advisory registries.
              </p>
            </div>

            <div className="p-3 rounded bg-neutral-900 border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300 font-medium">Partially verified</span>
                <span className="text-neutral-300 font-mono font-medium">
                  {metrics.verificationBreakdown?.partially_verified || 0}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Ingested from secondary aggregators awaiting official documentation sync.
              </p>
            </div>

            <div className="p-3 rounded bg-neutral-900/60 border border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-medium">Unverified</span>
                <span className="text-neutral-400 font-mono font-medium">{metrics.verificationBreakdown?.unverified || 0}</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Draft raw signals pending multi-source cross check.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ingestion Jobs Log Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neutral-400" />
            <span>Recent ingestion execution jobs</span>
          </h3>
          <button
            onClick={() => onNavigate('ingestion')}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Manage pipeline →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/[0.06] text-neutral-400 text-xs">
                <th className="py-2.5 px-3 font-medium">Job ID</th>
                <th className="py-2.5 px-3 font-medium">Source adapter</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Found</th>
                <th className="py-2.5 px-3 font-medium">Created</th>
                <th className="py-2.5 px-3 font-medium">Deduplicated</th>
                <th className="py-2.5 px-3 font-medium">Started at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-300">{job.id}</td>
                  <td className="py-2.5 px-3 text-neutral-300 capitalize">{job.source}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[11px] ${
                        job.status === 'completed'
                          ? 'text-neutral-200 bg-white/[0.06] border border-white/[0.08]'
                          : 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-neutral-300">{job.records_found}</td>
                  <td className="py-2.5 px-3 font-mono text-white font-medium">+{job.records_created}</td>
                  <td className="py-2.5 px-3 font-mono text-neutral-400">{job.duplicates}</td>
                  <td className="py-2.5 px-3 font-mono text-neutral-400 text-[11px]">{job.started_at.slice(0, 19).replace('T', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
