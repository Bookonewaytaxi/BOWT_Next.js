import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, Calendar as CalendarIcon, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function AdvancedBookingFilters({ onFilterChange, activeFiltersCount, onClearAll, currentFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Options State
  const [cities, setCities] = useState({ from: [], to: [] });
  const [drivers, setDrivers] = useState([]);
  
  // Local Filter State (Initialized with props)
  const [filters, setFilters] = useState(currentFilters || {
    status: [],
    payment_status: [],
    from_city: 'all',
    to_city: 'all',
    car_type: [],
    driver_id: 'all',
    date_range: { start: '', end: '' }
  });

  // Sync with prop when it changes (e.g. clear all pressed outside)
  useEffect(() => {
    if (currentFilters) {
       setFilters(currentFilters);
    }
  }, [currentFilters]);

  // Fetch options when opening
  useEffect(() => {
    if (isOpen) {
      fetchFilterOptions();
    }
  }, [isOpen]);

  const fetchFilterOptions = async () => {
    setLoading(true);
    try {
       // Fetch unique cities
       const { data: cityData } = await supabase.from('bookings').select('from_city, to_city');
       const fromCities = [...new Set(cityData?.map(item => item.from_city).filter(Boolean))].sort();
       const toCities = [...new Set(cityData?.map(item => item.to_city).filter(Boolean))].sort();
       setCities({ from: fromCities, to: toCities });

       // Fetch drivers
       const { data: driverData } = await supabase.from('drivers').select('id, driver_name');
       setDrivers(driverData || []);
    } catch (e) {
       console.error("Failed to load filter options", e);
    } finally {
       setLoading(false);
    }
  };

  const handleApply = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    onClearAll(); // Calls parent clear
    setIsOpen(false);
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Driver Assigned', value: 'Driver Assigned' },
    { label: 'Trip Started', value: 'Trip Started' },
    { label: 'Trip Completed', value: 'Trip Completed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  const paymentOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Advance Received', value: 'Advance Received' },
    { label: 'Full Paid', value: 'Full Paid' }
  ];

  const carOptions = [
    { label: 'Sedan', value: 'Sedan' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Innova', value: 'Innova Crysta' },
    { label: 'Crysta', value: 'Crysta' } 
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 ${activeFiltersCount > 0 ? 'border-amber-500' : ''}`}>
          <Filter className="h-4 w-4" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 animate-in zoom-in">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0 bg-[#0f172a] border-slate-700 text-slate-100 shadow-2xl" align="end">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
           <h4 className="font-bold flex items-center gap-2">
              <Filter className="h-4 w-4 text-amber-500" /> Filter Bookings
           </h4>
           {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 text-xs text-red-400 hover:text-red-300 px-2">
                 <X className="h-3 w-3 mr-1" /> Clear All
              </Button>
           )}
        </div>
        
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Booking Status */}
          <div className="space-y-3">
            <Label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Booking Status</Label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${opt.value}`} 
                    checked={filters.status.includes(opt.value)}
                    onCheckedChange={() => toggleArrayFilter('status', opt.value)}
                    className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label htmlFor={`status-${opt.value}`} className="text-sm font-normal cursor-pointer select-none text-slate-300">{opt.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Payment Status */}
          <div className="space-y-3">
            <Label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Payment Status</Label>
            <div className="flex flex-wrap gap-4">
              {paymentOptions.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`pay-${opt.value}`}
                    checked={filters.payment_status.includes(opt.value)}
                    onCheckedChange={() => toggleArrayFilter('payment_status', opt.value)}
                    className="border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <Label htmlFor={`pay-${opt.value}`} className="text-sm font-normal cursor-pointer select-none text-slate-300">{opt.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Cities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 font-bold">Pickup City</Label>
              <Select value={filters.from_city} onValueChange={(val) => setFilters(prev => ({ ...prev, from_city: val }))}>
                <SelectTrigger className="h-9 bg-slate-800 border-slate-700 focus:ring-amber-500">
                  <SelectValue placeholder="Any City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any City</SelectItem>
                  {loading ? <div className="p-2 text-xs text-slate-500">Loading...</div> : cities.from.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400 font-bold">Drop City</Label>
              <Select value={filters.to_city} onValueChange={(val) => setFilters(prev => ({ ...prev, to_city: val }))}>
                <SelectTrigger className="h-9 bg-slate-800 border-slate-700 focus:ring-amber-500">
                  <SelectValue placeholder="Any City" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">Any City</SelectItem>
                   {loading ? <div className="p-2 text-xs text-slate-500">Loading...</div> : cities.to.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
             <Label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pickup Date Range</Label>
             <div className="flex gap-2 items-center">
                <div className="relative flex-1 group">
                   <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 group-hover:text-amber-500 transition-colors" />
                   <Input 
                      type="date" 
                      className="pl-9 h-9 bg-slate-800 border-slate-700 text-xs text-slate-200"
                      value={filters.date_range.start}
                      onChange={(e) => setFilters(prev => ({ ...prev, date_range: { ...prev.date_range, start: e.target.value } }))}
                   />
                </div>
                <span className="text-slate-500 font-bold">to</span>
                <div className="relative flex-1 group">
                   <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 group-hover:text-amber-500 transition-colors" />
                   <Input 
                      type="date" 
                      className="pl-9 h-9 bg-slate-800 border-slate-700 text-xs text-slate-200"
                      value={filters.date_range.end}
                      onChange={(e) => setFilters(prev => ({ ...prev, date_range: { ...prev.date_range, end: e.target.value } }))}
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
           <Button variant="ghost" className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => setIsOpen(false)}>
             Cancel
           </Button>
           <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold" onClick={handleApply}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />} 
              Apply Filters
           </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}