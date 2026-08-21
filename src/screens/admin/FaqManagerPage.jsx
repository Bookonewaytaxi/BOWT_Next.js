import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, RefreshCcw, HelpCircle, AlertTriangle, Search } from 'lucide-react';
import { generateFaqsForRoute } from '@/lib/faq/faqTemplateEngine';
import { upsertFaqs, getFaqsByRouteId } from '@/services/FaqService';

const BATCH_SIZE = 50;

export default function FaqManagerPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalActiveRoutes: 0, routesWithFaqs: 0, totalApprovedFaqRows: 0, routesWithoutFaqs: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [failures, setFailures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRouteFaqs, setSelectedRouteFaqs] = useState(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data: routes, error: routesError } = await supabase.from('routes').select('id').eq('is_active', true);
      if (routesError) throw routesError;

      const { data: faqRows, error: faqError } = await supabase.from('route_faqs').select('route_id').eq('status', 'approved');
      if (faqError) throw faqError;

      const routesWithFaqs = new Set((faqRows || []).map((f) => f.route_id)).size;
      const totalActiveRoutes = routes?.length || 0;

      setStats({
        totalActiveRoutes,
        routesWithFaqs,
        totalApprovedFaqRows: faqRows?.length || 0,
        routesWithoutFaqs: totalActiveRoutes - routesWithFaqs,
      });
    } catch (err) {
      console.error('[FaqManagerPage] Failed to load stats:', err);
      toast({ variant: 'destructive', title: 'Failed to load statistics', description: err.message });
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleGenerateAll = async () => {
    setGenerating(true);
    setFailures([]);
    const localFailures = [];

    try {
      const { data: routes, error } = await supabase.from('routes').select('*').eq('is_active', true);
      if (error) throw error;

      const total = routes?.length || 0;
      let done = 0, successCount = 0, failedCount = 0;

      setProgress({ done: 0, total, successCount: 0, failedCount: 0, currentRouteLabel: '' });

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = routes.slice(i, i + BATCH_SIZE);
        for (const route of batch) {
          const routeLabel = `${route.from_city} → ${route.to_city}`;
          try {
            const faqs = generateFaqsForRoute(route);
            if (faqs.length === 0) {
              done += 1; successCount += 1;
            } else {
              const result = await upsertFaqs(route.id, faqs);
              done += 1;
              if (result.success) successCount += 1;
              else { failedCount += 1; localFailures.push({ route: routeLabel, error: result.error || 'Unknown error' }); }
            }
          } catch (err) {
            done += 1; failedCount += 1;
            localFailures.push({ route: routeLabel, error: err.message || 'Unexpected error' });
          }
          setProgress({ done, total, successCount, failedCount, currentRouteLabel: routeLabel });
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setFailures(localFailures);
      toast({
        title: 'FAQ generation complete',
        description: `${successCount} succeeded, ${failedCount} failed out of ${total} routes.`,
        className: failedCount === 0 ? 'bg-green-600 text-white' : 'bg-amber-600 text-white',
      });
      loadStats();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Generation failed to start', description: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) { setSearchResults([]); return; }
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('id, from_city, to_city, slug')
        .or(`from_city.ilike.%${searchTerm}%,to_city.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
        .limit(10);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Search failed', description: err.message });
    }
  };

  const handleViewRouteFaqs = async (route) => {
    try {
      const faqs = await getFaqsByRouteId(route.id);
      setSelectedRouteFaqs({ route, faqs });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to load FAQs', description: err.message });
    }
  };

  const progressPercent = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900 p-4 sticky top-0 z-10 flex items-center justify-between">
        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.push('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
        </Button>
        <h1 className="text-lg font-bold flex items-center gap-2"><HelpCircle className="w-4 h-4" /> FAQ Manager</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Active Routes</p>
            <p className="text-3xl font-bold">{statsLoading ? '—' : stats.totalActiveRoutes}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Routes With FAQs</p>
            <p className="text-3xl font-bold text-green-400">{statsLoading ? '—' : stats.routesWithFaqs}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Approved FAQ Rows</p>
            <p className="text-3xl font-bold">{statsLoading ? '—' : stats.totalApprovedFaqRows}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Routes Without FAQs</p>
            <p className="text-3xl font-bold text-amber-400">{statsLoading ? '—' : stats.routesWithoutFaqs}</p>
          </Card>
        </div>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-300">Generate FAQs</h2>
              <p className="text-sm text-slate-500 mt-1">
                Rule-based, deterministic, generated entirely from each route's real data. No AI. Safe to re-run.
              </p>
            </div>
            <Button onClick={handleGenerateAll} disabled={generating} className="bg-[#667eea] hover:bg-[#5a67d8] flex-shrink-0">
              <RefreshCcw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate FAQs for All Routes'}
            </Button>
          </div>

          {progress && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>{progress.currentRouteLabel}</span>
                <span>{progress.done} / {progress.total} ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-[#667eea] h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">Success: {progress.successCount}</span>
                <span className="text-red-400">Failed: {progress.failedCount}</span>
              </div>
            </div>
          )}
        </Card>

        {failures.length > 0 && (
          <Card className="bg-slate-900 border-red-900/50 p-6">
            <h2 className="font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Generation Errors ({failures.length})
            </h2>
            <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
              {failures.map((f, idx) => (
                <li key={idx} className="text-slate-400"><span className="text-slate-200">{f.route}</span> — {f.error}</li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h2 className="font-semibold text-slate-300 mb-3">Look Up a Route's FAQs</h2>
          <div className="flex gap-2 mb-4">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by city or slug..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white"
            />
            <Button variant="outline" onClick={handleSearch}><Search className="w-4 h-4" /></Button>
          </div>

          {searchResults.length > 0 && (
            <ul className="space-y-1 mb-4">
              {searchResults.map((r) => (
                <li key={r.id}>
                  <button onClick={() => handleViewRouteFaqs(r)} className="text-sm text-slate-400 hover:text-[#667eea] hover:underline">
                    {r.from_city} → {r.to_city} ({r.slug})
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedRouteFaqs && (
            <div className="border-t border-slate-800 pt-4">
              <p className="text-sm font-semibold text-slate-300 mb-2">
                {selectedRouteFaqs.route.from_city} → {selectedRouteFaqs.route.to_city}
              </p>
              {selectedRouteFaqs.faqs.length === 0 ? (
                <p className="text-sm text-slate-500">No FAQs generated yet for this route.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {selectedRouteFaqs.faqs.map((faq) => (
                    <li key={faq.id} className="bg-slate-800/50 rounded p-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{faq.category}</span>
                        <span>priority {faq.priority} · {faq.status}</span>
                      </div>
                      <p className="text-slate-200 font-medium">{faq.question}</p>
                      <p className="text-slate-400 mt-1">{faq.answer}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
