import CityTaxiLandingPage from '@/screens/CityTaxiLandingPage';
import { supabase } from '@/lib/customSupabaseClient';
import { slugify } from '@/lib/utils';

const PAGE_SIZE = 1000;
const SITE_URL = 'https://www.bookonewaytaxi.in';

async function findCityBySlug(citySlug) {
  for (let offset = 0; offset < 50000; offset += PAGE_SIZE) {
    const { data, error } = await supabase.from('routes').select('from_city,to_city').eq('is_active', true).range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    for (const row of data || []) {
      for (const name of [row.from_city, row.to_city]) if (name && slugify(name) === citySlug) return name;
    }
    if (!data || data.length < PAGE_SIZE) break;
  }
  return null;
}

async function fetchCityRoutes(column, cityName) {
  const rows = [];
  for (let offset = 0; offset < 20000; offset += PAGE_SIZE) {
    const { data, error } = await supabase.from('routes')
      .select('id,from_city,to_city,slug,distance_km,sedan_price,suv_ertiga_price,ertiga_price,kia_carens_price,carens_price,innova_crysta_price,crysta_price')
      .eq(column, cityName).eq('is_active', true).not('slug', 'is', null)
      .order(column === 'from_city' ? 'to_city' : 'from_city', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

export default function CityTaxiPage(props) { return <CityTaxiLandingPage {...props} />; }

export async function getStaticPaths() { return { paths: [], fallback: 'blocking' }; }

export async function getStaticProps({ params }) {
  const citySlug = String(params?.citySlug || '');
  if (!citySlug) return { notFound: true, revalidate: 300 };
  try {
    const cityName = await findCityBySlug(citySlug);
    if (!cityName) return { notFound: true, revalidate: 3600 };
    const [{ data: profile }, outgoingRoutes, incomingRoutes] = await Promise.all([
      supabase.from('city_profiles').select('city_name,state,description,image_url').eq('city_name', cityName).eq('is_active', true).maybeSingle(),
      fetchCityRoutes('from_city', cityName),
      fetchCityRoutes('to_city', cityName)
    ]);
    return { props: { cityName, citySlug, profile: profile || null, outgoingRoutes, incomingRoutes }, revalidate: 3600 };
  } catch (error) {
    console.error('[CityTaxiPage] Failed to build city landing page:', error);
    throw error;
  }
}
