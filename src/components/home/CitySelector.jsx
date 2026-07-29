import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", 
  "Chandigarh", "Indore", "Surat", "Vadodara", "Nagpur"
];

export default function CitySelector({ 
  label, 
  value, 
  onChange, 
  placeholder = "Select City", 
  excludeCity, 
  icon: Icon = MapPin, 
  className 
}) {
  // Filter available cities based on exclusion
  const availableCities = CITIES.filter(city => city !== excludeCity).sort();

  return (
    <div className={cn("relative group", className)}>
      {/* Icon */}
      <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors z-10 pointer-events-none">
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="relative">
        {/* Native Select Element */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-12 pl-10 pr-10 bg-slate-50 text-slate-900 border-slate-200",
            "focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm",
            "hover:border-amber-400 appearance-none cursor-pointer",
            "text-base font-medium placeholder:text-slate-400 outline-none",
            !value && "text-slate-500" // Muted text if placeholder
          )}
        >
          <option value="" disabled>{placeholder}</option>
          {availableCities.map((city) => (
            <option key={city} value={city} className="text-slate-900 py-2">
              {city}
            </option>
          ))}
        </select>
        
        {/* Chevron Icon */}
        <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
          <ChevronDown className="w-5 h-5 opacity-70" />
        </div>
      </div>

      {/* Floating Label */}
      <label 
        className={cn(
          "absolute left-10 transition-all duration-200 pointer-events-none px-1 rounded-sm",
          value 
            ? "-top-2.5 text-xs text-amber-600 font-bold bg-white" 
            : "top-3.5 text-slate-500 bg-transparent"
        )}
      >
        {label}
      </label>
    </div>
  );
}