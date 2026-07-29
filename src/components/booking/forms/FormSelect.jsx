import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import FormField from './FormField';

export default function FormSelect({
  label,
  required,
  error,
  helperText,
  options = [],
  className,
  placeholder = "Select",
  ...props
}) {
  return (
    <FormField label={label} required={required} error={error} helperText={helperText} className={className}>
      <div className="relative">
        <select
          className={cn(
            "w-full bg-white border border-slate-300 text-[#0F1419] text-[13px] rounded-md px-2.5 h-9 outline-none transition-all appearance-none cursor-pointer",
            "focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      </div>
    </FormField>
  );
}