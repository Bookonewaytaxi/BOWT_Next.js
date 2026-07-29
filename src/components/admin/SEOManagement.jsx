import React from 'react';
import { useRouter } from 'next/router';
import { BarChart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This is a placeholder component to link to the new full Dashboard
export default function SEOManagement() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <div className="bg-slate-800 p-6 rounded-full">
         <BarChart className="w-16 h-16 text-amber-500" />
      </div>
      <h2 className="text-3xl font-bold text-white">Advanced SEO Management</h2>
      <p className="text-slate-400 max-w-md">
        Manage meta tags, content, keywords, and track SEO scores for all your routes in one place.
      </p>
      <Button 
        size="lg" 
        onClick={() => router.push('/admin/seo-dashboard')}
        className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8"
      >
        Open SEO Dashboard
      </Button>
    </div>
  );
}