import { supabase } from '@/lib/customSupabaseClient';
import { getRoutesByCity, getPopularRoutes } from './RouteService';

const ROUTE_LIST_FIELDS = 'id, from_city, to_city, slug, sedan_price, distance_km, created_at';

/**
 * LinkService — one function per real, buildable-today link category.
 * Every function returns [] (never throws to the caller) on empty/error,
 * so the Internal Linking feature works correctly even with zero rows
 * anywhere, per the "must work with zero DB rows" requirement.
 */

/** Category: Reverse Route (Ahmedabad→Surat's reverse is Surat→Ahmedabad) */
export const getReverseRoute = async (route) => {
  if (!route?.from_city || !route?.to_city) return [];
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(ROUTE_LIST_FIELDS)
      .ilike('from_city', route.to_city)
      .ilike('to_city', route.from_city)
      .eq('is_active', true)
      .neq('id', route.id)
      .limit(1);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[LinkService] getReverseRoute failed:', err);
    return [];
  }
};

/** Category: Same Pickup City — REUSES getRoutesByCity(from_city), not re-queried */
export const getSamePickupCityRoutes = async (route, limit = 6) => {
  if (!route?.from_city) return [];
  const results = await getRoutesByCity(route.from_city);
  return results.filter((r) => r.id !== route.id).slice(0, limit);
};

/** Category: Same Destination City — new query (from_city varies, to_city fixed) */
export const getSameDestinationCityRoutes = async (route, limit = 6) => {
  if (!route?.to_city) return [];
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(ROUTE_LIST_FIELDS)
      .ilike('to_city', route.to_city)
      .eq('is_active', true)
      .neq('id', route.id)
      .order('from_city', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[LinkService] getSameDestinationCityRoutes failed:', err);
    return [];
  }
};

/** Category: Cheapest Routes (platform-wide, excluding current) */
export const getCheapestRoutes = async (excludeRouteId, limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(ROUTE_LIST_FIELDS)
      .eq('is_active', true)
      .not('sedan_price', 'is', null)
      .gt('sedan_price', 0)
      .neq('id', excludeRouteId || '')
      .order('sedan_price', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[LinkService] getCheapestRoutes failed:', err);
    return [];
  }
};

/** Category: Premium Routes (highest sedan_price as a simple, real proxy — no separate "premium" flag exists) */
export const getPremiumRoutes = async (excludeRouteId, limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(ROUTE_LIST_FIELDS)
      .eq('is_active', true)
      .not('sedan_price', 'is', null)
      .neq('id', excludeRouteId || '')
      .order('sedan_price', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[LinkService] getPremiumRoutes failed:', err);
    return [];
  }
};

/** Category: Long Distance Routes */
export const getLongDistanceRoutes = async (excludeRouteId, limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(ROUTE_LIST_FIELDS)
      .eq('is_active', true)
      .not('distance_km', 'is', null)
      .neq('id', excludeRouteId || '')
      .order('distance_km', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[LinkService] getLongDistanceRoutes failed:', err);
    return [];
  }
};

/** Category: Short Distance Routes */
export const getShortDistanceRoutes = async (excludeRouteId, limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(ROUTE_LIST_FIELDS)
      .eq('is_active', true)
      .not('distance_km', 'is', null)
      .gt('distance_km', 0)
      .neq('id', excludeRouteId || '')
      .order('distance_km', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[LinkService] getShortDistanceRoutes failed:', err);
    return [];
  }
};

/** Category: Recently Added Routes */
export const getRecentlyAddedRoutes = async (excludeRouteId, limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select(ROUTE_LIST_FIELDS)
      .eq('is_active', true)
      .neq('id', excludeRouteId || '')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[LinkService] getRecentlyAddedRoutes failed:', err);
    return [];
  }
};

/** Category: Popular Routes — REUSES getPopularRoutes(), not re-queried */
export const getPopularRoutesForLinking = async (excludeRouteId, limit = 6) => {
  return getPopularRoutes(limit, excludeRouteId);
};

/** Persists a computed link set (used by the Health Checker / cache refresh, Step 8) */
export const saveInternalLinks = async (sourceRouteId, links) => {
  if (!links || links.length === 0) return { success: true, count: 0 };
  try {
    const rows = links.map((l) => ({
      source_route_id: sourceRouteId,
      target_route_id: l.id,
      category: l.category,
      anchor_text: l.anchorText,
      priority_score: l.score,
    }));
    const { error } = await supabase
      .from('internal_links')
      .upsert(rows, { onConflict: 'source_route_id,target_route_id,category' });
    if (error) throw error;
    return { success: true, count: rows.length };
  } catch (err) {
    console.warn('[LinkService] saveInternalLinks failed:', err);
    return { success: false, error: err.message };
  }
};
