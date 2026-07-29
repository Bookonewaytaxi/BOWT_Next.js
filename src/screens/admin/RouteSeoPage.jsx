import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSeoManagement } from '@/hooks/useSeoManagement';
import RouteSeoEditor from '@/components/admin/RouteSeoEditor';
import { Loader2 } from 'lucide-react';

export default function RouteSeoPage() {
  const router = useRouter();
  const { id: routeId } = router.query;
  
  const { getSeoData, saveSeoData } = useSeoManagement();
  const [loading, setLoading] = useState(true);
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { success, data } = await getSeoData(routeId);
      if (success) {
        setSeoData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [routeId, getSeoData]);

  const handleSave = async (updatedData) => {
    const { success } = await saveSeoData(routeId, updatedData);
    if (success) {
      router.push('/admin/seo-dashboard');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-amber-500" /></div>;

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
