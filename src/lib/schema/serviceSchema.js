import { pruneEmpty } from './schemaUtils';
import { SITE_URL, ORGANIZATION_INFO, getOrganizationReference, getBrandReference } from './organizationSchema';
import { buildOfferCatalogSchema } from './offerCatalogSchema';

/**
 * Builds the Schema.org Service node for a single route.
 *
 * IMPORTANT — data reality check (do not remove these guards):
 * The `routes` table currently does NOT have: hero_image, rating_value,
 * review_count, audience_type/route_intent_tags, from_state/to_state.
 * Each of those is supported below and will activate automatically the
 * moment that column exists and is populated — but nothing is fabricated
 * in the meantime. This is intentional per "never fabricate data."
 */
export function buildRouteServiceSchema(route) {
  if (!route || !route.from_city || !route.to_city) return null;

  const { from_city, to_city, slug, distance_km, seo_description } = route;

  // areaServed — City is always real (from_city/to_city always exist).
  // State is only added if the route object actually carries state fields
  // (not present in the schema today — future-proofed, not fabricated).
  const areaServed = [
    { '@type': 'City', name: from_city, ...(route.from_state ? { containedInPlace: { '@type': 'State', name: route.from_state } } : {}) },
    { '@type': 'City', name: to_city, ...(route.to_state ? { containedInPlace: { '@type': 'State', name: route.to_state } } : {}) },
  ];

  // Hero image — only if a real image field exists on the route row.
  // No `routes.image`/`hero_image` column exists yet, so this is currently
  // always omitted. Ready to activate once that column is added.
  const heroImage = route.hero_image || route.image || undefined;

  // Route-level rating — only if the route itself carries real rating data.
  // No such columns exist yet (Module F not built) — always omitted today.
  const aggregateRating =
    route.rating_value && route.review_count
      ? {
          '@type': 'AggregateRating',
          ratingValue: route.rating_value,
          reviewCount: route.review_count,
        }
      : undefined;

  // Audience — only if intent/audience data exists on the route
  // (Module M — Search Intent Engine — not built yet). Always omitted today.
  const audience =
    route.audience_type || (Array.isArray(route.route_intent_tags) && route.route_intent_tags.length > 0)
      ? {
          '@type': 'Audience',
          audienceType: route.audience_type || route.route_intent_tags.join(', '),
        }
      : undefined;

  const schema = {
    '@type': 'Service',
    serviceType: 'Taxi Service',
    name: `${from_city} to ${to_city} Taxi`,
    description:
      seo_description ||
      `One-way taxi service from ${from_city} to ${to_city}${distance_km ? ` (${distance_km} km)` : ''}.`,
    url: slug ? `${SITE_URL}/routes/${slug}` : undefined,
    image: heroImage,
    provider: getOrganizationReference(),
    brand: getBrandReference(),
    areaServed,
    audience,
    aggregateRating,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: slug ? `${SITE_URL}/routes/${slug}` : SITE_URL,
      servicePhone: ORGANIZATION_INFO.telephone,
      availableLanguage: ['en', 'hi'],
    },
    hasOfferCatalog: buildOfferCatalogSchema(route),
  };

  return pruneEmpty(schema);
}
