import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useRouteManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error Fetching Routes', 
        description: error.message || 'Failed to fetch routes.' 
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRouteById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message || 'Failed to fetch route details.' 
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createRoute = useCallback(async (routeData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .insert([routeData])
        .select();

      if (error) throw error;
      
      toast({ 
        title: 'Success', 
        description: 'New route created successfully.',
        className: 'bg-green-600 text-white border-none'
      });
      return { success: true, data };
    } catch (error) {
      console.error('Error creating route:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to create route', 
        description: error.message 
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateRoute = useCallback(async (id, routeData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .update(routeData)
        .eq('id', id)
        .select();

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: 'Route updated successfully.',
        className: 'bg-green-600 text-white border-none'
      });
      return { success: true, data };
    } catch (error) {
      console.error('Error updating route:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to update route', 
        description: error.message 
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteRoute = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ 
        title: 'Deleted', 
        description: 'Route deleted successfully.',
        className: 'bg-amber-600 text-white border-none'
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Failed to delete route', 
        description: error.message 
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchRoutes,
    fetchRouteById,
    createRoute,
    updateRoute,
    deleteRoute
  };
};