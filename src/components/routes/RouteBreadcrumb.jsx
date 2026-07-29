import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function RouteBreadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400 py-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <Link href="/" className="hover:text-[#FFD700] transition-colors flex items-center gap-1">
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
          {item.path ? (
            <Link href={item.path} className="hover:text-[#FFD700] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#FFD700] font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}