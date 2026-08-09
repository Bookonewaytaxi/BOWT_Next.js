/**
 * Priority Scoring — Internal Linking Engine
 *
 * Pure function, single responsibility: given a candidate route + the
 * current route, returns a 0-1 priority score. No DB calls here.
 *
 * Weights are constants (not DB-driven yet — no admin-config table for
 * this exists per the "minimum required tables" instruction). Kept in
 * one place so tuning later is a one-file change.
 */
const WEIGHTS = {
  sameCity: 0.30,
  distanceSimilarity: 0.25,
  categoryRelevance: 0.25,
  freshness: 0.20,
};

// Per-category base relevance — some categories are inherently more
// useful to a visitor than others (e.g. Reverse Route is almost always
// the single most relevant link on the page).
const CATEGORY_RELEVANCE = {
  reverse_route: 1.0,
  same_pickup_city: 0.8,
  same_destination_city: 0.7,
  cheapest: 0.5,
  premium: 0.5,
  long_distance: 0.4,
  short_distance: 0.4,
  recently_added: 0.45,
  popular: 0.5,
};

function daysSince(dateString) {
  if (!dateString) return null;
  const diffMs = Date.now() - new Date(dateString).getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * Scores one candidate route for a given category, relative to the
 * current route being viewed.
 */
export function scoreCandidate(candidate, currentRoute, category) {
  const sameCity =
    candidate.from_city?.toLowerCase() === currentRoute.from_city?.toLowerCase() ||
    candidate.to_city?.toLowerCase() === currentRoute.to_city?.toLowerCase()
      ? 1
      : 0;

  let distanceSimilarity = 0.5; // neutral default if distance data missing
  if (candidate.distance_km && currentRoute.distance_km) {
    const maxDistance = Math.max(candidate.distance_km, currentRoute.distance_km, 1);
    distanceSimilarity = 1 - Math.abs(candidate.distance_km - currentRoute.distance_km) / maxDistance;
  }

  const categoryRelevance = CATEGORY_RELEVANCE[category] ?? 0.5;

  let freshness = 0.5; // neutral default if created_at missing
  const age = daysSince(candidate.created_at);
  if (age !== null) {
    // Newer routes score higher, decaying over ~180 days to a floor of 0.2
    freshness = Math.max(0.2, 1 - age / 180);
  }

  const score =
    WEIGHTS.sameCity * sameCity +
    WEIGHTS.distanceSimilarity * distanceSimilarity +
    WEIGHTS.categoryRelevance * categoryRelevance +
    WEIGHTS.freshness * freshness;

  return Math.round(score * 1000) / 1000; // 3 decimal places, stable/testable
}

/** Scores and sorts an array of candidates for one category, highest first. */
export function scoreAndSortCandidates(candidates, currentRoute, category) {
  return candidates
    .map((c) => ({ ...c, category, score: scoreCandidate(c, currentRoute, category) }))
    .sort((a, b) => b.score - a.score);
}
