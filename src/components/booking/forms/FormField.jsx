import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export default function FormField({ 
  label, 
  required, 
  error, 
  helperText, 
  children, 
  className 
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {children}
      
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
      )}
      
      {error && (
        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-in slide-in-from-top-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}