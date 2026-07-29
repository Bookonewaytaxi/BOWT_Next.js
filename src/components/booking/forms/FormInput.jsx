import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import FormField from './FormField';

export default function FormInput({
  label,
  required,
  error,
  helperText,
  className,
  prefix,
  isValid,
  ...props
}) {
  return (
    <FormField label={label} required={required} error={error} helperText={helperText} className={className}>
      <div className="relative">
        {prefix && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-[13px] border-r border-slate-200 pr-2">
            {prefix}
          </div>
        )}
        
        <input
          className={cn(
            "w-full bg-white border border-slate-300 text-[#0F1419] text-[13px] rounded-md px-2.5 h-9 outline-none transition-all placeholder:text-slate-400",
            "focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]",
            "disabled:bg-slate-50 disabled:text-slate-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            isValid && !error && "border-green-500 pr-8",
            prefix && "pl-12"
          )}
          {...props}
        />

        {isValid && !error && (
          <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500 w-4 h-4 pointer-events-none" />
        )}
      </div>
    </FormField>
  );
}