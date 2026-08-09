import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, RefreshCcw, AlertTriangle, Link2 } from 'lucide-react';
import { generateLinksForRoute } from '@/lib/links/linkEngine';
import { saveInternalLinks } from '@/services/LinkService';
import { getLinkHealthSummary, cleanupBrokenLinks } from '@/lib/links/linkHealthChecker';

export default function LinkHealthDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState({ totalRoutes: 0, routesWithLinks: 0, orphanCount: 0, brokenLinkCount: 0 });
  const [orphanRoutes, setOrphanRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data: routes } = await supabase
        .from('routes')
        .select('id')
        .eq('is_active', true);

      const { orphanCount, brokenLinkCount, orphans } = await getLinkHealthSummary();

      setStats({
        totalRoutes: routes?.length || 0,
        routesWithLinks: (routes?.length || 0) - orphanCount,
        orphanCount,
        brokenLinkCount,
      });
      setOrphanRoutes(orphans.slice(0, 20));
    } catch (err) {
      console.error('[LinkHealthDashboard] Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupBroken = async () => {
    setCleaning(true);
    try {
      const result = await cleanupBrokenLinks();
      if (result.success) {
        toast({ title: 'Cleanup complete', description: `Removed ${result.removed} broken link(s).`, className: 'bg-green-600 text-white' });
        loadStats();
      } else {
        toast({ variant: 'destructive', title: 'Cleanup failed', description: result.error });
      }
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  /**
   * Regenerates and persists internal_links for every active route.
   * Reuses the SAME generateLinksForRoute() the live page uses at
   * runtime — no separate/duplicate scoring logic for the admin tool.
   */
  const handleRegenerateAll = async () => {
    setRegenerating(true);
    try {
      const { data: routes, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      let done = 0;
      for (const route of routes || []) {
        const links = await generateLinksForRoute(route);
        await saveInternalLinks(route.id, links);
        done += 1;
        setProgress({ done, total: routes.length });
      }

      toast({ title: 'Regeneration complete', description: `Processed ${done} routes.`, className: 'bg-green-600 text-white' });
      loadStats();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Regeneration failed', description: err.message });
    } finally {
      setRegenerating(false);
      setProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900 p-4 sticky top-0 z-10 flex items-center justify-between">
        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.push('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
        </Button>
        <h1 className="text-lg font-bold flex items-center gap-2"><Link2 className="w-4 h-4" /> Internal Link Health</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Active Routes</p>
            <p className="text-3xl font-bold">{loading ? '—' : stats.totalRoutes}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Routes With Inbound Links</p>
            <p className="text-3xl font-bold text-green-400">{loading ? '—' : stats.routesWithLinks}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Orphan Pages</p>
            <p className="text-3xl font-bold text-amber-400">{loading ? '—' : stats.orphanCount}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Broken Links</p>
            <p className="text-3xl font-bold text-red-400">{loading ? '—' : stats.brokenLinkCount}</p>
          </Card>
        </div>

        {stats.brokenLinkCount > 0 && (
          <Card className="bg-slate-900 border-red-900/50 p-6 flex items-center justify-between">
            <p className="text-sm text-slate-400">{stats.brokenLinkCount} link(s) point to inactive/deleted routes.</p>
            <Button onClick={handleCleanupBroken} disabled={cleaning} variant="outline" className="border-red-800 text-red-400 hover:bg-red-950">
              {cleaning ? 'Cleaning...' : 'Clean Up Broken Links'}
            </Button>
          </Card>
        )}

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-300">Regenerate Links</h2>
            <Button onClick={handleRegenerateAll} disabled={regenerating} className="bg-[#667eea] hover:bg-[#5a67d8]">
              <RefreshCcw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? `Processing ${progress?.done || 0}/${progress?.total || '?'}...` : 'Regenerate All'}
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            Runs the Internal Linking Engine for every active route and saves the results to the database
            (used by the Health Checker and future cached reads).
          </p>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h2 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Orphan Pages (no inbound links)
          </h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : orphanRoutes.length === 0 ? (
            <p className="text-slate-500 text-sm">None found — every active route has at least one inbound internal link.</p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-400">
              {orphanRoutes.map((r) => (
                <li key={r.id}>{r.from_city} → {r.to_city}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
