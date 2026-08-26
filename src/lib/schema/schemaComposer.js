import { isValidSchema, stripContext } from './schemaUtils';
import { buildOrganizationSchema } from './organizationSchema';
import { buildWebsiteSchema } from './websiteSchema';
import { buildRouteServiceSchema } from './serviceSchema';
import { buildBreadcrumbSchema, getBreadcrumbReference } from './breadcrumbSchema';
import { buildWebPageSchema } from './webpageSchema';
import { buildFaqSchema } from './faqSchema';

/**
 * Composes the full JSON-LD graph for a single route page.
 * The FAQ data is passed explicitly so the structured data uses the exact
 * same FAQ objects that are rendered visibly on the page.
 */
export function composeRoutePageSchema({ route, breadcrumbItems, pageUrl, faqs = [] }) {
  if (!route || !pageUrl) return null;

  const organization = buildOrganizationSchema();
  const website = buildWebsiteSchema();
  const service = buildRouteServiceSchema(route);
  const breadcrumb = buildBreadcrumbSchema(breadcrumbItems, pageUrl);
  const webpage = buildWebPageSchema({
    url: pageUrl,
    name: service ? service.name : undefined,
    description: service ? service.description : undefined,
    breadcrumbRef: getBreadcrumbReference(pageUrl),
  });
  const faq = buildFaqSchema(faqs);

  const nodes = [organization, website, service, breadcrumb, webpage, faq]
    .filter(isValidSchema)
    .map(stripContext);

  if (nodes.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
