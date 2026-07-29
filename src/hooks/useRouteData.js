import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export function useRouteData(slug) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchRoute() {
      try {
        setLoading(true);
        // Direct fetch, no caching
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        if (mounted) {
          setRoute(data);
        }
      } catch (err) {
        console.error('Error fetching route:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchRoute();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { route, loading, error };
}