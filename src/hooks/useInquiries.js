import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export function useInquiries() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInquiries = useCallback(async (page = 1, limit = 20, filters = {}) => {
    console.log('Fetching inquiries started:', { page, limit, filters });
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('inquiries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search_mobile && filters.search_mobile.trim() !== '') {
        query = query.ilike('customer_mobile', `%${filters.search_mobile}%`);
      }
      
      if (filters.pickup_city && filters.pickup_city !== 'all') {
        query = query.ilike('pickup_city', `%${filters.pickup_city}%`);
      }

      if (filters.date_from) {
        query = query.gte('created_at', new Date(filters.date_from).toISOString());
      }

      if (filters.date_to) {
        const endDate = new Date(filters.date_to);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error: supabaseError } = await query;

      if (supabaseError) {
        console.error('Supabase Error fetching inquiries:', supabaseError);
        throw supabaseError;
      }

      console.log('Inquiries fetched successfully:', { count, dataLength: data?.length });
      
      return { 
        data: data || [], 
        total: count || 0, 
        page, 
        limit 
      };

    } catch (err) {
      console.error('Error in fetchInquiries:', err);
      setError(err.message || 'Failed to fetch inquiries');
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: err.message || "Could not load inquiries. Please try again."
      });
      return { data: [], total: 0, page, limit };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchInquiryDetail = useCallback(async (id) => {
    console.log('Fetching inquiry detail:', id);
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (supabaseError) throw supabaseError;
      return data;
    } catch (err) {
      console.error('Error fetching inquiry detail:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load inquiry details."
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateInquiryStatus = useCallback(async (id, status) => {
    console.log('Updating inquiry status:', { id, status });
    setLoading(true);
    try {
      const { error: supabaseError } = await supabase
        .from('inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      toast({ 
        title: "Status Updated", 
        description: `Inquiry marked as ${status.replace('_', ' ')}`,
        className: "bg-green-600 text-white border-none"
      });
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateInquiryNotes = useCallback(async (id, notes) => {
    console.log('Updating inquiry notes:', id);
    try {
      const { error: supabaseError } = await supabase
        .from('inquiries')
        .update({ admin_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      toast({ 
        title: "Notes Saved", 
        description: "Admin notes updated successfully",
        className: "bg-green-600 text-white border-none"
      });
      return true;
    } catch (err) {
      console.error('Error updating notes:', err);
      toast({ variant: "destructive", title: "Save Failed", description: err.message });
      return false;
    }
  }, [toast]);

  // Task 4: Add validation to ensure 'name' field is always provided
  const submitInquiry = useCallback(async (formData) => {
    setLoading(true);
    try {
      // Map fields to ensure NOT NULL constraints are met
      const payload = {
        ...formData,
        name: formData.name || formData.customer_name,
        phone: formData.phone || formData.customer_mobile,
        email: formData.email || '-', // Default for NOT NULL
        message: formData.message || 'Inquiry', // Default for NOT NULL
        status: formData.status || 'new_inquiry'
      };

      if (!payload.name) {
        throw new Error("Name is required for inquiry submission");
      }

      const { data, error: supabaseError } = await supabase
        .from('inquiries')
        .insert([payload])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      return { success: true, data };
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      toast({ 
        variant: "destructive", 
        title: "Submission Failed", 
        description: err.message 
      });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchPickupCities = useCallback(async () => {
    try {
      // Note: In a real production app with millions of rows, 
      // this should be a separate table or a materialized view.
      // For now, fetching distinct pickup_cities is acceptable for smaller datasets.
      const { data, error: supabaseError } = await supabase
        .from('inquiries')
        .select('pickup_city');
      
      if (supabaseError) throw supabaseError;

      // Client-side aggregation
      const cityCounts = {};
      data.forEach(item => {
        const city = item.pickup_city;
        if (city && city.trim()) {
          const formattedCity = city.trim(); // Normalize
          cityCounts[formattedCity] = (cityCounts[formattedCity] || 0) + 1;
        }
      });

      const result = Object.entries(cityCounts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count); // Sort by most frequent

      return result;
    } catch (err) {
      console.error('Error fetching pickup cities:', err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    fetchInquiries,
    fetchInquiryDetail,
    updateInquiryStatus,
    updateInquiryNotes,
    submitInquiry,
    fetchPickupCities
  };
}