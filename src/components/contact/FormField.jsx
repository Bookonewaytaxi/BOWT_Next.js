import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function FormField({ 
  label, 
  id, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error, 
  success, 
  helperText, 
  required = false,
  className,
  rows = 4,
  children 
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-[#FFD700]">*</span>}
      </Label>
      
      <div className="relative">
        {children ? (
          children
        ) : type === 'textarea' ? (
          <Textarea
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            className={cn(
              "bg-[#0A0D11] border-white/10 text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-colors resize-none",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              success && "border-green-500 focus:border-green-500 focus:ring-green-500"
            )}
          />
        ) : (
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={cn(
              "bg-[#0A0D11] border-white/10 text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-colors h-12",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              success && "border-green-500 focus:border-green-500 focus:ring-green-500"
            )}
          />
        )}

        {success && !children && type !== 'textarea' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}