import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

// Module-level cache to prevent redundant fetches
let cachedRoutes = null;
let cachedCities = null;
let fetchPromise = null;

export function useSmartCityAutocomplete() {
  const [loading, setLoading] = useState(!cachedCities);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState(cachedRoutes || []);
  const [allCities, setAllCities] = useState(cachedCities || []);

  useEffect(() => {
    // If data is already cached, just ensure state is up to date
    if (cachedCities) {
      setLoading(false);
      return;
    }

    // If a fetch is already in progress, await it
    if (!fetchPromise) {
      // Querying 'routes' table which is correct. No 'inquiry_id' reference here.
      fetchPromise = supabase
        .from('routes')
        .select('from_city, to_city');
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchPromise;
        if (error) throw error;

        const uniqueCities = new Set();
        data.forEach(route => {
          if (route.from_city) uniqueCities.add(route.from_city);
          if (route.to_city) uniqueCities.add(route.to_city);
        });

        cachedRoutes = data;
        cachedCities = Array.from(uniqueCities).sort();
        
        setRoutes(cachedRoutes);
        setAllCities(cachedCities);
      } catch (err) {
        setError(err);
        console.error('Error fetching cities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMatchingCities = useCallback((input, excludeCity) => {
    if (!input || input.length < 3) return [];
    
    const lowerInput = input.toLowerCase();
    const lowerExclude = excludeCity ? excludeCity.toLowerCase() : null;

    const matches = allCities.filter(city => {
      // Exclude specific city if provided
      if (lowerExclude && city.toLowerCase() === lowerExclude) return false;
      
      // Check for match
      return city.toLowerCase().includes(lowerInput);
    });

    return matches.slice(0, 8);
  }, [allCities]);

  const getDropCitiesForPickup = useCallback((pickupCity) => {
    if (!pickupCity) return [];
    
    const destinations = new Set();
    routes.forEach(route => {
      if (route.from_city === pickupCity && route.to_city) {
        destinations.add(route.to_city);
      }
    });
    
    return Array.from(destinations).sort();
  }, [routes]);

  return {
    allCities,
    loading,
    error,
    getMatchingCities,
    getDropCitiesForPickup
  };
}