import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

// Supabase/PostgREST commonly limits an unbounded select to the first 1,000
// rows. Route data can be much larger than that, so autocomplete must page
// through the complete active route set instead of silently missing cities.
const PAGE_SIZE = 1000;

// Module-level cache prevents duplicate downloads when both pickup/drop fields
// mount at the same time.
let cachedRoutes = null;
let cachedCities = null;
let fetchPromise = null;

const normalizeCity = (value) => String(value ?? '').trim().replace(/\\s+/g, ' ');

const fetchAllActiveRoutes = async () => {
  const allRoutes = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('routes')
      .select('from_city, to_city')
      .eq('is_active', true)
      .range(from, to);

    if (error) throw error;

    const page = data || [];
    allRoutes.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRoutes;
};

export function useSmartCityAutocomplete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState(cachedRoutes || []);
  const [allCities, setAllCities] = useState(cachedCities || []);

  // Do not download thousands of route rows during the initial homepage load.
  // Fetch city data only when a visitor actually starts using autocomplete.
  const loadCities = useCallback(async () => {
    if (cachedCities) {
      setRoutes(cachedRoutes || []);
      setAllCities(cachedCities);
      return cachedCities;
    }

    if (!fetchPromise) {
      fetchPromise = fetchAllActiveRoutes();
    }

    setLoading(true);
    try {
      const data = await fetchPromise;
      const uniqueCities = new Set();

      data.forEach((route) => {
        const fromCity = normalizeCity(route.from_city);
        const toCity = normalizeCity(route.to_city);
        if (fromCity) uniqueCities.add(fromCity);
        if (toCity) uniqueCities.add(toCity);
      });

      cachedRoutes = data;
      cachedCities = Array.from(uniqueCities).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
      );
      setRoutes(cachedRoutes);
      setAllCities(cachedCities);
      setError(null);
      return cachedCities;
    } catch (err) {
      // Clear the shared promise so a later interaction can retry.
      fetchPromise = null;
      setError(err);
      console.error('[SmartCityAutocomplete] Error fetching route cities:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getMatchingCities = useCallback((input, excludeCity, citiesSource = allCities) => {
    const query = normalizeCity(input);
    if (query.length < 3 || !citiesSource.length) return [];

    const lowerInput = query.toLocaleLowerCase();
    const lowerExclude = excludeCity
      ? normalizeCity(excludeCity).toLocaleLowerCase()
      : null;

    return citiesSource
      .filter((city) => {
        const normalizedCity = normalizeCity(city);
        if (!normalizedCity) return false;
        if (lowerExclude && normalizedCity.toLocaleLowerCase() === lowerExclude) return false;
        return normalizedCity.toLocaleLowerCase().includes(lowerInput);
      })
      .slice(0, 8);
  }, [allCities]);

  const getDropCitiesForPickup = useCallback((pickupCity) => {
    const normalizedPickup = normalizeCity(pickupCity);
    if (!normalizedPickup) return [];

    const lowerPickup = normalizedPickup.toLocaleLowerCase();
    const destinations = new Map();

    routes.forEach((route) => {
      const fromCity = normalizeCity(route.from_city);
      const toCity = normalizeCity(route.to_city);
      if (
        fromCity.toLocaleLowerCase() === lowerPickup &&
        toCity &&
        toCity.toLocaleLowerCase() !== lowerPickup
      ) {
        destinations.set(toCity.toLocaleLowerCase(), toCity);
      }
    });

    return Array.from(destinations.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, [routes]);

  return {
    allCities,
    loading,
    error,
    loadCities,
    getMatchingCities,
    getDropCitiesForPickup
  };
}
