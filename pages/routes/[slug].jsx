import RouteDetailsPage from '@/screens/RouteDetailsPage';
import CityTaxiLandingPage from '@/screens/CityTaxiLandingPage';
import { supabase } from '@/lib/customSupabaseClient';
import { slugify } from '@/lib/utils';
import { getRouteBySlug, calculateStartingPrice, getRoutesByCity, getPopularRoutes } from '@/services/RouteService';
import { getRouteCityProfiles } from '@/services/CityContentService';
import { getApprovedFaqs } from '@/services/FaqService';

const PAGE_SIZE = 1000;

export default function Page(props) {
  if (props.pageType === 'city') return <CityTaxiLandingPage {...props} />;
  return <RouteDetailsPage {...props} />;
}

async function findCityBySlug(citySlug) {
  // The canonical city list already exists in city_profiles (144 active rows).
  // Resolve by its stored slug first; this avoids scanning the entire routes
  // table on every first request and guarantees the profile's canonical name.
  const { data: profile, error: profileError } = await supabase
    .from('city_profiles')
    .select('city_name')
    .eq('slug', citySlug)
    .eq('is_active', true)
    .maybeSingle();

  if (profileError) throw profileError;
  if (profile?.city_name) return profile.city_name;

  // Backward-compatible fallback for any active route city not yet profiled.
  for (let offset = 0; offset < 50000; offset += PAGE_SIZE) {
    const { data, error } = await supabase.from('routes')
      .select('from_city,to_city')
      .eq('is_active', true)
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    for (const row of data || []) {
      for (const name of [row.from_city, row.to_city]) {
        if (name && slugify(name) === citySlug) return name;
      }
    }
    if (!data || data.length < PAGE_SIZE) break;
  }
  return null;
}

async function fetchCityRoutes(column, cityName) {
  const rows = [];
  for (let offset = 0; offset < 20000; offset += PAGE_SIZE) {
    const { data, error } = await supabase.from('routes')
      .select('id,from_city,to_city,slug,distance_km')
      .eq(column, cityName)
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order(column === 'from_city' ? 'to_city' : 'from_city', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

// One dynamic route file handles both existing route slugs and the new
// /routes/{city}-taxi-service URLs. Next.js does not support a bracket
// parameter followed by a literal suffix in a Pages Router filename.
export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const slug = String(params?.slug || '');
  const citySuffix = '-taxi-service';

  if (slug.endsWith(citySuffix)) {
    const citySlug = slug.slice(0, -citySuffix.length);
    try {
      const cityName = await findCityBySlug(citySlug);
      if (cityName) {
        const [{ data: profile, error: profileError }, outgoingRoutes, incomingRoutes, { data: seo, error: seoError }] = await Promise.all([
          supabase.from('city_profiles')
            .select('city_name,state,description,image_url,page_content')
            .eq('city_name', cityName)
            .eq('is_active', true)
            .maybeSingle(),
          fetchCityRoutes('from_city', cityName),
          fetchCityRoutes('to_city', cityName),
          supabase.from('seo_metadata').select('meta_title,meta_description,keywords,og_image_url').eq('page_type', 'city').eq('slug', citySlug).maybeSingle(),
        ]);
        if (profileError) console.error('[CityTaxiPage] City profile fetch failed:', profileError);
        if (seoError) console.error('[CityTaxiPage] City SEO metadata fetch failed:', seoError);
        return {
          props: {
            pageType: 'city',
            cityName,
            citySlug,
            profile: profile || null,
            seo: seo || null,
            outgoingRoutes,
            incomingRoutes,
          },
          revalidate: 3600,
        };
      }
    } catch (error) {
      console.error('[CityTaxiPage] Failed to build city landing page:', error);
      throw error;
    }
    return { notFound: true, revalidate: 3600 };
  }

  let route;
  try {
    route = await getRouteBySlug(slug);
  } catch (err) {
    console.error(`[getStaticProps] Unexpected error loading route "${slug}":`, err);
    throw err;
  }

  if (!route) return { notFound: true, revalidate: 3600 };

  const startingPrice = calculateStartingPrice(route);
  const [relatedRoutesRaw, toCityRoutesRaw, popularRoutes, cityProfiles, approvedFaqs] = await Promise.all([
    route.from_city ? getRoutesByCity(route.from_city) : Promise.resolve([]),
    route.to_city ? getRoutesByCity(route.to_city) : Promise.resolve([]),
    getPopularRoutes(8, route.id),
    route.from_city && route.to_city
      ? getRouteCityProfiles(route.from_city, route.to_city)
      : Promise.resolve({ fromProfile: null, toProfile: null }),
    getApprovedFaqs(route.id).catch((error) => {
      console.error(`[getStaticProps] FAQ fetch failed for route "${slug}":`, error);
      return [];
    }),
  ]);

  return {
    props: {
      pageType: 'route',
      route,
      startingPrice,
      relatedRoutes: relatedRoutesRaw.filter((r) => r.id !== route.id).slice(0, 6),
      toCityRoutes: toCityRoutesRaw.filter((r) => r.id !== route.id).slice(0, 6),
      popularRoutes,
      cityProfiles,
      approvedFaqs,
    },
    revalidate: 3600,
  };
}
