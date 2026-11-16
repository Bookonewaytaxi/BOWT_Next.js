import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { RefreshCw, Save, Search, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CHUNK = 500;
const slugifyCity = (name) => String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function CitySeoManager() {
  const [cities, setCities] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [selected, setSelected] = useState('');
  const [filter, setFilter] = useState('');
  const [stateName, setStateName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [seoProfiles, setSeoProfiles] = useState({});
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setNotice('');
    try {
      const cityMap = new Map();
      for (let offset = 0; offset < 20000; offset += CHUNK) {
        const { data, error } = await supabase.from('routes').select('from_city,to_city').eq('is_active', true).range(offset, offset + CHUNK - 1);
        if (error) throw error;
        (data || []).forEach((row) => {
          [row.from_city, row.to_city].filter(Boolean).forEach((name) => {
            const key = String(name).trim().toLowerCase();
            if (key && !cityMap.has(key)) cityMap.set(key, String(name).trim());
          });
        });
        if (!data || data.length < CHUNK) break;
      }
      const names = [...cityMap.values()].sort((a, b) => a.localeCompare(b));
      const profileMap = {};
      for (let offset = 0; offset < names.length; offset += CHUNK) {
        const batch = names.slice(offset, offset + CHUNK);
        const { data, error } = await supabase.from('city_profiles').select('id,city_name,slug,state,description,image_url,is_active').in('city_name', batch);
        if (error) throw error;
        (data || []).forEach((profile) => { profileMap[profile.city_name.toLowerCase()] = profile; });
      }
      const { data: seoRows, error: seoError } = await supabase.from('seo_metadata')
        .select('id,page_type,slug,meta_title,meta_description,keywords')
        .eq('page_type', 'city');
      if (seoError) throw seoError;
      const seoMap = {};
      (seoRows || []).forEach((row) => { if (row.slug) seoMap[row.slug] = row; });
      setCities(names);
      setProfiles(profileMap);
      setSeoProfiles(seoMap);
      setSelected((current) => current || names[0] || '');
    } catch (error) {
      console.error('[City SEO] Failed to load city index:', error);
      setNotice(error.message || 'Could not load city list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeProfile = selected ? profiles[selected.toLowerCase()] : null;
  const activeSeo = selected ? seoProfiles[slugifyCity(selected)] : null;
  useEffect(() => {
    setStateName(activeProfile?.state || '');
    setDescription(activeProfile?.description || '');
    setImageUrl(activeProfile?.image_url || '');
    setSeoTitle(activeSeo?.meta_title || '');
    setSeoDescription(activeSeo?.meta_description || '');
    setSeoKeywords(Array.isArray(activeSeo?.keywords) ? activeSeo.keywords.join(', ') : '');
  }, [selected, activeProfile?.id, activeProfile?.updated_at, activeSeo?.id, activeSeo?.updated_at]);

  const visibleCities = useMemo(() => cities.filter((city) => city.toLowerCase().includes(filter.toLowerCase())), [cities, filter]);
  const missingCount = cities.filter((city) => !profiles[city.toLowerCase()]).length;

  const syncMissing = async () => {
    const missing = cities.filter((city) => !profiles[city.toLowerCase()]);
    if (!missing.length) { setNotice('Every route city already has a city profile.'); return; }
    setBusy(true);
    try {
      for (let offset = 0; offset < missing.length; offset += 100) {
        const rows = missing.slice(offset, offset + 100).map((city) => ({
          city_name: city,
          slug: slugifyCity(city),
          is_active: true
        }));
        const { error } = await supabase.from('city_profiles').upsert(rows, { onConflict: 'city_name', ignoreDuplicates: true });
        if (error) throw error;
      }
      setNotice(`Created city profiles for ${missing.length} cities. Existing city descriptions were left unchanged.`);
      await load();
    } catch (error) {
      console.error('[City SEO] City profile sync failed:', error);
      setNotice(error.message || 'City profile sync failed. Check your admin session and table permissions.');
    } finally {
      setBusy(false);
    }
  };

  const generateCityContent = async () => {
    if (!selected) return;
    setAiLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your admin session has expired. Please sign in again.');
      const [{ data: outgoing, error: outgoingError }, { data: incoming, error: incomingError }] = await Promise.all([
        supabase.from('routes').select('to_city').eq('from_city', selected).eq('is_active', true).limit(20),
        supabase.from('routes').select('from_city').eq('to_city', selected).eq('is_active', true).limit(20)
      ]);
      if (outgoingError) throw outgoingError;
      if (incomingError) throw incomingError;
      const response = await fetch('/api/admin/seo/ai-generate-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          city_name: selected,
          state: stateName,
          outgoing_destinations: (outgoing || []).map((row) => row.to_city),
          incoming_origins: (incoming || []).map((row) => row.from_city)
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'AI city content generation failed.');
      setDescription(result.description);
      setNotice('AI generated a draft city introduction. Review every statement and click Save city profile only when you approve it.');
    } catch (error) {
      console.error('[City SEO] AI generation failed:', error);
      setNotice(error.message || 'AI city content generation failed. No profile was changed.');
    } finally {
      setAiLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!selected) return;
    if (description.trim() && description.trim().length < 120) {
      setNotice('City introduction should be at least 120 characters and provide useful local information. Avoid repeating generic filler.');
      return;
    }
    setBusy(true);
    try {
      const row = {
        city_name: selected,
        slug: slugifyCity(selected),
        state: stateName.trim() || null,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: true,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('city_profiles').upsert(row, { onConflict: 'city_name' }).select('id,city_name,slug,state,description,image_url,is_active').single();
      if (error) throw error;
      setProfiles((current) => ({ ...current, [selected.toLowerCase()]: data }));
      const seoPayload = {
        page_type: 'city',
        page_id: data.id,
        slug: slugifyCity(selected),
        meta_title: seoTitle.trim() || null,
        meta_description: seoDescription.trim() || null,
        keywords: seoKeywords.split(',').map((item) => item.trim()).filter(Boolean),
        focus_keyword: `${selected} taxi service`,
        updated_at: new Date().toISOString()
      };
      const existingSeo = seoProfiles[slugifyCity(selected)];
      let seoResult;
      if (existingSeo?.id) {
        seoResult = await supabase.from('seo_metadata').update(seoPayload).eq('id', existingSeo.id).select('id,page_type,slug,meta_title,meta_description,keywords').single();
      } else {
        seoResult = await supabase.from('seo_metadata').insert(seoPayload).select('id,page_type,slug,meta_title,meta_description,keywords').single();
      }
      if (seoResult.error) throw seoResult.error;
      setSeoProfiles((current) => ({ ...current, [slugifyCity(selected)]: seoResult.data }));
      setNotice(`City profile and SEO metadata saved for ${selected}. The public city page will refresh after its revalidation window.`);
    } catch (error) {
      console.error('[City SEO] City profile save failed:', error);
      setNotice(error.message || 'Could not save city profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div><h2 className="text-2xl font-bold text-white">City Page SEO & Content</h2><p className="text-slate-400 text-sm mt-1">One shared profile for each unique pickup or destination city. No duplicate city pages are created.</p></div>
        <div className="flex gap-2"><Button variant="outline" className="border-slate-700 text-slate-200" onClick={load} disabled={loading || busy}><RefreshCw className="w-4 h-4 mr-2" /> Refresh city list</Button><Button className="bg-amber-500 text-slate-950 hover:bg-amber-400" onClick={syncMissing} disabled={busy || loading || !missingCount}><MapPin className="w-4 h-4 mr-2" /> Create missing profiles ({missingCount})</Button></div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400 text-sm">Unique route cities</p><p className="text-2xl font-bold text-white">{cities.length}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400 text-sm">Profiles created</p><p className="text-2xl font-bold text-emerald-400">{cities.length - missingCount}</p></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-slate-400 text-sm">Missing profiles</p><p className="text-2xl font-bold text-amber-400">{missingCount}</p></div>
      </div>
      {notice && <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">{notice}</div>}
      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search city..." className="pl-9 bg-slate-950 border-slate-700 text-white" /></div>
          <div className="max-h-[560px] overflow-y-auto space-y-1">
            {loading ? <p className="p-3 text-slate-400">Loading cities…</p> : visibleCities.map((city) => {
              const profile = profiles[city.toLowerCase()];
              return <button key={city} onClick={() => setSelected(city)} className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${selected === city ? 'bg-amber-500/15 text-amber-300' : 'text-slate-300 hover:bg-slate-800'}`}><span>{city}</span>{profile?.description ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-slate-500">Needs content</span>}</button>;
            })}
          </div>
        </aside>
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          {!selected ? <p className="text-slate-400">Select a city to manage its content.</p> : <>
            <div className="flex items-center justify-between mb-5"><div><h3 className="text-xl font-bold text-white">{selected}</h3><p className="text-xs text-slate-500">Canonical page: /routes/{slugifyCity(selected)}-taxi-service</p></div><span className="text-xs text-slate-400">{activeProfile ? 'Profile exists' : 'Profile not created'}</span></div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <label className="block text-sm text-slate-300">State / Region<Input value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="e.g. Gujarat" className="mt-2 bg-slate-950 border-slate-700 text-white" /></label>
              <label className="block text-sm text-slate-300">City image URL (optional)<Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="mt-2 bg-slate-950 border-slate-700 text-white" /></label>
            </div>
            <label className="block text-sm text-slate-300">Unique city introduction (visible on the city page)<Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={9} placeholder={`Write verified, useful information about ${selected}: location context, relevant travel hubs, pickup planning and local route usefulness. Do not invent landmarks or service claims.`} className="mt-2 bg-slate-950 border-slate-700 text-white" /></label>
            <div className="mt-5 border-t border-slate-800 pt-5"><h4 className="mb-3 text-sm font-bold text-amber-300">Search Engine Metadata</h4>
              <label className="mb-3 block text-sm text-slate-300">SEO Title <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} placeholder={`${selected} Taxi Service | One Way Taxi`} className="mt-2 bg-slate-950 border-slate-700 text-white" /><span className="text-xs text-slate-500">{seoTitle.length}/60 recommended</span></label>
              <label className="mb-3 block text-sm text-slate-300">Meta Description <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} maxLength={180} placeholder={`Write a unique search description for ${selected} taxi service.`} className="mt-2 bg-slate-950 border-slate-700 text-white" /><span className="text-xs text-slate-500">{seoDescription.length}/160 recommended</span></label>
              <label className="block text-sm text-slate-300">SEO Keywords (comma separated)<Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} className="mt-2 bg-slate-950 border-slate-700 text-white" /></label>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-slate-500"><span>{description.trim().length} characters · Avoid duplicate generic text</span><span>Meta fields are stored separately from route fares and content.</span></div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={generateCityContent} disabled={aiLoading || busy} variant="outline" className="border-violet-300 text-violet-300 hover:bg-violet-950/40"><Sparkles className="w-4 h-4 mr-2" /> {aiLoading ? 'Generating…' : 'AI Generate City Content'}</Button>
              <Button onClick={saveProfile} disabled={busy || aiLoading} className="bg-amber-500 text-slate-950 hover:bg-amber-400"><Save className="w-4 h-4 mr-2" /> Save city profile</Button>
            </div>
          </>}
        </section>
      </div>
    </div>
  );
}
