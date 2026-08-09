import {
  getReverseRoute,
  getSamePickupCityRoutes,
  getSameDestinationCityRoutes,
  getCheapestRoutes,
  getPremiumRoutes,
  getLongDistanceRoutes,
  getShortDistanceRoutes,
  getRecentlyAddedRoutes,
  getPopularRoutesForLinking,
} from '@/services/LinkService';
import { scoreAndSortCandidates } from './priorityScoring';
import { generateAnchorText } from './anchorTemplateEngine';

const MAX_PER_CATEGORY = 6;
const MAX_TOTAL_LINKS = 20; // anti-spam cap across the whole page

/**
 * Runs every real, buildable-today provider for a route and returns a
 * category → scored-candidates map. Each provider independently returns
 * [] on failure/no-data — this function NEVER throws, and works
 * correctly with zero rows anywhere in the database.
 */
async function runAllProviders(route) {
  const [
    reverseRoute,
    samePickupCity,
    sameDestinationCity,
    cheapest,
    premium,
    longDistance,
    shortDistance,
    recentlyAdded,
    popular,
  ] = await Promise.all([
    getReverseRoute(route),
    getSamePickupCityRoutes(route, MAX_PER_CATEGORY),
    getSameDestinationCityRoutes(route, MAX_PER_CATEGORY),
    getCheapestRoutes(route.id, MAX_PER_CATEGORY),
    getPremiumRoutes(route.id, MAX_PER_CATEGORY),
    getLongDistanceRoutes(route.id, MAX_PER_CATEGORY),
    getShortDistanceRoutes(route.id, MAX_PER_CATEGORY),
    getRecentlyAddedRoutes(route.id, MAX_PER_CATEGORY),
    getPopularRoutesForLinking(route.id, MAX_PER_CATEGORY),
  ]);

  return {
    reverse_route: reverseRoute,
    same_pickup_city: samePickupCity,
    same_destination_city: sameDestinationCity,
    cheapest,
    premium,
    long_distance: longDistance,
    short_distance: shortDistance,
    recently_added: recentlyAdded,
    popular,
  };
}

/**
 * Anti-spam: removes a candidate from a lower-priority category if it
 * already appears in a higher-priority category earlier in the map
 * (object insertion order = priority order below). Prevents the same
 * route being shown twice under two different headings on one page.
 */
function dedupeAcrossCategories(categorized) {
  const seen = new Set();
  const result = {};

  for (const [category, candidates] of Object.entries(categorized)) {
    result[category] = candidates.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }
  return result;
}

/**
 * Public entry point. Returns a flat, scored, deduped, anchor-text-
 * assigned link list for one route, capped at MAX_TOTAL_LINKS, sorted
 * by score. This is what UI components and the health checker consume —
 * they never call LinkService/providers directly.
 */
export async function generateLinksForRoute(route) {
  if (!route || !route.id || !route.from_city || !route.to_city) return [];

  const categorized = await runAllProviders(route);
  const deduped = dedupeAcrossCategories(categorized);

  const usedAnchors = new Set();
  let allScored = [];

  for (const [category, candidates] of Object.entries(deduped)) {
    const scored = scoreAndSortCandidates(candidates, route, category);
    allScored.push(...scored);
  }

  allScored.sort((a, b) => b.score - a.score);
  allScored = allScored.slice(0, MAX_TOTAL_LINKS);

  return allScored.map((c) => ({
    ...c,
    anchorText: generateAnchorText(c.from_city, c.to_city, usedAnchors),
  }));
}

/** Groups a flat link list back by category — convenience for section-based UI rendering. */
export function groupLinksByCategory(links) {
  return links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});
}
