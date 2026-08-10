import { supabase } from '@/lib/customSupabaseClient';

/**
 * Fetch a single active route by its slug.
 * Selects ALL relevant columns including SEO content and pricing details.
 */
export const getRouteBySlug = async (slug) => {
  const t0 = performance.now();
  console.log(`[RouteService] 🚀 Fetching route for slug: '${slug}'`);
  
  if (!slug) {
    console.error('[RouteService] ❌ Slug is missing or undefined');
    throw new Error('Route slug is required');
  }

  try {
    // Select all specific columns requested to ensure data availability
    // Using explicit column names to avoid ambiguity
    const { data, error, status, statusText } = await supabase
      .from('routes')
      .select(`
        id,
        from_city,
        to_city,
        slug,
        is_active,
        distance_km,
        description,
        
        sedan_price,
        sedan_price_per_km,
        
        suv_ertiga_price,
        ertiga_price,
        suv_6_price_per_km,
        
        kia_carens_price,
        carens_price,
        suv_7_price_per_km,
        
        innova_crysta_price,
        crysta_price,
        crysta_price_per_km,
        
        seo_title,
        seo_description,
        seo_keywords,
        seo_content,
        seo_content_language,
        
        created_at
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(); // Use maybeSingle to avoid 406 error if multiple rows (though slug should be unique)

    const duration = Math.round(performance.now() - t0);

    if (error) {
      console.error(`[RouteService] ❌ Database error fetching route (${duration}ms):`, {
        message: error.message,
        code: error.code,
        status,
        statusText
      });
      throw new Error(`Failed to load route: ${error.message}`);
    }

    if (!data) {
      console.warn(`[RouteService] ⚠️ No active route found for slug: '${slug}' (${duration}ms)`);
      return null;
    }

    console.log(`[RouteService] ✅ Route fetched successfully (${duration}ms):`, {
      id: data.id,
      slug: data.slug,
      from: data.from_city,
      hasSeoContent: !!data.seo_content,
      seoContentLength: data.seo_content ? data.seo_content.length : 0,
      prices: {
        sedan: data.sedan_price,
        ertiga: data.suv_ertiga_price,
        carens: data.kia_carens_price,
        crysta: data.innova_crysta_price
      }
    });

    // Normalize pricing fields to standard keys for the UI
    // Prioritizing specific columns over generic ones
    const normalizedData = {
      ...data,
      suv_6_price: data.suv_ertiga_price || data.ertiga_price,
      suv_7_price: data.kia_carens_price || data.carens_price,
      premium_suv_price: data.innova_crysta_price || data.crysta_price,
      // Normalize per_km prices if needed
      sedan_per_km: data.sedan_price_per_km,
      suv_6_per_km: data.suv_6_price_per_km,
      suv_7_per_km: data.suv_7_price_per_km,
      premium_per_km: data.crysta_price_per_km
    };

    return normalizedData;

  } catch (err) {
    const duration = Math.round(performance.now() - t0);
    console.error(`[RouteService] 💥 Unexpected exception (${duration}ms):`, err);
    throw err;
  }
};

/**
 * Fetch all active routes starting from a specific city.
 */
export const getRoutesByCity = async (city) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('id, from_city, to_city, slug, sedan_price')
      .ilike('from_city', city)
      .eq('is_active', true)
      .order('to_city', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[RouteService] Error fetching related routes:', err);
    return [];
  }
};

/**
 * Calculate the starting price (lowest available).
 */
export const calculateStartingPrice = (route) => {
  if (!route) return 0;

  const prices = [
    route.sedan_price,
    route.suv_6_price,
    route.suv_7_price,
    route.premium_suv_price
  ];

  const validPrices = prices
    .map(p => Number(p))
    .filter(p => !isNaN(p) && p > 0);

  return validPrices.length > 0 ? Math.min(...validPrices) : 0;
};

/**
 * Returns a lightweight list of "popular" routes for internal-linking use.
 *
 * NOTE: this mirrors the exact same query already used inline in
 * src/components/home/PopularRoutesSection.jsx (active routes, ordered by
 * from_city, limited). There is no real popularity metric (booking count,
 * click-through, etc.) in the schema yet — "popular" here means the same
 * thing it already means on the live Home page today, not a new claim.
 * Flagging as a future cleanup: PopularRoutesSection.jsx should eventually
 * call this same function instead of its own inline query, so the logic
 * exists in exactly one place.
 */
export const getPopularRoutes = async (limit = 8, excludeRouteId = null) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('id, from_city, to_city, slug')
      .eq('is_active', true)
      .order('from_city', { ascending: true })
      .limit(limit + (excludeRouteId ? 1 : 0));

    if (error) throw error;
    return (data || []).filter((r) => r.id !== excludeRouteId).slice(0, limit);
  } catch (err) {
    console.error('[RouteService] Error fetching popular routes:', err);
    return [];
  }
};
