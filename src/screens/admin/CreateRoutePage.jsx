import React from 'react';
import Head from 'next/head';
import CreateRouteForm from '@/components/admin/routes/CreateRouteForm';
import Header from '@/components/layout/Header';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CreateRoutePage() {
  return (
    <>
      <Head>
        <title>Create New Route | Admin Dashboard</title>
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
             <h1 className="text-3xl font-black text-white">Create New Route</h1>
           </div>
           
           <CreateRouteForm />
         </div>
      </div>
    </>
  );
}