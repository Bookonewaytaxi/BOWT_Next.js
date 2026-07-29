import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to, label }) {
  return (
    <Link 
      href={to} 
      className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[48px] 
                 text-sm font-medium text-slate-700 hover:text-slate-900 
                 hover:bg-slate-100 rounded-lg transition-colors
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
                 md:px-4 md:py-2 md:text-sm
                 sm:px-3 sm:py-2 sm:text-xs"
    >
      <ArrowLeft className="h-4 w-4" /> 
      {label}
    </Link>
  );
}