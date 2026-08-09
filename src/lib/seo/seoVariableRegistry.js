/**
 * Central Variable Registry — Meta Engine
 *
 * This is the ONLY place valid template placeholders are defined.
 * Admin UI validation and live-preview sample data both read from here —
 * never duplicated as a separate hardcoded list anywhere else.
 *
 * Matches exactly the real arguments seoGeneratorService.js's functions
 * already receive — no speculative/unused variables added.
 */
export const SEO_VARIABLES = [
  { key: 'from_city', label: 'Pickup City', example: 'Ahmedabad' },
  { key: 'to_city', label: 'Destination City', example: 'Surat' },
  { key: 'distance_km', label: 'Distance (km)', example: '270' },
  { key: 'price', label: 'Starting Price (₹)', example: '3500' },
];

export const SEO_VARIABLE_KEYS = SEO_VARIABLES.map((v) => v.key);

/** Sample values for a real, existing route — used when the admin hasn't picked a specific route to preview against. */
export const SAMPLE_ROUTE_FOR_PREVIEW = SEO_VARIABLES.reduce((acc, v) => {
  acc[v.key] = v.example;
  return acc;
}, {});
