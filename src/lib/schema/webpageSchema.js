import { pruneEmpty } from './schemaUtils';
import { getWebsiteReference } from './websiteSchema';

/**
 * Builds a WebPage schema node for any page (route pages, city pages, etc).
 * References WebSite via @id instead of re-embedding it — single source
 * of truth respected.
 */
export function buildWebPageSchema({ url, name, description, breadcrumbRef } = {}) {
  if (!url || !name) return null;

  const schema = {
    '@type': 'WebPage',
    '@id': `${url}/#webpage`,
    url,
    name,
    description,
    isPartOf: getWebsiteReference(),
    breadcrumb: breadcrumbRef,
  };

  return pruneEmpty(schema);
}
