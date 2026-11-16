import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSeoManagement } from '@/hooks/useSeoManagement';
import RouteSeoEditor from '@/components/admin/RouteSeoEditor';
import { Loader2 } from 'lucide-react';
import { triggerAutoRegenerateIfEnabled } from '@/utils/sitemapUtils';

export default function RouteSeoPage() {
  const router = useRouter();
  const { id: routeId } = router.query;
  
  const { getSeoData, saveSeoData } = useSeoManagement();
  const [loading, setLoading] = useState(true);
  const [seoData, setSeoData] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!router.isReady || !routeId) return;
      setLoading(true);
      setLoadError('');
      const { success, data, error } = await getSeoData(routeId);
      if (success) setSeoData(data);
      else setLoadError(error?.message || 'Unable to load route SEO data.');
      setLoading(false);
    };
    fetchData();
  }, [router.isReady, routeId, getSeoData]);

  const handleSave = async (updatedData) => {
    const { success } = await saveSeoData(routeId, updatedData);
    if (success) {
      triggerAutoRegenerateIfEnabled('seo_updated');
      router.push('/admin/seo-dashboard');
    }
  };

  if (loading || !router.isReady) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-amber-500" /></div>;
  if (loadError || !seoData) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-white p-6"><p className="text-red-300">{loadError || 'Route SEO record could not be loaded.'}</p><button className="rounded bg-amber-500 px-4 py-2 font-semibold text-slate-950" onClick={() => router.push('/admin/seo-dashboard')}>Back to SEO dashboard</button></div>;

  return (
    <div className="h-screen flex flex-col">
      <RouteSeoEditor 
        routeId={routeId} 
        initialData={seoData} 
        onSave={handleSave} 
        onCancel={() => router.push('/admin/seo-dashboard')} 
      />
    </div>
  );
}
