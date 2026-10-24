import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSmartCityAutocomplete } from '@/hooks/useSmartCityAutocomplete';

export default function SmartCityAutocomplete({
  value,
  onChange,
  placeholder = "Enter city name",
  excludeCity,
  disabled,
  className
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);
  
  const { getMatchingCities, loadCities, loading } = useSmartCityAutocomplete();

  // Warm the shared city cache after the form mounts so first-time typing does not
  // trigger the first large route-data request. Later visits use localStorage cache.
  useEffect(() => {
    loadCities();
  }, [loadCities]);

  // Sync internal state with prop
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = async (e) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal); // Propagate change immediately
    
    if (newVal.length >= 3) {
      setShowSuggestions(true);
      const cities = await loadCities();
      // Ignore stale async results if the visitor has typed a newer value.
      if (newVal === wrapperRef.current?.querySelector('input')?.value) {
        setSuggestions(getMatchingCities(newVal, excludeCity, cities));
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (city) => {
    setInputValue(city);
    onChange(city);
    setShowSuggestions(false);
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? <span key={i} className="font-bold text-amber-600">{part}</span> : part
    );
  };

  return (
    <div ref={wrapperRef} className={cn("relative group", className)}>
       {/* Icon */}
       <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors z-10 pointer-events-none">
        <MapPin className="w-5 h-5" />
      </div>
      
      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={async () => {
           if (inputValue.length >= 3) {
             setShowSuggestions(true);
             const cities = await loadCities();
             if (inputValue === wrapperRef.current?.querySelector('input')?.value) {
               setSuggestions(getMatchingCities(inputValue, excludeCity, cities));
             }
           }
        }}
        disabled={disabled}
        className={cn(
          "w-full h-12 pl-10 pr-10 bg-slate-50 text-slate-900 border-slate-200",
          "focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm",
          "hover:border-amber-400 placeholder:text-transparent peer",
          "outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          "text-base font-medium"
        )}
        placeholder={placeholder}
        autoComplete="new-password"
        autoCorrect="off"
        spellCheck={false}
      />
      
      {/* Floating Label */}
      <label 
        className={cn(
          "absolute left-10 transition-all duration-200 pointer-events-none px-1 rounded-sm bg-transparent",
           (inputValue || showSuggestions)
            ? "-top-2.5 text-xs text-amber-600 font-bold bg-white" 
            : "top-3.5 text-slate-500"
        )}
      >
        {placeholder}
      </label>

      {/* Clear Button */}
      {inputValue && !disabled && (
        <button 
          type="button"
          onClick={clearInput}
          className="absolute right-3 top-3.5 text-slate-400 hover:text-red-500 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-50 divide-y divide-slate-50"
          >
            {suggestions.length === 0 && loading ? (
              <div className="px-4 py-3 text-sm text-slate-500">Loading city suggestions…</div>
            ) : suggestions.map((city) => (
              <div
                key={city}
                onClick={() => handleSelect(city)}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{highlightMatch(city, inputValue)}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}