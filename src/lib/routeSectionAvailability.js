/**
 * Determines which route-page sections have real data to show, in display
 * order. This is the ONE place that decision is made — both
 * <TableOfContents /> and <RouteDetailsPage /> render loop consume this
 * same array, so the ToC can never list a section that doesn't actually
 * render, or vice versa.
 *
 * Each entry's `available` is a plain boolean derived from real data only —
 * no fabrication, no hardcoded true for content that doesn't exist yet.
 */
export function getRouteSectionAvailability({
  route,
  fromCityProfile,
  toCityProfile,
  relatedRoutes,
  faqs,
  approvedReviews,
}) {
  const hasVehiclePricing = Boolean(
    route?.sedan_price || route?.suv_6_price || route?.suv_7_price || route?.premium_suv_price
  );

  return [
    { id: 'hero', label: 'Overview', available: Boolean(route) },
    { id: 'vehicle-pricing', label: 'Vehicle Pricing', available: hasVehiclePricing },
    { id: 'route-highlights', label: 'Route Highlights', available: Boolean(route?.travel_highlights?.length) },
    {
      id: 'city-info',
      label: 'About the Cities',
      available: Boolean(fromCityProfile?.description || toCityProfile?.description),
    },
    { id: 'route-info', label: 'Route Information', available: Boolean(route?.distance_km) },
    { id: 'why-choose-us', label: 'Why Choose Us', available: Boolean(route) },
    { id: 'cab-features', label: 'Cab Features', available: Boolean(route?.cab_features?.length) },
    { id: 'safety-features', label: 'Safety Features', available: Boolean(route?.safety_features?.length) },
    { id: 'pickup-locations', label: 'Popular Pickup Locations', available: Boolean(route?.pickup_areas?.length) },
    { id: 'drop-locations', label: 'Popular Drop Locations', available: Boolean(route?.drop_areas?.length) },
    { id: 'related-routes', label: 'Related Routes', available: Boolean(relatedRoutes?.length) },
    { id: 'faq', label: 'FAQs', available: Boolean(faqs?.length) },
    { id: 'reviews', label: 'Customer Reviews', available: Boolean(approvedReviews?.length) },
    { id: 'travel-guide', label: 'Complete Travel Guide', available: Boolean(route?.seo_content) },
    { id: 'internal-link-hub', label: 'Explore More', available: Boolean(route) },
  ];
}
