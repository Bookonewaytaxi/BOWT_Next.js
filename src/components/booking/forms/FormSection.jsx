import React from 'react';
import { cn } from '@/lib/utils';

export default function FormSection({ title, icon: Icon, children, className }) {
  return (
    <div className={cn("bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden mb-3", className)}>
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        {Icon && (
          <div className="w-6 h-6 rounded-full bg-[#0F1419] flex items-center justify-center text-[#FFD700]">
            <Icon className="w-3 h-3" />
          </div>
        )}
        <h3 className="font-bold text-[#0F1419] text-sm">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}