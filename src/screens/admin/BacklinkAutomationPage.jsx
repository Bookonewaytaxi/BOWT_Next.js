import React, { useCallback, useEffect, useState } from 'react';
import { Link2, RefreshCw, Target, Search, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import customSupabaseClient from '@/lib/customSupabaseClient';

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
    <div className="flex items-center gap-3 text-slate-400">
      <Icon className="h-5 w-5 text-amber-500" />
      <span className="text-sm">{label}</span>
    </div>
    <div className="mt-3 text-3xl font-extrabold text-white">{value}</div>
  </div>
);

export default function BacklinkAutomationPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ target: 30, opportunities: 0, qualified: 0, outreach: 0, live: 0 });
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    setError('');
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: run }, { data: opportunities }, { data: live }] = await Promise.all([
      customSupabaseClient.from('backlink_daily_runs').select('*').eq('run_date', today).maybeSingle(),
      customSupabaseClient
        .from('backlink_opportunities')
        .select('id, source_url, source_title, opportunity_type, relevance_score, quality_score, status, target_url, discovered_at, backlink_domains(domain)')
        .order('discovered_at', { ascending: false })
        .limit(30),
      customSupabaseClient.from('backlinks').select('id', { count: 'exact', head: true }).eq('link_status', 'live'),
    ]);
    if (opportunities === null) {
      setError('Backlink tables are not available yet. Run docs/backlink-automation-v1.sql in Supabase first.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setRows(opportunities || []);
    setStats({
      target: run?.target_count ?? 30,
      opportunities: run?.found_count ?? opportunities?.length ?? 0,
      qualified: run?.qualified_count ?? (opportunities || []).filter(x => ['qualified','outreach_ready','contacted','published'].includes(x.status)).length,
      outreach: run?.outreach_ready_count ?? (opportunities || []).filter(x => ['outreach_ready','contacted','published'].includes(x.status)).length,
      live: live?.length ?? 0,
    });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
  };

  if (loading) return <div className="p-8 text-slate-400">Loading backlink automation…</div>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link2 className="h-7 w-7 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-white">Backlink Automation</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">Daily discovery, qualification, outreach and backlink verification.</p>
        </div>
        <button onClick={refresh} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 hover:bg-amber-400">
          <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={Target} label="Daily target" value={stats.target} />
        <Stat icon={Search} label="Opportunities" value={stats.opportunities} />
        <Stat icon={CheckCircle2} label="Qualified" value={stats.qualified} />
        <Stat icon={Send} label="Outreach ready" value={stats.outreach} />
        <Stat icon={Link2} label="Live backlinks" value={stats.live} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60">
        <div className="border-b border-slate-700 p-5">
          <h2 className="font-bold text-white">Latest opportunities</h2>
          <p className="mt-1 text-xs text-slate-400">Only relevant, reviewable opportunities should move to outreach.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-800/70 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Opportunity</th>
                <th className="px-5 py-3">Relevance</th>
                <th className="px-5 py-3">Quality</th>
                <th className="px-5 py-3">Target page</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-medium text-white">{row.backlink_domains?.domain || '—'}</td>
                  <td className="max-w-md px-5 py-4">
                    <div className="text-slate-200">{row.source_title || 'Untitled opportunity'}</div>
                    {row.source_url && <div className="mt-1 truncate text-xs text-slate-500">{row.source_url}</div>}
                  </td>
                  <td className="px-5 py-4 text-amber-400">{row.relevance_score}</td>
                  <td className="px-5 py-4 text-emerald-400">{row.quality_score}</td>
                  <td className="max-w-xs px-5 py-4 truncate text-slate-300">{row.target_url || '—'}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{row.status}</span>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">No opportunities yet. The daily discovery worker will populate this table after the provider is configured.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
