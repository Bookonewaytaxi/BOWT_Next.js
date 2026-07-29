import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRouteManagement } from '@/hooks/useRouteManagement';
import EditRouteForm from '@/components/admin/routes/EditRouteForm';
import Header from '@/components/layout/Header';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditRoutePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const { fetchRouteById } = useRouteManagement();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { success, data } = await fetchRouteById(id);
      if (success) {
        setInitialData(data);
      } else {
        router.push('/admin/routes');
      }
      setLoading(false);
    };
    loadData();
  }, [id, fetchRouteById, navigate]);

  return (
    <>
      <Head>
        <title>Edit Route | Admin Dashboard</title>
      </Head>
      
      <div className="min-h-screen bg-slate-950 text-slate-200">
         <Header />
         <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
           <div className="flex items-center gap-4 mb-8">
             <Link href="/admin/routes">
               <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                 <ArrowLeft className="w-5 h-5" />
               </Button>
             </Link>
             <h1 className="text-3xl font-black text-white">Edit Route</h1>
           </div>
           
           {loading ? (
             <div className="flex justify-center p-12">
               <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
             </div>
           ) : (
             <EditRouteForm routeId={id} initialData={initialData} />
           )}
         </div>
      </div>
    </>
  );
}