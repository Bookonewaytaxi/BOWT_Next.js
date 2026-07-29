import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export function useVehicleTypes() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchVehicles() {
      try {
        setLoading(true);
        // Direct fetch, no caching
        const { data, error } = await supabase
          .from('vehicle_types')
          .select('*')
          .eq('is_active', true)
          .order('price_per_km', { ascending: true });

        if (error) throw error;
        
        if (mounted) {
          setVehicleTypes(data || []);
        }
      } catch (err) {
        console.error('Error fetching vehicle types:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchVehicles();

    return () => {
      mounted = false;
    };
  }, []);

  return { vehicleTypes, loading, error };
}