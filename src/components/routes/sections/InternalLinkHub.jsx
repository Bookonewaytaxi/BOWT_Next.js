import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { generateLinksForRoute, groupLinksByCategory } from '@/lib/links/linkEngine';

const CATEGORY_LABELS = {
  reverse_route: 'Reverse Route',
  same_pickup_city: `More Routes`,
  same_destination_city: 'Also Arriving Here',
  cheapest: 'Budget-Friendly Routes',
  premium: 'Premium Routes',
  long_distance: 'Long Distance Routes',
  short_distance: 'Short Distance Routes',
  recently_added: 'Newly Added Routes',
  popular: 'Popular Routes',
};

/**
 * Sub-sections included: From City Routes, To City Routes, Popular Routes
 * (original, server-rendered via props — unchanged), PLUS — when a
 * `route` prop is supplied — 9 additional real categories from the
 * Internal Linking Engine (Module 4+9), loaded client-side,
 * non-blocking, progressive enhancement only.
 *
 * If `route` is omitted, this component behaves EXACTLY as before this
 * change — zero risk to any existing call site.
 *
 * Nearby Cities / Airport Routes / Tour Packages remain NOT rendered —
 * no backing data exists yet (Module 6/6.5/K, frozen). They will appear
 * automatically once those modules ship real data.
 */
export default function InternalLinkHub({ fromCity, toCity, fromCityRoutes, toCityRoutes, popularRoutes, route }) {
  const [engineLinks, setEngineLinks] = useState(null); // null = not loaded yet / not requested

  useEffect(() => {
    let isMounted = true;
    if (!route) return;

    generateLinksForRoute(route)
      .then((links) => {
        if (isMounted) setEngineLinks(links);
      })
      .catch((err) => {
        console.warn('[InternalLinkHub] LinkEngine failed, showing original sections only:', err);
        if (isMounted) setEngineLinks([]);
      });

    return () => {
      isMounted = false;
    };
  }, [route]);

  const grouped = engineLinks ? groupLinksByCategory(engineLinks) : {};
  // Categories already covered by the original props stay excluded here
  // to avoid showing the same "more from X city" content twice under two
  // different headings.
  const engineCategoriesToShow = Object.keys(grouped).filter(
    (cat) => cat !== 'same_pickup_city' && cat !== 'popular'
  );

  const hasOriginal =
    (fromCityRoutes && fromCityRoutes.length > 0) ||
    (toCityRoutes && toCityRoutes.length > 0) ||
    (popularRoutes && popularRoutes.length > 0);
  const hasEngine = engineCategoriesToShow.some((cat) => grouped[cat]?.length > 0);

  if (!hasOriginal && !hasEngine) return null;

  return (
    <aside id="internal-link-hub" aria-labelledby="link-hub-heading" className="scroll-mt-24">
      <h2 id="link-hub-heading" className="text-2xl font-bold mb-8 text-slate-900">
        Explore More
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {fromCityRoutes?.length > 0 && (
          <nav aria-label={`More routes from ${fromCity}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
              More from {fromCity}
            </h3>
            <ul className="space-y-2">
              {fromCityRoutes.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <Link href={`/routes/${r.slug}`} className="text-sm text-slate-600 hover:text-[#667eea] hover:underline">
                    {fromCity} to {r.to_city}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {toCityRoutes?.length > 0 && (
          <nav aria-label={`Routes from ${toCity}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Routes from {toCity}
            </h3>
            <ul className="space-y-2">
              {toCityRoutes.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <Link href={`/routes/${r.slug}`} className="text-sm text-slate-600 hover:text-[#667eea] hover:underline">
                    {toCity} to {r.to_city}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {popularRoutes?.length > 0 && (
          <nav aria-label="Popular routes">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Popular Routes
            </h3>
            <ul className="space-y-2">
              {popularRoutes.slice(0, 6).map((r) => (
                <li key={r.id || r.slug}>
                  <Link href={`/routes/${r.slug}`} className="text-sm text-slate-600 hover:text-[#667eea] hover:underline">
                    {r.from_city} to {r.to_city}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {engineCategoriesToShow.map((category) =>
          grouped[category]?.length > 0 ? (
            <nav key={category} aria-label={CATEGORY_LABELS[category] || category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
                {CATEGORY_LABELS[category] || category}
              </h3>
              <ul className="space-y-2">
                {grouped[category].slice(0, 6).map((r) => (
                  <li key={`${category}-${r.id}`}>
                    <Link href={`/routes/${r.slug}`} className="text-sm text-slate-600 hover:text-[#667eea] hover:underline">
                      {r.anchorText}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null
        )}
      </div>
    </aside>
  );
}
