import CityRoutesPage from '@/screens/CityRoutesPage';
import { supabase } from '@/lib/customSupabaseClient';
import { slugify } from '@/lib/utils';

const PAGE_SIZE = 1000;

async function fetchCityRoutes(column, cityName) {
  const rows = [];
  for (let offset = 0; offset < 10000; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('routes')
      .select('id, from_city, to_city, slug')
      .eq(column, cityName)
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('to_city', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

export default function Page(props) {
  return <CityRoutesPage {...props} />;
}

export async function getStaticPaths() {
  // City paths are generated on first request, not during every deployment.
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const citySlug = String(params?.citySlug || '');
  if (!citySlug) return { notFound: true, revalidate: 300 };
  try {
    const { data: candidates, error } = await supabase
      .from('routes')
      .select('from_city, to_city')
      .eq('is_active', true)
      .or(`from_city.ilike.${citySlug.replace(/-/g, ' ')},to_city.ilike.${citySlug.replace(/-/g, ' ')}`)
      .limit(1);
    if (error) throw error;

    let cityName = candidates?.[0]?.from_city;
    if (!cityName || slugify(cityName) !== citySlug) {
      const { data: cities, error: cityError } = await supabase
        .from('routes')
        .select('from_city, to_city')
        .eq('is_active', true)
        .limit(1000);
      if (cityError) throw cityError;
      const match = (cities || []).flatMap((row) => [row.from_city, row.to_city]).find((name) => slugify(name) === citySlug);
      cityName = match || null;
    }
    if (!cityName) {
      const { data: rows, error: rowsError } = await supabase.from('routes').select('from_city,to_city').eq('is_active', true).limit(10000);
      if (rowsError) throw rowsError;
      cityName = (rows || []).flatMap((row) => [row.from_city, row.to_city]).find((name) => slugify(name) === citySlug) || null;
    }
    if (!cityName) return { notFound: true, revalidate: 3600 };

    const [outgoingRoutes, incomingRoutes] = await Promise.all([
      fetchCityRoutes('from_city', cityName),
      fetchCityRoutes('to_city', cityName)
    ]);
    return {
      props: { cityName, citySlug, outgoingRoutes, incomingRoutes },
      revalidate: 3600
    };
  } catch (error) {
    console.error('[CityRoutesPage] Static data fetch failed:', error);
    return { notFound: true, revalidate: 300 };
  }
}
