import RouteDetailsPage from '@/screens/RouteDetailsPage';
import { getRouteBySlug, calculateStartingPrice, getRoutesByCity, getPopularRoutes } from '@/services/RouteService';
import { getRouteCityProfiles } from '@/services/CityContentService';
import { getApprovedFaqs } from '@/services/FaqService';

export default function Page(props) {
  return <RouteDetailsPage {...props} />;
}

// No paths are pre-built at deploy time (22,000+ routes would make builds
// impossibly slow). Every route generates on its first real visit
// (fallback: 'blocking'), then is served from cache until revalidation.
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  let route;
  try {
    route = await getRouteBySlug(slug);
  } catch (err) {
    console.error(`[getStaticProps] Unexpected error loading route "${slug}":`, err);
    throw err;
  }

  if (!route) {
    return { notFound: true, revalidate: 3600 };
  }

  const startingPrice = calculateStartingPrice(route);

  // FAQ rows are published data, so they are fetched on the server together
  // with the other route dependencies. A failure here must not turn a healthy
  // route into a 500; RouteDetailsPage keeps its deterministic legacy FAQ
  // fallback for routes that have not yet been generated in route_faqs.
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

  const relatedRoutes = relatedRoutesRaw.filter((r) => r.id !== route.id).slice(0, 6);
  const toCityRoutes = toCityRoutesRaw.filter((r) => r.id !== route.id).slice(0, 6);

  return {
    props: {
      route,
      startingPrice,
      relatedRoutes,
      toCityRoutes,
      popularRoutes,
      cityProfiles,
      approvedFaqs,
    },
    revalidate: 3600,
  };
}
