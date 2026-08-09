import RouteDetailsPage from '@/screens/RouteDetailsPage';
import { getRouteBySlug, calculateStartingPrice, getRoutesByCity, getPopularRoutes } from '@/services/RouteService';
import { getRouteCityProfiles } from '@/services/CityContentService';

export default function Page(props) {
  return <RouteDetailsPage {...props} />;
}

// No paths are pre-built at deploy time (22,000+ routes would make builds
// impossibly slow). Every route generates on its first real visit
// (fallback: 'blocking' — the visitor waits for server-rendered HTML,
// never sees a client-side loading spinner), then is served from cache
// for all subsequent requests until revalidation.
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  try {
    const route = await getRouteBySlug(slug);

    if (!route) {
      // Renders the existing custom 404 page (pages/404.jsx / NotFoundPage.jsx)
      // — reused as-is, not duplicated here.
      return { notFound: true, revalidate: 3600 };
    }

    const startingPrice = calculateStartingPrice(route);

    // Same non-blocking-in-spirit calls as before, just run in parallel
    // on the server instead of sequentially after client mount. Reuses
    // the exact same service functions, unchanged.
    const [relatedRoutesRaw, toCityRoutesRaw, popularRoutes, cityProfiles] = await Promise.all([
      route.from_city ? getRoutesByCity(route.from_city) : Promise.resolve([]),
      route.to_city ? getRoutesByCity(route.to_city) : Promise.resolve([]),
      getPopularRoutes(8, route.id),
      route.from_city && route.to_city
        ? getRouteCityProfiles(route.from_city, route.to_city)
        : Promise.resolve({ fromProfile: null, toProfile: null }),
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
      },
      // Background revalidation: next visit after 1 hour triggers a fresh
      // server-side regeneration; visitors in the meantime keep getting
      // the fast, cached version. Matches the roadmap's approved interval.
      revalidate: 3600,
    };
  } catch (err) {
    console.error(`[getStaticProps] Failed to load route "${slug}":`, err);
    // Transient DB/network error: treat as not-found for now, but retry
    // much sooner (60s) rather than waiting a full hour — self-heals
    // without ever fabricating route data.
    return { notFound: true, revalidate: 60 };
  }
}
