import { pruneEmpty } from './schemaUtils';
import { SITE_URL, ORGANIZATION_INFO, getOrganizationReference } from './organizationSchema';

/**
 * Builds the WebSite schema node.
 * References Organization via @id (getOrganizationReference) instead of
 * re-embedding Organization's data — single source of truth respected.
 */
export function buildWebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: ORGANIZATION_INFO.name,
    url: SITE_URL,
    publisher: getOrganizationReference(),
  };

  return pruneEmpty(schema);
}

export function getWebsiteReference() {
  return { '@id': `${SITE_URL}/#website` };
}
