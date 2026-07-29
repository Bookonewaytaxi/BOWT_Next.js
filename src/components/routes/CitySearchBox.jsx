import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function CitySearchBox({ onSearch, placeholder = "Search...", className }) {
  const [value, setValue] = React.useState('');

  const handleChange = (e) => {
    const newVal = e.target.value;
    setValue(newVal);
    onSearch(newVal);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-12 pr-12 h-14 bg-[#161B22] border-[#2F3336] text-[#E8E8E8] placeholder:text-gray-500 rounded-xl focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all w-full"
      />
      {value && (
        <button 
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FFD700] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}