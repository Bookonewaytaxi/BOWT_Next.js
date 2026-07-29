import React from 'react';
import { cn } from '@/lib/utils';
import FormField from './FormField';

export default function FormRadio({
  label,
  required,
  error,
  options = [],
  name,
  value,
  onChange,
  className
}) {
  return (
    <FormField label={label} required={required} error={error} className={className}>
      <div className="flex flex-col sm:flex-row gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex-1 flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-all relative overflow-hidden",
                isSelected 
                  ? "border-[#FFD700] bg-[#FFD700]/5 ring-1 ring-[#FFD700]" 
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected ? "border-[#FFD700]" : "border-slate-300"
              )}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-[#FFD700]" />}
              </div>
              <span className={cn(
                "font-medium text-sm",
                isSelected ? "text-[#0F1419]" : "text-slate-600"
              )}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </FormField>
  );
}