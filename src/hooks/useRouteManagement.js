import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const DEFAULT_PAGE_SIZE = 50;
const BULK_PAGE_SIZE = 1000;

const escapeSearch = (value = '') =>
  String(value).replace(/[\\%_,()]/g, '\\$&');

const buildRouteQuery = (query, { search = '', status = 'all' } = {}) => {
  let nextQuery = query;
  const normalizedSearch = String(search || '').trim().toLowerCase();

  if (normalizedSearch) {
    const term = escapeSearch(normalizedSearch);
    nextQuery = nextQuery.or(
      `from_city.ilike.%${term}%,to_city.ilike.%${term}%`
    );
  }

  if (status === 'active') {
    nextQuery = nextQuery.eq('is_active', true);
  } else if (status === 'inactive') {
    nextQuery = nextQuery.eq('is_active', false);
  }

  return nextQuery;
};

const fetchAllRoutesForBulk = async ({ search = '', status = 'all' } = {}) => {
  const rows = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from('routes')
      .select(
        'id, from_city, to_city, distance_km, sedan_price, route_price, seo_title, seo_description, seo_keywords, seo_content'
      )
      .order('created_at', { ascending: false })
      .range(from, from + BULK_PAGE_SIZE - 1);

    query = buildRouteQuery(query, { search, status });

    const { data, error } = await query;
    if (error) throw error;

    const page = data || [];
    rows.push(...page);

    if (page.length < BULK_PAGE_SIZE) break;
    from += BULK_PAGE_SIZE;
  }

  return rows;
};

export const useRouteManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRoutes = useCallback(
    async ({
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      search = '',
      status = 'all'
    } = {}) => {
      setLoading(true);

      try {
        const from = Math.max(0, (page - 1) * pageSize);
        const to = from + pageSize - 1;

        let query = supabase
          .from('routes')
          .select(
            'id, from_city, to_city, distance_km, sedan_price, ertiga_price, suv_ertiga_price, carens_price, kia_carens_price, innova_crysta_price, crysta_price, seo_title, is_active, slug',
            { count: 'exact' }
          )
          .order('created_at', { ascending: false })
          .range(from, to);

        query = buildRouteQuery(query, { search, status });

        const { data, error, count } = await query;
        if (error) throw error;

        return {
          success: true,
          data: data || [],
          totalCount: count || 0,
          page,
          pageSize
        };
      } catch (error) {
        console.error('Error fetching routes:', error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Routes',
          description: error.message || 'Failed to fetch routes.'
        });

        return {
          success: false,
          error,
          data: [],
          totalCount: 0,
          page,
          pageSize
        };
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchAllRoutes = useCallback(
    async (filters = {}) => {
      setLoading(true);

      try {
        const data = await fetchAllRoutesForBulk(filters);
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching all routes:', error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Routes',
          description: error.message || 'Failed to fetch routes.'
        });
        return { success: false, error, data: [] };
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const fetchRouteById = useCallback(
    async (id) => {
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
    },
    [toast]
  );

  const createRoute = useCallback(
    async (routeData) => {
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
    },
    [toast]
  );

  const updateRoute = useCallback(
    async (id, routeData) => {
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
    },
    [toast]
  );

  const deleteRoute = useCallback(
    async (id) => {
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
    },
    [toast]
  );

  return {
    loading,
    fetchRoutes,
    fetchAllRoutes,
    fetchRouteById,
    createRoute,
    updateRoute,
    deleteRoute
  };
};
