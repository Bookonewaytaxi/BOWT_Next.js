import React from 'react';
import { cn } from '@/lib/utils';
import FormField from './FormField';

export default function FormTextarea({
  label,
  required,
  error,
  helperText,
  maxLength,
  value,
  className,
  ...props
}) {
  return (
    <FormField label={label} required={required} error={error} helperText={helperText} className={className}>
      <div className="relative">
        <textarea
          className={cn(
            "w-full bg-white border border-slate-300 text-[#0F1419] text-[13px] rounded-md px-2.5 py-2 outline-none transition-all placeholder:text-slate-400 min-h-[80px] resize-y",
            "focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500"
          )}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {maxLength && (
          <div className="absolute right-2 bottom-2 text-[10px] text-slate-400 font-medium bg-white px-1">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
    </FormField>
  );
}