import { isValidSchema, stripContext } from './schemaUtils';
import { buildOrganizationSchema } from './organizationSchema';
import { buildWebsiteSchema } from './websiteSchema';
import { buildRouteServiceSchema } from './serviceSchema';
import { buildBreadcrumbSchema, getBreadcrumbReference } from './breadcrumbSchema';
import { buildWebPageSchema } from './webpageSchema';
import { buildFaqSchema } from './faqSchema';

/**
 * Composes the full JSON-LD graph for a single route page.
 *
 * - Combines Organization + Website + Service + Breadcrumb + WebPage + FAQ
 *   into ONE @graph array under a single shared @context (not 6 separate
 *   <script> tags each repeating "@context": "https://schema.org").
 * - Organization/Website are referenced by @id from Service/WebPage instead
 *   of being re-embedded — their data exists in exactly one place in code
 *   (organizationSchema.js / websiteSchema.js) AND appears exactly once in
 *   the rendered graph.
 * - Any module that returns null (missing required data) is silently
 *   dropped — never rendered as an empty/broken node.
 * - This function is driven entirely by the `route` object + the page's
 *   own breadcrumb items + its canonical URL — nothing else. It will work
 *   identically for any of the 22,000+ routes with zero manual setup.
 */
export function composeRoutePageSchema({ route, breadcrumbItems, pageUrl }) {
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
  // route.custom_faqs does not exist as a DB column yet (Module E not built).
  // Passing undefined here safely returns null from buildFaqSchema — no
  // fabricated FAQ content is ever generated.
  const faq = buildFaqSchema(route.custom_faqs);

  const nodes = [organization, website, service, breadcrumb, webpage, faq]
    .filter(isValidSchema)
    .map(stripContext);

  if (nodes.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
