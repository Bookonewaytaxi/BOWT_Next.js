import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import RouteForm from '@/components/admin/RouteForm';
import { useRouteManagement } from '@/hooks/useRouteManagement';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RouteFormPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const { fetchRouteById } = useRouteManagement();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        const { success, data, error } = await fetchRouteById(id);
        if (success) {
          setInitialData(data);
        } else {
          setError(error);
        }
        setLoading(false);
      }
    };

    loadData();
  }, [id, fetchRouteById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Route</h2>
        <p className="mb-4">{error.message || 'Could not fetch route data.'}</p>
        <Button onClick={() => router.push('/admin')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <Head>
        <title>{id ? 'Edit Route' : 'Create Route'} | Admin Panel</title>
      </Head>
      
      <RouteForm initialData={initialData} isEditMode={!!id} />
    </div>
  );
}