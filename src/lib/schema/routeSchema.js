/**
 * DEPRECATED — kept only so no existing import breaks ("never delete files").
 *
 * This file's logic has been superseded by the modular schema system:
 *   organizationSchema.js, websiteSchema.js, serviceSchema.js,
 *   breadcrumbSchema.js, webpageSchema.js, faqSchema.js, offerCatalogSchema.js,
 *   composed together by schemaComposer.js.
 *
 * RouteDetailsPage.jsx now imports { composeRoutePageSchema } from
 * './schemaComposer' directly and no longer uses this file.
 *
 * Safe to delete in a future cleanup commit once confirmed nothing else
 * references it (grep for "from '@/lib/schema/routeSchema'").
 */
export { composeRoutePageSchema as buildRoutePageSchemas } from './schemaComposer';
