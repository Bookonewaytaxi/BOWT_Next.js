import { pruneEmpty } from './schemaUtils';
import { SITE_URL } from './organizationSchema';

/**
 * Builds a BreadcrumbList schema from the SAME `items` array the visible
 * <Breadcrumb /> component renders (passed in by the calling page) — this
 * guarantees the structured data always matches what the user sees, per
 * Google's guidance and the approved rule for this module.
 *
 * items shape: [{ label, href }, ...]
 */
export function buildBreadcrumbSchema(items, pageUrl) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const itemListElement = items
    .filter((item) => item && item.label)
    .map((item, index) =>
      pruneEmpty({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: item.href && item.href !== '#' ? `${SITE_URL}${item.href}` : undefined,
      })
    );

  if (itemListElement.length === 0) return null;

  return {
    '@type': 'BreadcrumbList',
    ...(pageUrl ? { '@id': `${pageUrl}/#breadcrumb` } : {}),
    itemListElement,
  };
}

export function getBreadcrumbReference(pageUrl) {
  return pageUrl ? { '@id': `${pageUrl}/#breadcrumb` } : undefined;
}
