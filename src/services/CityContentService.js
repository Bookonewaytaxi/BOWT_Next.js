import { supabase } from '@/lib/customSupabaseClient';

/**
 * Fetches a city profile by exact city name match against `routes.from_city`/
 * `to_city` spelling. Returns null (not an error, not fake data) if no
 * profile exists yet — the calling component must treat null as "omit
 * this section," never fabricate content in its place.
 *
 * One profile is shared across every route that references this city —
 * this function does not create or duplicate anything per-route.
 */
export async function getCityProfile(cityName) {
  if (!cityName) return null;

  try {
    const { data, error } = await supabase
      .from('city_profiles')
      .select('city_name, slug, state, description, image_url')
      .eq('city_name', cityName)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn('[CityContentService] Failed to load city profile:', error.message);
      return null;
    }

    return data || null;
  } catch (err) {
    console.warn('[CityContentService] Unexpected error loading city profile:', err);
    return null;
  }
}

/**
 * Fetches both pickup and destination city profiles in a single round of
 * parallel requests (still just 2 lightweight queries, not one-per-section,
 * and only fired once per page load alongside the existing route fetch).
 */
export async function getRouteCityProfiles(fromCity, toCity) {
  const [fromProfile, toProfile] = await Promise.all([
    getCityProfile(fromCity),
    getCityProfile(toCity),
  ]);
  return { fromProfile, toProfile };
}
