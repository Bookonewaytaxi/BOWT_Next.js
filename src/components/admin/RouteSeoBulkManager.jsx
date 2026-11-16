import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  X, Search, ChevronLeft, ChevronRight, CheckSquare, Square, Wand2,
  Pause, Play, RotateCcw, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';

const PAGE_SIZE = 50;
const STORAGE_KEY = 'bowt-ai-bulk-seo-job-v1';
const ROUTE_FIELDS = 'id,from_city,to_city,slug,is_active,distance_km,sedan_price,suv_ertiga_price,ertiga_price,kia_carens_price,carens_price,innova_crysta_price,crysta_price,seo_title,seo_description,seo_keywords,seo_content';

const SEO_FIELDS = [
  { key: 'meta_title', label: 'Meta Title' },
  { key: 'meta_description', label: 'Meta Description' },
  { key: 'focus_keyword', label: 'Focus Keyword' },
  { key: 'secondary_keywords', label: 'Secondary Keywords' },
  { key: 'long_form_content', label: 'SEO Content' },
  { key: 'faq_section', label: 'FAQs' }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getQuery(search, status) {
  let query = supabase.from('routes').select(ROUTE_FIELDS, { count: 'exact' }).eq('is_active', true);
  const term = search.trim().replace(/[(),]/g, ' ');
  if (term) query = query.or('from_city.ilike.%' + term + '%,to_city.ilike.%' + term + '%,slug.ilike.%' + term + '%');
  if (status === 'missing') query = query.or('seo_title.is.null,seo_description.is.null,seo_content.is.null');
  if (status === 'complete') query = query.not('seo_title', 'is', null).not('seo_description', 'is', null).not('seo_content', 'is', null);
  return query;
}

function saveJob(job) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
  } catch (error) {
    console.error('[AI Bulk SEO] Could not persist job progress:', error);
  }
}

export default function RouteSeoBulkManager({ open, onClose }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [selectingAll, setSelectingAll] = useState(false);
  const [fields, setFields] = useState(SEO_FIELDS.map((field) => field.key));
  const [preserveExisting, setPreserveExisting] = useState(true);
  const [instructions, setInstructions] = useState('');
  const [job, setJob] = useState(null);
  const [notice, setNotice] = useState('');
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const jobRef = useRef(null);

  const setAndPersistJob = useCallback((next) => {
    jobRef.current = next;
    setJob(next);
    saveJob(next);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.queue) && parsed.queue.length) {
          jobRef.current = parsed;
          setJob(parsed);
        }
      }
    } catch (error) {
      console.warn('[AI Bulk SEO] Saved job could not be restored:', error);
    }
  }, []);

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setNotice('');
    try {
      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await getQuery(search, status)
        .order('from_city', { ascending: true })
        .order('to_city', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      setRoutes(data || []);
      setTotal(count || 0);
    } catch (error) {
      setNotice('Route list could not be loaded: ' + (error.message || 'Unknown database error'));
      setRoutes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    if (open) loadRoutes();
  }, [open, loadRoutes]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allVisibleSelected = routes.length > 0 && routes.every((route) => selected.includes(route.id));

  const toggleRoute = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectVisible = () => {
    const visibleIds = routes.map((route) => route.id);
    setSelected((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : Array.from(new Set(current.concat(visibleIds))));
  };

  const selectAllMatching = async () => {
    setSelectingAll(true);
    setNotice('');
    try {
      const ids = [];
      for (let offset = 0; offset < 50000; offset += 1000) {
        const { data, error } = await getQuery(search, status)
          .select('id')
          .order('id', { ascending: true })
          .range(offset, offset + 999);
        if (error) throw error;
        ids.push(...(data || []).map((row) => row.id));
        if (!data || data.length < 1000) break;
      }
      setSelected(ids);
      setNotice(ids.length.toLocaleString('en-IN') + ' matching routes selected. You can unselect individual routes on any page.');
    } catch (error) {
      setNotice('Could not select all matching routes: ' + (error.message || 'Unknown database error'));
    } finally {
      setSelectingAll(false);
    }
  };

  const saveGeneratedRoute = async (route, generated, selectedFields, keepExisting) => {
    const { data: metadata, error: metadataReadError } = await supabase
      .from('seo_metadata')
      .select('meta_title,meta_description,keywords,focus_keyword,slug')
      .eq('page_type', 'route')
      .eq('page_id', route.id)
      .maybeSingle();
    if (metadataReadError) throw metadataReadError;

    const patch = {};
    const existingTitle = route.seo_title || metadata?.meta_title || '';
    const existingDescription = route.seo_description || metadata?.meta_description || '';
    const existingKeywords = route.seo_keywords || metadata?.keywords || [];
    const shouldWrite = (key, current) => selectedFields.includes(key) && (!keepExisting || !current);

    if (shouldWrite('meta_title', existingTitle)) patch.seo_title = generated.meta_title;
    if (shouldWrite('meta_description', existingDescription)) patch.seo_description = generated.meta_description;
    if (shouldWrite('secondary_keywords', existingKeywords?.length)) patch.seo_keywords = generated.secondary_keywords;
    if (shouldWrite('long_form_content', route.seo_content)) {
      patch.seo_content = generated.long_form_content;
      patch.content_word_count = String(generated.long_form_content || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
      patch.content_validation_status = 'draft';
      patch.content_last_updated = new Date().toISOString();
      patch.content_version = Number(route.content_version || 1) + 1;
    }
    if (Object.keys(patch).length) {
      patch.updated_at = new Date().toISOString();
      const { error } = await supabase.from('routes').update(patch).eq('id', route.id);
      if (error) throw error;
    }

    const writeMetadata = selectedFields.some((key) => ['meta_title', 'meta_description', 'focus_keyword', 'secondary_keywords'].includes(key));
    if (writeMetadata) {
      const nextTitle = patch.seo_title || existingTitle || generated.meta_title;
      const nextDescription = patch.seo_description || existingDescription || generated.meta_description;
      const nextKeywords = patch.seo_keywords || existingKeywords || generated.secondary_keywords;
      const nextFocus = selectedFields.includes('focus_keyword') && (!keepExisting || !metadata?.focus_keyword)
        ? generated.focus_keyword
        : (metadata?.focus_keyword || generated.focus_keyword);
      const { error } = await supabase.from('seo_metadata').upsert({
        page_type: 'route',
        page_id: route.id,
        meta_title: nextTitle,
        meta_description: nextDescription,
        keywords: nextKeywords,
        focus_keyword: nextFocus,
        slug: route.slug,
        updated_at: new Date().toISOString()
      }, { onConflict: 'page_type,page_id' });
      if (error) throw error;
    }

    if (selectedFields.includes('faq_section') && Array.isArray(generated.faq_section) && generated.faq_section.length) {
      const faqRows = generated.faq_section.slice(0, 5).filter((faq) => faq.question && faq.answer).map((faq, index) => ({
        route_id: route.id,
        category: 'ai-bulk-faq-' + (index + 1),
        question: String(faq.question).slice(0, 250),
        answer: String(faq.answer).slice(0, 1200),
        priority: 900 + index,
        status: 'draft',
        updated_at: new Date().toISOString()
      }));
      if (faqRows.length) {
        const { error } = await supabase.from('route_faqs').upsert(faqRows, { onConflict: 'route_id,category' });
        if (error) throw error;
      }
    }
  };

  const processJob = async () => {
    if (runningRef.current) return;
    let current = jobRef.current;
    if (!current || !current.queue?.length) return;
    runningRef.current = true;
    setRunning(true);
    current = { ...current, status: 'running' };
    setAndPersistJob(current);
    setNotice('AI generation and draft saving started. Keep this dashboard open while processing.');
    try {
      while (runningRef.current) {
        current = jobRef.current;
        if (!current || current.nextIndex >= current.queue.length) break;
        const routeId = current.queue[current.nextIndex];
        try {
          const { data: route, error: routeError } = await supabase
            .from('routes')
            .select(ROUTE_FIELDS + ',content_version')
            .eq('id', routeId)
            .maybeSingle();
          if (routeError) throw routeError;
          if (!route) throw new Error('Route no longer exists');

          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          const token = sessionData?.session?.access_token;
          if (!token) throw new Error('Admin session expired. Sign in again, then resume this job.');

          const vehiclePrices = {
            sedan: route.sedan_price,
            ertiga: route.suv_ertiga_price || route.ertiga_price,
            carens: route.kia_carens_price || route.carens_price,
            innova_crysta: route.innova_crysta_price || route.crysta_price
          };
          const positivePrices = Object.values(vehiclePrices).map(Number).filter((value) => value > 0);
          const response = await fetch('/api/admin/seo/ai-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({
              route: {
                from_city: route.from_city,
                to_city: route.to_city,
                distance_km: route.distance_km,
                starting_price: positivePrices.length ? Math.min(...positivePrices) : null,
                vehicle_prices: vehiclePrices
              },
              instructions: current.instructions || '',
              fields: current.fields
            })
          });
          const generated = await response.json();
          if (!response.ok) throw new Error(generated.error || 'AI generation failed with HTTP ' + response.status);
          await saveGeneratedRoute(route, generated, current.fields, current.preserveExisting);
          const next = {
            ...jobRef.current,
            nextIndex: jobRef.current.nextIndex + 1,
            completed: (jobRef.current.completed || 0) + 1,
            lastRoute: route.from_city + ' to ' + route.to_city,
            updatedAt: new Date().toISOString()
          };
          setAndPersistJob(next);
        } catch (error) {
          const latest = jobRef.current;
          const failedIds = Array.from(new Set([...(latest.failedIds || []), routeId]));
          const next = {
            ...latest,
            nextIndex: latest.nextIndex + 1,
            failedIds,
            lastError: String(error.message || error).slice(0, 500),
            updatedAt: new Date().toISOString()
          };
          setAndPersistJob(next);
          console.error('[AI Bulk SEO] Route failed:', routeId, error);
        }
        await sleep(350);
      }
    } finally {
      runningRef.current = false;
      setRunning(false);
      const latest = jobRef.current;
      if (latest) {
        const finished = latest.nextIndex >= latest.queue.length;
        const next = { ...latest, status: finished ? 'completed' : 'paused', updatedAt: new Date().toISOString() };
        setAndPersistJob(next);
        setNotice(finished
          ? 'Bulk AI SEO finished. ' + (next.completed || 0) + ' routes saved as drafts; ' + (next.failedIds || []).length + ' failed. Failed routes can be retried.'
          : 'Bulk job paused. Progress is saved in this browser and can be resumed.');
      }
    }
  };

  const startNewJob = () => {
    if (!selected.length) {
      setNotice('Select at least one route first.');
      return;
    }
    if (!fields.length) {
      setNotice('Select at least one SEO field to generate.');
      return;
    }
    if (jobRef.current && ['running', 'paused'].includes(jobRef.current.status) && jobRef.current.nextIndex < jobRef.current.queue.length) {
      setNotice('A saved job already exists. Resume it or retry its failed routes before starting another job.');
      return;
    }
    const next = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      queue: selected.slice(),
      fields: fields.slice(),
      preserveExisting,
      instructions: instructions.trim().slice(0, 2000),
      nextIndex: 0,
      completed: 0,
      failedIds: [],
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAndPersistJob(next);
    setNotice('Job created for ' + next.queue.length.toLocaleString('en-IN') + ' routes. AI generation will start now.');
    processJob();
  };

  const pauseJob = () => {
    runningRef.current = false;
  };

  const retryFailed = () => {
    const current = jobRef.current;
    if (!current?.failedIds?.length) return;
    const next = {
      ...current,
      queue: current.failedIds.slice(),
      nextIndex: 0,
      completed: 0,
      failedIds: [],
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAndPersistJob(next);
    setNotice('Retry job created for previously failed routes.');
  };

  const clearJob = () => {
    if (runningRef.current) return;
    jobRef.current = null;
    setJob(null);
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    setNotice('Saved job cleared. Route SEO data already saved in the database is not changed.');
  };

  const toggleField = (key) => setFields((current) => current.includes(key)
    ? current.filter((item) => item !== key)
    : current.concat(key));

  const progress = useMemo(() => {
    if (!job?.queue?.length) return 0;
    return Math.min(100, Math.round((job.nextIndex / job.queue.length) * 100));
  }, [job]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/95 p-3 md:p-6">
      <div className="mx-auto max-w-7xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-slate-800 bg-slate-900 p-4">
          <div>
            <h2 className="text-xl font-bold text-white md:text-2xl">AI Bulk SEO Editor</h2>
            <p className="text-xs text-slate-400">Select any combination of routes across all pages, generate route-specific SEO and save it as review drafts.</p>
          </div>
          <Button variant="outline" className="border-slate-700 text-slate-200" disabled={running} onClick={onClose}><X className="mr-2 h-4 w-4" /> Close</Button>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <section className="min-w-0">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pickup city, drop city or slug..." className="border-slate-700 bg-slate-950 pl-9 text-white" />
              </div>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white">
                <option value="all">All active routes</option>
                <option value="missing">Missing SEO fields</option>
                <option value="complete">SEO fields populated</option>
              </select>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" onClick={selectVisible} disabled={!routes.length}>
                {allVisibleSelected ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />} Select page
              </Button>
              <Button size="sm" className="bg-amber-500 text-slate-950 hover:bg-amber-400" onClick={selectAllMatching} disabled={selectingAll || loading}>
                {selectingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare className="mr-2 h-4 w-4" />} Select all matching ({total.toLocaleString('en-IN')})
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-300" onClick={() => setSelected([])}>Clear selection</Button>
              <Badge className="bg-slate-700 text-white">{selected.length.toLocaleString('en-IN')} selected</Badge>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs uppercase text-slate-400">
                    <tr><th className="p-3">Select</th><th className="p-3">Route</th><th className="p-3">Meta Title</th><th className="p-3">SEO State</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {loading ? <tr><td colSpan="4" className="p-8 text-center text-slate-400">Loading routes…</td></tr>
                      : routes.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-400">No matching routes found.</td></tr>
                        : routes.map((route) => (
                          <tr key={route.id} className="hover:bg-slate-800/60">
                            <td className="p-3"><input type="checkbox" checked={selected.includes(route.id)} onChange={() => toggleRoute(route.id)} aria-label={'Select ' + route.from_city + ' to ' + route.to_city} /></td>
                            <td className="p-3 font-medium text-white">{route.from_city} → {route.to_city}<span className="block text-xs text-slate-500">{route.slug}</span></td>
                            <td className="max-w-xs p-3"><span className="line-clamp-2">{route.seo_title || <em className="text-slate-500">Missing</em>}</span></td>
                            <td className="p-3">{route.seo_title && route.seo_description && route.seo_content ? <Badge className="bg-emerald-800">Populated</Badge> : <Badge className="bg-amber-800">Needs SEO</Badge>}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-800 p-3 text-xs text-slate-400">
                <span>Page {page} of {pageCount} · 50 routes per page</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-700" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button>
                  <Button size="sm" variant="outline" className="border-slate-700" disabled={page >= pageCount || loading} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h3 className="mb-3 font-semibold text-white">AI fields to generate</h3>
              <div className="grid grid-cols-2 gap-3">
                {SEO_FIELDS.map((field) => <label key={field.key} className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={fields.includes(field.key)} onChange={() => toggleField(field.key)} /> {field.label}
                </label>)}
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={preserveExisting} onChange={(event) => setPreserveExisting(event.target.checked)} />
                Preserve existing values (fill missing fields only)
              </label>
              <label className="mt-4 block text-sm text-slate-300">Extra instructions for AI
                <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={2000} rows={4} placeholder="Optional: tone, route-specific instructions, terms to avoid..." className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-white" />
              </label>
              <Button className="mt-4 w-full bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400" onClick={startNewJob} disabled={!selected.length || running || !fields.length}>
                <Wand2 className="mr-2 h-4 w-4" /> Create AI Job for {selected.length.toLocaleString('en-IN')} routes
              </Button>
              <p className="mt-3 text-xs leading-5 text-slate-500">AI output is saved as draft content. Existing approved FAQs are not deleted. Route URL, slug, fares and booking data are never modified.</p>
            </div>

            {job && <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-semibold text-white">Bulk job progress</h3>
                <Badge className={job.status === 'completed' ? 'bg-emerald-800' : job.status === 'running' ? 'bg-blue-800' : 'bg-amber-800'}>{job.status}</Badge>
              </div>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-amber-400 transition-all" style={{ width: progress + '%' }} /></div>
              <p className="text-sm text-slate-300">{job.nextIndex.toLocaleString('en-IN')} / {job.queue.length.toLocaleString('en-IN')} processed ({progress}%)</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-slate-900 p-2"><span className="text-slate-400">Saved</span><strong className="block text-lg text-emerald-400">{(job.completed || 0).toLocaleString('en-IN')}</strong></div>
                <div className="rounded bg-slate-900 p-2"><span className="text-slate-400">Failed</span><strong className="block text-lg text-red-400">{(job.failedIds || []).length.toLocaleString('en-IN')}</strong></div>
              </div>
              {job.lastRoute && <p className="mt-2 text-xs text-slate-400">Last processed: {job.lastRoute}</p>}
              {job.lastError && <p className="mt-2 break-words text-xs text-red-300">Last error: {job.lastError}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {running
                  ? <Button size="sm" variant="outline" className="border-amber-700 text-amber-200" onClick={pauseJob}><Pause className="mr-1 h-4 w-4" /> Pause</Button>
                  : <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={processJob} disabled={job.nextIndex >= job.queue.length}><Play className="mr-1 h-4 w-4" /> Resume</Button>}
                {(job.failedIds || []).length > 0 && <Button size="sm" variant="outline" className="border-red-800 text-red-200" onClick={retryFailed} disabled={running}><RotateCcw className="mr-1 h-4 w-4" /> Retry failed</Button>}
                <Button size="sm" variant="ghost" className="text-slate-400" onClick={clearJob} disabled={running}>Clear job</Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Progress is saved in this browser after every route. Keep this tab open during processing; if it closes or the network drops, reopen this dashboard and resume the saved job.</p>
            </div>}

            <div className="rounded-xl border border-amber-900/70 bg-amber-950/30 p-3 text-xs leading-5 text-amber-100">
              <AlertTriangle className="mb-1 h-4 w-4" /> AI API usage is billed separately by OpenAI. Each selected route uses one AI request. Generated SEO content and FAQs remain drafts for review; FAQs are not published until approved.
            </div>
            {job?.status === 'completed' && !(job.failedIds || []).length && <div className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" /> All routes in this job completed successfully.</div>}
          </aside>
        </div>
        {notice && <div className="mx-4 mb-4 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200">{notice}</div>}
      </div>
    </div>
  );
}
