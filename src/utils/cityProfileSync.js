import { supabase } from '@/lib/customSupabaseClient';

const BATCH_SIZE = 100;

/**
 * Create one city profile for every distinct active route endpoint.
 * Existing profile content is never overwritten.
 */
export const syncCityProfilesForRoutes = async (routeRows = []) => {
  const unique = new Map();
  (routeRows || []).forEach((route) => {
    [route?.from_city, route?.to_city].forEach((raw) => {
      const name = String(raw || '').trim().replace(/\\s+/g, ' ');
      if (name) unique.set(name.toLowerCase(), name);
    });
  });
  const names = [...unique.values()];
  if (!names.length) return { created: 0, attempted: 0 };

  let created = 0;
  for (let offset = 0; offset < names.length; offset += BATCH_SIZE) {
    const batch = names.slice(offset, offset + BATCH_SIZE);
    const rows = batch.map((city_name) => ({
      city_name,
      slug: city_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      is_active: true
    }));
    const { data, error } = await supabase
      .from('city_profiles')
      .upsert(rows, { onConflict: 'city_name', ignoreDuplicates: true })
      .select('id');
    if (error) throw error;
    created += (data || []).length;
  }
  return { created, attempted: names.length };
};
