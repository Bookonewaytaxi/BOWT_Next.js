import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInquiries } from '@/hooks/useInquiries';
import { format } from 'date-fns';

export default function InquiryFilters({ onFilterChange }) {
  const { fetchPickupCities } = useInquiries();
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  
  const [filters, setFilters] = useState({
    search_mobile: '',
    pickup_city: 'all',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    let mounted = true;
    
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const cityData = await fetchPickupCities();
        if (mounted) {
          setCities(cityData || []);
        }
      } catch (err) {
        console.error("Failed to load cities for filter:", err);
      } finally {
        if (mounted) {
          setLoadingCities(false);
        }
      }
    };
    
    loadCities();
    
    return () => { mounted = false; };
  }, [fetchPickupCities]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const reset = {
      search_mobile: '',
      pickup_city: 'all',
      date_from: '',
      date_to: ''
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  const hasActiveFilters = filters.search_mobile || filters.pickup_city !== 'all' || filters.date_from || filters.date_to;

  return (
    <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 shadow-lg">
      
      {/* Search Mobile */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input 
          placeholder="Search mobile number..."
          value={filters.search_mobile}
          onChange={(e) => handleFilterChange('search_mobile', e.target.value)}
          className="pl-9 bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#FFD700]"
        />
        {filters.search_mobile && (
           <button 
             onClick={() => handleFilterChange('search_mobile', '')}
             className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
           >
             <X className="h-3 w-3" />
           </button>
        )}
      </div>

      {/* Pickup City Filter */}
      <div className="w-full md:w-[250px]">
        <Select 
          value={filters.pickup_city} 
          onValueChange={(val) => handleFilterChange('pickup_city', val)}
          disabled={loadingCities}
        >
          <SelectTrigger className="bg-[#0f172a] border-slate-700 text-white focus:ring-[#FFD700]">
            <SelectValue placeholder={loadingCities ? "Loading cities..." : "Filter by City"} />
          </SelectTrigger>
          <SelectContent className="bg-[#1e293b] border-slate-700 text-white max-h-[300px]">
            <SelectItem value="all">All Cities</SelectItem>
            {cities.length > 0 ? (
              cities.map(({ city, count }) => (
                <SelectItem key={city} value={city}>
                  {city} ({count})
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-slate-500 text-center">No cities found</div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Date Filter */}
      <div className="flex gap-2 items-center flex-1">
         <Input 
           type="date" 
           value={filters.date_from}
           onChange={(e) => handleFilterChange('date_from', e.target.value)}
           className="bg-[#0f172a] border-slate-700 text-white w-full"
           placeholder="From"
         />
         <span className="text-slate-500">-</span>
         <Input 
           type="date" 
           value={filters.date_to}
           onChange={(e) => handleFilterChange('date_to', e.target.value)}
           className="bg-[#0f172a] border-slate-700 text-white w-full"
           placeholder="To"
         />
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          onClick={clearFilters}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 whitespace-nowrap"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}