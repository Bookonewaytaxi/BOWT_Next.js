import React from 'react';
import Head from 'next/head';
import RouteManagement from '@/components/admin/RouteManagement';
import Header from '@/components/layout/Header';

export default function RouteListPage() {
  return (
    <>
      <Head>
        <title>Manage Routes | Admin Dashboard</title>
      </Head>
      
      <div className="min-h-screen bg-slate-950 text-slate-200">
         <Header />
         <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
           <h1 className="text-2xl font-black text-white mb-6">Route Management</h1>
           <RouteManagement />
         </div>
      </div>
    </>
  );
}