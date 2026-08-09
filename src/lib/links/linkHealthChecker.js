import { supabase } from '@/lib/customSupabaseClient';

/**
 * Internal Linking Health Checker
 *
 * Pure data-check functions — no scoring/generation logic here (that
 * belongs to linkEngine.js). This file only answers: "is the link graph
 * healthy?"
 */

/** Returns active routes that have zero inbound internal_links rows. */
export async function findOrphanRoutes() {
  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select('id, from_city, to_city, slug')
    .eq('is_active', true);

  if (routesError || !routes) return [];

  const { data: links, error: linksError } = await supabase
    .from('internal_links')
    .select('target_route_id');

  if (linksError) return [];

  const linkedIds = new Set((links || []).map((l) => l.target_route_id));
  return routes.filter((r) => !linkedIds.has(r.id));
}

/**
 * Returns internal_links rows whose target_route_id points to a route
 * that is no longer active (or was deleted) — these would render as
 * broken/dead links if not cleaned up.
 */
export async function findBrokenLinks() {
  const { data: links, error: linksError } = await supabase
    .from('internal_links')
    .select('id, source_route_id, target_route_id, category');

  if (linksError || !links || links.length === 0) return [];

  const targetIds = [...new Set(links.map((l) => l.target_route_id))];

  const { data: activeRoutes, error: routesError } = await supabase
    .from('routes')
    .select('id')
    .in('id', targetIds)
    .eq('is_active', true);

  if (routesError) return [];

  const activeIds = new Set((activeRoutes || []).map((r) => r.id));
  return links.filter((l) => !activeIds.has(l.target_route_id));
}

/** Removes broken link rows found by findBrokenLinks() — cleanup utility for the admin dashboard. */
export async function cleanupBrokenLinks() {
  const broken = await findBrokenLinks();
  if (broken.length === 0) return { success: true, removed: 0 };

  const { error } = await supabase
    .from('internal_links')
    .delete()
    .in('id', broken.map((l) => l.id));

  if (error) return { success: false, error: error.message };
  return { success: true, removed: broken.length };
}

/** Simple overall health summary. */
export async function getLinkHealthSummary() {
  const [orphans, broken] = await Promise.all([findOrphanRoutes(), findBrokenLinks()]);
  return {
    orphanCount: orphans.length,
    brokenLinkCount: broken.length,
    orphans,
    broken,
  };
}
