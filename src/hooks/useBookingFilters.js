import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export function useBookingFilters() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Tab Filter (Quick Filters)
  const [activeTab, setActiveTab] = useState('all');
  
  // Advanced Filters
  const [activeFilters, setActiveFilters] = useState({
    status: [],
    payment_status: [],
    from_city: 'all',
    to_city: 'all',
    car_type: [],
    driver_id: 'all',
    date_range: { start: '', end: '' }
  });

  // Debounce Search Term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.status.length > 0) count++;
    if (activeFilters.payment_status.length > 0) count++;
    if (activeFilters.from_city && activeFilters.from_city !== 'all') count++;
    if (activeFilters.to_city && activeFilters.to_city !== 'all') count++;
    if (activeFilters.car_type.length > 0) count++;
    if (activeFilters.driver_id && activeFilters.driver_id !== 'all') count++;
    if (activeFilters.date_range.start || activeFilters.date_range.end) count++;
    return count;
  };

  const fetchFilteredBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('bookings').select('*').order('pickup_date', { ascending: false });

      // 1. Search (Server-side ILIKE)
      if (debouncedSearch) {
        // Note: Supabase OR syntax for search
        const searchQ = debouncedSearch.trim();
        // Check if it's a UUID (Booking ID)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchQ);
        
        if (isUUID) {
           query = query.eq('id', searchQ);
        } else {
           // Search by Reference ID, Name, Phone, Email
           query = query.or(`booking_ref_id.ilike.%${searchQ}%,name.ilike.%${searchQ}%,mobile_number.ilike.%${searchQ}%,from_city.ilike.%${searchQ}%`);
        }
      }

      // 2. Tab Filters (Quick Date/Status filters)
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      if (activeTab === 'today') {
        query = query.eq('pickup_date', today);
      } else if (activeTab === 'tomorrow') {
        query = query.eq('pickup_date', tomorrowStr);
      } else if (activeTab === 'week') {
         // Next 7 days
         const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
         query = query.gte('pickup_date', today).lte('pickup_date', nextWeek.toISOString().split('T')[0]);
      } else if (activeTab === 'preorder') {
         // Created date != Pickup Date (roughly) or specifically marked
         // Simple approximation: pickup_date > created_at date
         query = query.gt('pickup_date', today);
      }

      // 3. Advanced Filters
      if (activeFilters.status.length > 0) {
        query = query.in('status', activeFilters.status);
      }
      if (activeFilters.payment_status.length > 0) {
        query = query.in('payment_status', activeFilters.payment_status);
      }
      if (activeFilters.from_city && activeFilters.from_city !== 'all') {
        query = query.eq('from_city', activeFilters.from_city);
      }
      if (activeFilters.to_city && activeFilters.to_city !== 'all') {
        query = query.eq('to_city', activeFilters.to_city);
      }
      if (activeFilters.car_type.length > 0) {
        query = query.in('car_type', activeFilters.car_type);
      }
      if (activeFilters.driver_id && activeFilters.driver_id !== 'all') {
        query = query.eq('driver_id', activeFilters.driver_id);
      }
      if (activeFilters.date_range.start) {
        query = query.gte('pickup_date', activeFilters.date_range.start);
      }
      if (activeFilters.date_range.end) {
        query = query.lte('pickup_date', activeFilters.date_range.end);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      
      setBookings(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching filtered bookings:', err);
      setError(err);
      toast({
         variant: "destructive",
         title: "Error fetching bookings",
         description: err.message
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab, activeFilters, toast]);

  // Fetch when dependencies change
  useEffect(() => {
    fetchFilteredBookings();
  }, [fetchFilteredBookings]);

  const setFilter = (newFilters) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      status: [],
      payment_status: [],
      from_city: 'all',
      to_city: 'all',
      car_type: [],
      driver_id: 'all',
      date_range: { start: '', end: '' }
    });
    setSearchTerm('');
    setActiveTab('all');
  };

  return {
    bookings,
    loading,
    error,
    refreshBookings: fetchFilteredBookings,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Tabs
    activeTab,
    setActiveTab,
    
    // Advanced Filters
    activeFilters,
    setFilter,
    clearAllFilters,
    getActiveFilterCount
  };
}