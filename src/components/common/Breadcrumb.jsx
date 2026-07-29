import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Breadcrumb({ items, className }) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("breadcrumb flex items-center flex-wrap gap-2 text-sm text-slate-600 py-4", className)}
    >
      <Link 
        href="/" 
        className="flex items-center gap-1 hover:text-[#667eea] hover:underline transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {isLast ? (
              <span className="font-medium text-slate-900" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href} 
                className="hover:text-[#667eea] hover:underline transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}