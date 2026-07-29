import { supabase } from '@/lib/customSupabaseClient';

/**
 * Diagnostic utility to analyze the routes table health.
 * Performs comprehensive checks on data integrity, duplicates, and missing critical content.
 */
export const runRouteDiagnostics = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_routes: 0,
      ahmedabad_routes: 0,
      vadodara_routes: 0,
      duplicate_slugs_count: 0,
      malformed_data_count: 0
    },
    integrity_issues: [],
    duplicate_slugs: [],
    routes: [] // Will contain lightweight version of routes for the table
  };

  try {
    // 1. Fetch all routes
    // We select specific fields to keep payload manageable if there are thousands of routes
    const { data: allRoutes, error } = await supabase
      .from('routes')
      .select('id, from_city, to_city, slug, created_at, sedan_price, suv_price, crysta_price');

    if (error) throw error;

    report.summary.total_routes = allRoutes.length;
    report.routes = allRoutes;

    // 2. Analysis Loop
    const slugMap = new Map();
    const processedRoutes = [];

    allRoutes.forEach(route => {
      // Normalize data for checking
      const fromCity = (route.from_city || '').trim().toLowerCase();
      const toCity = (route.to_city || '').trim().toLowerCase();
      const slug = (route.slug || '').trim().toLowerCase();

      // Check 1: Critical Missing Fields
      if (!fromCity || !toCity || !slug) {
        report.integrity_issues.push({
          id: route.id,
          type: 'MISSING_FIELDS',
          details: `Missing critical data: ${!fromCity ? 'from_city ' : ''}${!toCity ? 'to_city ' : ''}${!slug ? 'slug' : ''}`
        });
        report.summary.malformed_data_count++;
      }

      // Check 2: Slug Duplication
      if (slugMap.has(slug)) {
        const existingId = slugMap.get(slug);
        report.duplicate_slugs.push({
          slug: slug,
          ids: [existingId, route.id],
          route_1: allRoutes.find(r => r.id === existingId)?.from_city + ' -> ' + allRoutes.find(r => r.id === existingId)?.to_city,
          route_2: route.from_city + ' -> ' + route.to_city
        });
        report.summary.duplicate_slugs_count++;
      } else {
        slugMap.set(slug, route.id);
      }

      // Check 3: Pricing Data Integrity (Warning only)
      if (!route.sedan_price && !route.suv_price && !route.crysta_price) {
        report.integrity_issues.push({
          id: route.id,
          type: 'MISSING_PRICING',
          details: `Route ${route.from_city} to ${route.to_city} has no prices set.`
        });
      }

      // Counts
      if (fromCity.includes('ahmedabad') || toCity.includes('ahmedabad')) {
        report.summary.ahmedabad_routes++;
      }
      if (fromCity.includes('vadodara') || toCity.includes('vadodara')) {
        report.summary.vadodara_routes++;
      }
    });

    // 3. Special Checks for "Missing Vadodara"
    // Heuristic: If we have > 0 routes but Vadodara count is 0, flag it.
    if (report.summary.total_routes > 0 && report.summary.vadodara_routes === 0) {
      report.integrity_issues.push({
        id: 'SYSTEM_ALERT',
        type: 'MISSING_REGION_DATA',
        details: 'CRITICAL: No routes found involving "Vadodara". Please check import files.'
      });
    }

    return report;

  } catch (err) {
    console.error("Diagnostic failed:", err);
    throw new Error("Failed to run diagnostics: " + err.message);
  }
};