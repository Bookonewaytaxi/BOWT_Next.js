import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { AIRPORT_PAGES } from '@/lib/airportConfig';
import { Save, RefreshCw, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AirportSeoManager() {
  const [selectedSlug, setSelectedSlug] = useState(AIRPORT_PAGES[0]?.slug || '');
  const [meta, setMeta] = useState({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const airport = useMemo(() => AIRPORT_PAGES.find((item) => item.slug === selectedSlug), [selectedSlug]);

  const load = async () => {
    if (!selectedSlug) return;
    setLoading(true); setNotice('');
    try {
      const { data, error } = await supabase.from('seo_metadata').select('id,page_type,slug,meta_title,meta_description,keywords').eq('page_type','airport').eq('slug',selectedSlug).maybeSingle();
      if (error) throw error;
      setMeta(data || {});
      setTitle(data?.meta_title || '');
      setDescription(data?.meta_description || '');
      setKeywords(Array.isArray(data?.keywords) ? data.keywords.join(', ') : '');
    } catch (error) {
      setNotice(error.message || 'Could not load airport SEO metadata.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [selectedSlug]);

  const save = async () => {
    if (!airport) return;
    if (title.length > 60 || description.length > 160) { setNotice('Keep SEO title within 60 characters and description within 160 characters.'); return; }
    setSaving(true); setNotice('');
    try {
      const payload = { page_type: 'airport', slug: selectedSlug, meta_title: title.trim() || null, meta_description: description.trim() || null, keywords: keywords.split(',').map((x) => x.trim()).filter(Boolean), updated_at: new Date().toISOString() };
      let result;
      if (meta.id) result = await supabase.from('seo_metadata').update(payload).eq('id', meta.id);
      else result = await supabase.from('seo_metadata').insert(payload);
      if (result.error) throw result.error;
      setNotice('Airport SEO metadata saved. The public page will refresh within its revalidation window.');
      await load();
    } catch (error) { setNotice(error.message || 'Could not save airport SEO metadata.'); }
    finally { setSaving(false); }
  };

  return <div className="max-w-5xl mx-auto p-4 md:p-6">
    <div className="mb-6"><h2 className="text-2xl font-bold text-white">Airport SEO Management</h2><p className="mt-1 text-sm text-slate-400">Manage the 12 requested airport landing pages. Airport fares are never copied from regular city routes.</p></div>
    {notice && <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">{notice}</div>}
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-xl border border-slate-800 bg-slate-900 p-3">
        {AIRPORT_PAGES.map((item) => <button key={item.slug} onClick={() => setSelectedSlug(item.slug)} className={`mb-1 w-full rounded-lg p-3 text-left text-sm ${selectedSlug === item.slug ? 'bg-amber-500/15 text-amber-300' : 'text-slate-300 hover:bg-slate-800'}`}><Plane className="mr-2 inline h-4 w-4" />{item.name}<span className="mt-1 block pl-6 text-xs text-slate-500">{item.cityName}</span></button>)}
      </aside>
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        {airport && <><h3 className="mb-1 text-xl font-bold text-white">{airport.name}</h3><p className="mb-5 text-xs text-slate-500">/airports/{airport.slug}</p>
          <label className="mb-4 block text-sm text-slate-300">SEO Title <Input value={title} onChange={(e)=>setTitle(e.target.value)} maxLength={70} className="mt-2 border-slate-700 bg-slate-950 text-white" placeholder="Airport taxi service title" /><span className="text-xs text-slate-500">{title.length}/60 recommended</span></label>
          <label className="mb-4 block text-sm text-slate-300">Meta Description <Textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={4} maxLength={180} className="mt-2 border-slate-700 bg-slate-950 text-white" placeholder="Unique airport service description" /><span className="text-xs text-slate-500">{description.length}/160 recommended</span></label>
          <label className="mb-5 block text-sm text-slate-300">Keywords (comma separated)<Input value={keywords} onChange={(e)=>setKeywords(e.target.value)} className="mt-2 border-slate-700 bg-slate-950 text-white" /></label>
          <div className="flex gap-2"><Button onClick={load} disabled={loading || saving} variant="outline" className="border-slate-700 text-slate-200"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button><Button onClick={save} disabled={saving || loading} className="bg-amber-500 text-slate-950 hover:bg-amber-400"><Save className="mr-2 h-4 w-4" />Save SEO</Button></div>
        </>}
      </section>
    </div>
  </div>;
}
