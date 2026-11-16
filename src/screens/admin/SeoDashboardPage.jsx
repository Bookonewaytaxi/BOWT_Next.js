import React, { useState } from 'react';
import Head from 'next/head';
import RouteSeoDashboard from '@/components/admin/RouteSeoDashboard';
import CitySeoManager from '@/components/admin/CitySeoManager';
import AirportSeoManager from '@/components/admin/AirportSeoManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Route, MapPin, Plane } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SeoDashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('routes');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Head><title>On-Page SEO Management | Admin</title><meta name="robots" content="noindex,nofollow" /></Head>
      <div className="border-b border-slate-800 bg-slate-900 p-4 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.push('/admin')}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin</Button>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white" onClick={() => router.push('/admin/meta-config')}><FileText className="w-4 h-4 mr-2" /> Meta Templates</Button>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-5 flex gap-2">
        <Button onClick={() => setActiveSection('routes')} variant={activeSection === 'routes' ? 'default' : 'outline'} className={activeSection === 'routes' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'border-slate-700 text-slate-200'}><Route className="w-4 h-4 mr-2" /> Route SEO</Button>
        <Button onClick={() => setActiveSection('cities')} variant={activeSection === 'cities' ? 'default' : 'outline'} className={activeSection === 'cities' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'border-slate-700 text-slate-200'}><MapPin className="w-4 h-4 mr-2" /> City SEO</Button>
        <Button onClick={() => setActiveSection('airports')} variant={activeSection === 'airports' ? 'default' : 'outline'} className={activeSection === 'airports' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'border-slate-700 text-slate-200'}><Plane className="w-4 h-4 mr-2" /> Airport SEO</Button>
      </div>
      {activeSection === 'routes' ? <RouteSeoDashboard /> : activeSection === 'cities' ? <CitySeoManager /> : <AirportSeoManager />}
    </div>
  );
}
