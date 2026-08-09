import { pruneEmpty } from './schemaUtils';

/**
 * SINGLE SOURCE OF TRUTH for business identity.
 * Every other schema module (Service, WebPage, Website, Route pages,
 * Home page) must import from here instead of re-declaring business data.
 *
 * NOTE ON aggregateRating: this mirrors the rating/review-count values that
 * already existed, hardcoded, in the previous HomePage.jsx implementation
 * (4.8 / 150). They are preserved here as-is per "existing behavior unchanged",
 * but they are NOT sourced from a real reviews table yet (Module F — Dynamic
 * Review Engine — hasn't been built). Flagging this for your review: once
 * Module F exists, this should be replaced with a real, computed value, or
 * removed entirely until then. Nothing here is newly fabricated by this
 * module — it is carried over from what was already live in production.
 */
export const ORGANIZATION_INFO = {
  siteUrl: 'https://bookonewaytaxi.in',
  name: 'One Way Taxi',
  logo: 'https://bookonewaytaxi.in/logo.jpg',
  telephone: '+91-7567575578',
  priceRange: '₹₹',
  foundingDate: '2016',
  address: {
    streetAddress:
      'Shop No 2, Book One Way Taxi, Opp Avsar Party Plot, Service Road, Behind Hansol Gam, Hansol',
    addressLocality: 'Sardarnagar, Ahmedabad',
    addressRegion: 'Gujarat',
    addressCountry: 'IN',
  },
  brandName: 'One Way Taxi',
  // No verified social profile links exist in the codebase (checked Footer.jsx) —
  // left empty rather than fabricated. Populate when real profiles are confirmed.
  sameAs: [],
  // Carried over from the pre-existing HomePage schema. See note above.
  existingAggregateRating: {
    ratingValue: '4.8',
    reviewCount: '150',
  },
};

export const SITE_URL = ORGANIZATION_INFO.siteUrl;

/**
 * Builds the full Organization schema node.
 * @param {Object} [options]
 * @param {boolean} [options.includeExistingRating] - include the pre-existing
 *   rating/review numbers noted above. Defaults to true to preserve current
 *   production behavior; set to false once Module F provides real data.
 */
export function buildOrganizationSchema({ includeExistingRating = true } = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORGANIZATION_INFO.name,
    url: SITE_URL,
    logo: ORGANIZATION_INFO.logo,
    image: ORGANIZATION_INFO.logo,
    telephone: ORGANIZATION_INFO.telephone,
    priceRange: ORGANIZATION_INFO.priceRange,
    foundingDate: ORGANIZATION_INFO.foundingDate,
    address: ORGANIZATION_INFO.address
      ? { '@type': 'PostalAddress', ...ORGANIZATION_INFO.address }
      : undefined,
    sameAs: ORGANIZATION_INFO.sameAs,
    brand: { '@type': 'Brand', name: ORGANIZATION_INFO.brandName },
    aggregateRating:
      includeExistingRating && ORGANIZATION_INFO.existingAggregateRating
        ? {
            '@type': 'AggregateRating',
            ratingValue: ORGANIZATION_INFO.existingAggregateRating.ratingValue,
            reviewCount: ORGANIZATION_INFO.existingAggregateRating.reviewCount,
          }
        : undefined,
  };

  return pruneEmpty(schema);
}

/**
 * Lightweight reference to the Organization node, for other schemas
 * (Service.provider, WebSite.publisher, etc.) to point at via @id instead
 * of re-embedding the full Organization block. Only works correctly when
 * combined into the same @graph as the full Organization node (handled by
 * schemaComposer.js).
 */
export function getOrganizationReference() {
  return { '@id': `${SITE_URL}/#organization` };
}

/**
 * Lightweight Brand reference — reuses the same brand name, never
 * re-hardcodes it.
 */
export function getBrandReference() {
  return { '@type': 'Brand', name: ORGANIZATION_INFO.brandName };
}
