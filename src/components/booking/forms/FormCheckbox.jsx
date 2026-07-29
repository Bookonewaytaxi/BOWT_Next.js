import React from 'react';
import { cn } from '@/lib/utils';
import FormField from './FormField';

export default function FormCheckbox({
  label,
  required,
  error,
  checked,
  onChange,
  className
}) {
  return (
    <FormField error={error} className={className}>
      <label className={cn(
        "flex items-start gap-2 p-3 rounded-md border transition-all cursor-pointer",
        checked 
          ? "border-[#FFD700] bg-[#FFD700]/5" 
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
        error && "border-red-500 bg-red-50/50"
      )}>
        <div className="relative flex items-center mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <div className={cn(
            "w-4 h-4 rounded border-2 transition-colors flex items-center justify-center",
            checked ? "bg-[#FFD700] border-[#FFD700]" : "border-slate-300 bg-white"
          )}>
            {checked && (
              <svg className="w-3 h-3 text-[#0F1419]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <div className="flex-1">
          <span className={cn(
            "font-medium text-sm leading-tight",
            checked ? "text-[#0F1419]" : "text-slate-600"
          )}>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </div>
      </label>
    </FormField>
  );
}