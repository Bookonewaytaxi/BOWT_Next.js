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
const STORAGE_KEY = 'bowt_city_autocomplete_cache_v1';

const readPersistentCache = () => {
  if (typeof window === 'undefined') return;
  if (cachedCities && cachedRoutes) return;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed?.cities) && Array.isArray(parsed?.routes)) {
      cachedCities = parsed.cities;
      cachedRoutes = parsed.routes;
    }
  } catch {
    // Ignore stale, blocked, or malformed browser cache.
  }
};

const normalizeCity = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');

const fetchAllActiveRoutes = async () => {
  const allRoutes = [];
  const BATCH_SIZE = 8;
  let offset = 0;

  // Fetch route pages concurrently in small batches instead of waiting for
  // every 1,000-row request to finish sequentially.
  while (true) {
    const requests = Array.from({ length: BATCH_SIZE }, (_, index) => {
      const from = offset + index * PAGE_SIZE;
      return supabase
        .from('routes')
        .select('from_city, to_city')
        .eq('is_active', true)
        .range(from, from + PAGE_SIZE - 1);
    });

    const results = await Promise.all(requests);
    let reachedEnd = false;

    for (let index = 0; index < results.length; index += 1) {
      const { data, error } = results[index];
      if (error) throw error;
      const page = data || [];
      allRoutes.push(...page);
      if (page.length < PAGE_SIZE) {
        reachedEnd = true;
        break;
      }
    }

    if (reachedEnd) break;
    offset += BATCH_SIZE * PAGE_SIZE;
  }

  return allRoutes;
};

export function useSmartCityAutocomplete() {
  readPersistentCache();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState(cachedRoutes || []);
  const [allCities, setAllCities] = useState(cachedCities || []);

  // Do not download thousands of route rows during the initial homepage load.
  // Fetch city data only when a visitor actually starts using autocomplete.
  const loadCities = useCallback(async () => {
    if (cachedCities && cachedRoutes) {
      setRoutes(cachedRoutes);
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
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          routes: cachedRoutes,
          cities: cachedCities
        }));
      } catch {
        // Storage may be full or disabled; in-memory caching still works.
      }
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
