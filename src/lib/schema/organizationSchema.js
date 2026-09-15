import { pruneEmpty } from './schemaUtils';

/**
 * SINGLE SOURCE OF TRUTH for business identity.
 * Schema data is kept factual and reusable across Organization, Service,
 * WebSite and route-page structured data.
 */
export const ORGANIZATION_INFO = {
  siteUrl: 'https://bookonewaytaxi.in',
  name: 'Book One Way Taxi',
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
  brandName: 'Book One Way Taxi',
  // Only verified profiles should be added here. Keep empty until confirmed.
  sameAs: [],
};

export const SITE_URL = ORGANIZATION_INFO.siteUrl;

export function buildOrganizationSchema() {
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
  };

  return pruneEmpty(schema);
}

export function getOrganizationReference() {
  return { '@id': `${SITE_URL}/#organization` };
}

export function getBrandReference() {
  return { '@type': 'Brand', name: ORGANIZATION_INFO.brandName };
}
