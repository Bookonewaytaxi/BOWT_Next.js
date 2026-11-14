import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Edit, RefreshCw, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Wand2, ClipboardCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateSeoForRoute } from '@/utils/seoGenerator';
import { calculateSeoScore } from '@/utils/seoScoreCalculator';

const PAGE_SIZE = 50;
const ROUTE_FIELDS = 'id, from_city, to_city, slug, is_active, distance_km, sedan_price, seo_title, seo_description, seo_keywords, seo_content, updated_at';

function getSeoIssues(route) {
  const issues = [];
  if (!route.seo_title) issues.push('Missing title');
  else if (route.seo_title.length > 60) issues.push('Title too long');
  if (!route.seo_description) issues.push('Missing description');
  else {
    if (!route.seo_description.includes('+91 75675 75578')) issues.push('Phone missing');
    if (route.seo_description.length < 140 || route.seo_description.length > 160) issues.push('Description length');
  }
  if (!route.seo_content || route.seo_content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length < 150) issues.push('Content needs review');
  return issues;
}

export default function RouteSeoDashboard() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [notice, setNotice] = useState('');
  const [audit, setAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const router = useRouter();

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setNotice('');
    try {
      let query = supabase.from('routes').select(ROUTE_FIELDS, { count: 'exact' }).eq('is_active', true);
      if (filter.trim()) query = query.or(`from_city.ilike.%${filter.trim()}%,to_city.ilike.%${filter.trim()}%,slug.ilike.%${filter.trim()}%`);
      if (status === 'missing') query = query.or('seo_title.is.null,seo_description.is.null,seo_content.is.null');
      if (status === 'complete') query = query.not('seo_title', 'is', null).not('seo_description', 'is', null).not('seo_content', 'is', null);
      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await query.order('from_city', { ascending: true }).order('to_city', { ascending: true }).range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      const routeRows = data || [];
      const routeIds = routeRows.map((route) => route.id);
      let faqMap = {};
      if (routeIds.length) {
        const { data: faqRows, error: faqError } = await supabase.from('route_faqs').select('route_id, question, answer').in('route_id', routeIds).eq('status', 'approved');
        if (faqError) throw faqError;
        faqMap = (faqRows || []).reduce((map, faq) => { (map[faq.route_id] ||= []).push(faq); return map; }, {});
      }
      setRoutes(routeRows.map((route) => ({ ...route, faq_section: faqMap[route.id] || [] })));
      setTotal(count || 0);
      setSelected([]);
    } catch (error) {
      console.error('[SEO Dashboard] Route list failed:', error);
      setNotice(error.message || 'Unable to load routes. Check the Admin database connection.');
      setRoutes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, status, page]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);
  useEffect(() => { setPage(1); }, [filter, status]);

  const metrics = useMemo(() => {
    const withMeta = routes.filter((r) => r.seo_title && r.seo_description).length;
    const issues = routes.reduce((sum, route) => sum + getSeoIssues(route).length, 0);
    return { withMeta, issues, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
  }, [routes, total]);

  const bulkGenerate = async () => {
    const targets = routes.filter((route) => selected.includes(route.id));
    if (!targets.length) return;
    if (!window.confirm(`Generate SEO fields for ${targets.length} selected routes? Valid existing SEO fields will be preserved; missing or invalid metadata will be repaired. No route URL or fare will be changed.`)) return;
    setBusy(true);
    setNotice('');
    let updated = 0, failed = 0;
    for (const route of targets) {
      try {
        const generated = generateSeoForRoute(route);
        const patch = {};
        if (!route.seo_title || route.seo_title.length < 30 || route.seo_title.length > 60) patch.seo_title = generated.meta_title;
        if (!route.seo_description || !route.seo_description.includes('+91 75675 75578') || route.seo_description.length < 140 || route.seo_description.length > 160) patch.seo_description = generated.meta_description;
        if (!route.seo_keywords?.length) patch.seo_keywords = generated.secondary_keywords;
        if (!route.seo_content) {
          patch.seo_content = generated.long_form_content;
          patch.content_word_count = generated.long_form_content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
          patch.content_validation_status = 'draft';
          patch.content_last_updated = new Date().toISOString();
        }
        if (Object.keys(patch).length) {
          patch.updated_at = new Date().toISOString();
          const { error } = await supabase.from('routes').update(patch).eq('id', route.id);
          if (error) throw error;
          updated += 1;
        }
      } catch (error) {
        console.error('[SEO Dashboard] Bulk generation failed for route', route.id, error);
        failed += 1;
      }
    }
    setBusy(false);
    setNotice(`Bulk generation finished: ${updated} updated, ${failed} failed. Generated content is marked as draft for review.`);
    fetchRoutes();
  };

  const runFullAudit = async () => {
    setAuditLoading(true);
    setNotice('');
    try {
      const allRoutes = [];
      for (let offset = 0; offset < 30000; offset += 1000) {
        const { data, error } = await supabase.from('routes')
          .select('id,from_city,to_city,slug,seo_title,seo_description,seo_content,content_validation_status')
          .eq('is_active', true)
          .range(offset, offset + 999);
        if (error) throw error;
        allRoutes.push(...(data || []));
        if (!data || data.length < 1000) break;
      }
      const titleCounts = new Map();
      const descriptionCounts = new Map();
      allRoutes.forEach((route) => {
        const title = String(route.seo_title || '').trim().toLowerCase();
        const description = String(route.seo_description || '').trim().toLowerCase();
        if (title) titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
        if (description) descriptionCounts.set(description, (descriptionCounts.get(description) || 0) + 1);
      });
      const duplicateTitles = [...titleCounts.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]);
      const duplicateDescriptions = [...descriptionCounts.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]);
      const result = {
        total: allRoutes.length,
        missingTitle: allRoutes.filter((r) => !r.seo_title).length,
        missingDescription: allRoutes.filter((r) => !r.seo_description).length,
        missingPhone: allRoutes.filter((r) => r.seo_description && !r.seo_description.includes('+91 75675 75578')).length,
        invalidDescriptionLength: allRoutes.filter((r) => r.seo_description && (r.seo_description.length < 140 || r.seo_description.length > 160)).length,
        missingContent: allRoutes.filter((r) => !r.seo_content || !r.seo_content.trim()).length,
        draftContent: allRoutes.filter((r) => r.content_validation_status === 'draft').length,
        duplicateTitles,
        duplicateDescriptions,
        scannedAt: new Date().toLocaleString()
      };
      setAudit(result);
      setNotice(`Full read-only audit completed across ${result.total.toLocaleString('en-IN')} active routes.`);
    } catch (error) {
      console.error('[SEO Dashboard] Full audit failed:', error);
      setNotice(error.message || 'Full route audit failed.');
    } finally {
      setAuditLoading(false);
    }
  };

  const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const allVisibleSelected = routes.length > 0 && routes.every((route) => selected.includes(route.id));

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div><h1 className="text-3xl font-bold text-white">On-Page SEO Management</h1><p className="text-slate-400 mt-1">Manage route metadata and content without changing route URLs, fares or bookings.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-200" onClick={fetchRoutes} disabled={loading}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
          <Button variant="outline" className="border-emerald-700 text-emerald-300" onClick={runFullAudit} disabled={auditLoading}><ClipboardCheck className="w-4 h-4 mr-2" /> {auditLoading ? 'Auditing all routes…' : 'Run full audit'}</Button>
          <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400" onClick={bulkGenerate} disabled={busy || selected.length === 0}><Wand2 className="w-4 h-4 mr-2" /> Generate missing ({selected.length})</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400 text-sm">Active routes matching filter</p><p className="text-2xl font-bold text-white">{total.toLocaleString('en-IN')}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400 text-sm">Meta complete on this page</p><p className="text-2xl font-bold text-emerald-400">{metrics.withMeta}/{routes.length}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400 text-sm">Review flags on this page</p><p className="text-2xl font-bold text-amber-400">{metrics.issues}</p></div>
      </div>

      {notice && <div className="mb-4 rounded-lg border border-amber-700/50 bg-amber-950/40 p-3 text-sm text-amber-200">{notice}</div>}
      {audit && <section className="mb-6 rounded-xl border border-emerald-900 bg-slate-900 p-4">
        <div className="flex flex-wrap justify-between gap-2 mb-3"><h2 className="font-bold text-white">Full route SEO audit</h2><span className="text-xs text-slate-500">Read-only · {audit.scannedAt}</span></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Active routes scanned', audit.total],
            ['Missing titles', audit.missingTitle],
            ['Missing descriptions', audit.missingDescription],
            ['Descriptions missing phone', audit.missingPhone],
            ['Description length issues', audit.invalidDescriptionLength],
            ['Missing route content', audit.missingContent],
            ['Draft content not published', audit.draftContent],
            ['Duplicate title groups', audit.duplicateTitles.length],
            ['Duplicate description groups', audit.duplicateDescriptions.length]
          ].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-950 p-3"><p className="text-xs text-slate-400">{label}</p><p className="text-xl font-bold text-white">{Number(value).toLocaleString('en-IN')}</p></div>)}
        </div>
        {(audit.duplicateTitles.length > 0 || audit.duplicateDescriptions.length > 0) && <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div><h3 className="text-sm font-semibold text-amber-300 mb-2">Most repeated titles</h3>{audit.duplicateTitles.slice(0,5).map(([value,count]) => <p key={value} className="text-xs text-slate-300 border-b border-slate-800 py-2">{count}× · {value}</p>)}</div>
          <div><h3 className="text-sm font-semibold text-amber-300 mb-2">Most repeated descriptions</h3>{audit.duplicateDescriptions.slice(0,5).map(([value,count]) => <p key={value} className="text-xs text-slate-300 border-b border-slate-800 py-2">{count}× · {value.slice(0,180)}</p>)}</div>
        </div>}
      </section>}

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search pickup, drop or slug..." className="pl-9 bg-slate-900 border-slate-700 text-white" value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
        <select className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All active routes</option><option value="missing">Missing SEO fields</option><option value="complete">SEO fields populated</option></select>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 min-w-[900px]">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800"><tr>
              <th className="p-4"><input aria-label="Select all visible routes" type="checkbox" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? [] : routes.map((r) => r.id))} /></th>
              <th className="p-4">Route</th><th className="p-4">SEO score*</th><th className="p-4">Meta title</th><th className="p-4">Audit flags</th><th className="p-4 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? <tr><td colSpan="6" className="p-10 text-center text-slate-400">Loading route SEO data…</td></tr> :
                routes.length === 0 ? <tr><td colSpan="6" className="p-10 text-center text-slate-400">No active routes match this filter.</td></tr> :
                routes.map((route) => {
                  const score = calculateSeoScore({ slug: route.slug, meta_title: route.seo_title || '', meta_description: route.seo_description || '', focus_keyword: `${route.from_city} to ${route.to_city} one way taxi`, h1_heading: `One Way Taxi from ${route.from_city} to ${route.to_city}`, faq_section: route.faq_section || [], long_form_content: route.seo_content || '', secondary_keywords: route.seo_keywords || [] }).totalScore;
                  const issues = getSeoIssues(route);
                  return <tr key={route.id} className="hover:bg-slate-800/50">
                    <td className="p-4"><input aria-label={`Select ${route.from_city} to ${route.to_city}`} type="checkbox" checked={selected.includes(route.id)} onChange={() => toggleSelected(route.id)} /></td>
                    <td className="p-4 font-medium text-white">{route.from_city} → {route.to_city}<span className="block text-xs text-slate-500 mt-1">{route.slug}</span></td>
                    <td className="p-4"><Badge className={score >= 70 ? 'bg-emerald-700' : score >= 40 ? 'bg-amber-700' : 'bg-red-700'}>{score}/100</Badge></td>
                    <td className="p-4 max-w-xs"><span className="line-clamp-2">{route.seo_title || <em className="text-slate-500">Missing title</em>}</span></td>
                    <td className="p-4">{issues.length ? <span className="inline-flex items-center gap-1 text-amber-300"><AlertTriangle className="w-4 h-4" /> {issues.length} checks</span> : <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Basic checks passed</span>}</td>
                    <td className="p-4 text-right"><Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-700" onClick={() => router.push(`/admin/routes/${route.id}/seo`)}><Edit className="w-4 h-4 mr-2" /> Edit SEO</Button></td>
                  </tr>;
                })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-800 p-4 text-sm text-slate-400">
          <span>Page {page} of {metrics.pageCount} · {PAGE_SIZE} routes per page · *Content score is a heuristic, not a Google ranking score.</span>
          <div className="flex gap-2"><Button size="sm" variant="outline" className="border-slate-700" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /> Previous</Button><Button size="sm" variant="outline" className="border-slate-700" disabled={page >= metrics.pageCount || loading} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="w-4 h-4" /></Button></div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Bulk generation fills empty content and repairs missing or invalid meta title/description fields. It does not modify route slugs, route fares, vehicle pricing, bookings, customer records or database permissions. Automatically generated travel copy remains a draft and should be reviewed before publication.</p>
    </div>
  );
}
