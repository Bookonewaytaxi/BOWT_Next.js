import React from 'react';
import Head from 'next/head';
import RouteSeoDashboard from '@/components/admin/RouteSeoDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SeoDashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Head>
        <title>SEO Dashboard | Admin</title>
      </Head>
      
      <div className="border-b border-slate-800 bg-slate-900 p-4 sticky top-0 z-10">
         <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.push('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
         </Button>
      </div>

      <RouteSeoDashboard />
    </div>
  );
}