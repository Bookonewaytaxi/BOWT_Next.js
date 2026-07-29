import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, Search, Calendar as CalendarIcon } from 'lucide-react';

export default function InquiryFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: { start: '', end: '' },
    city: '',
    search: '',
    conversionStatus: 'all'
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleClear = () => {
    setFilters({
      status: 'all',
      dateRange: { start: '', end: '' },
      city: '',
      search: '',
      conversionStatus: 'all'
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
      <div className="flex-1 flex gap-4 flex-wrap">
        <div className="w-full md:w-64 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search Mobile Number..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-9 bg-slate-900 border-slate-700"
          />
        </div>

        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
          <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new_inquiry">New Inquiry</SelectItem>
            <SelectItem value="follow_up_required">Follow Up Required</SelectItem>
            <SelectItem value="converted_to_booking">Converted</SelectItem>
            <SelectItem value="lost_inquiry">Lost</SelectItem>
          </SelectContent>
        </Select>

        <Input 
           placeholder="Filter by City" 
           value={filters.city} 
           onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
           className="w-[150px] bg-slate-900 border-slate-700"
        />

        <div className="flex items-center gap-2">
           <Input 
             type="date"
             value={filters.dateRange.start}
             onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
             className="w-[140px] bg-slate-900 border-slate-700 text-xs"
           />
           <span className="text-slate-500">-</span>
           <Input 
             type="date"
             value={filters.dateRange.end}
             onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
             className="w-[140px] bg-slate-900 border-slate-700 text-xs"
           />
        </div>
      </div>

      <div className="flex items-center gap-2">
         {Object.values(filters).some(v => v !== 'all' && v !== '' && (typeof v === 'object' ? (v.start || v.end) : true)) && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-400 hover:text-red-300">
               <X className="h-4 w-4 mr-2" /> Clear All
            </Button>
         )}
      </div>
    </div>
  );
}