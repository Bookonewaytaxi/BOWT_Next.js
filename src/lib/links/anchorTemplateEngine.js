/**
 * Anchor Template Engine — Internal Linking Engine
 *
 * Generates natural, varied anchor text for a link, and guarantees no
 * two links on the SAME page render identical anchor text (tracked via
 * a per-render `usedTemplates` Set passed in by the caller).
 */
const ANCHOR_TEMPLATES = [
  '{from} to {to} Taxi',
  'Taxi from {from} to {to}',
  'One Way Cab {from} to {to}',
  'Outstation Taxi {from} to {to}',
  'Book {from} to {to} Cab Online',
  'Affordable {from} to {to} Cab',
];

function fillTemplate(template, fromCity, toCity) {
  return template.replace('{from}', fromCity).replace('{to}', toCity);
}

/** Deterministic index so the same route always gets a consistent default anchor across page loads. */
function deterministicIndex(seedString, mod) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % mod;
}

/**
 * Returns anchor text for one link, guaranteed not to repeat any anchor
 * already used on this page render (tracked via `usedTemplates`, a Set
 * the caller creates once per page and passes through every call).
 */
export function generateAnchorText(fromCity, toCity, usedTemplates = new Set()) {
  const startIndex = deterministicIndex(`${fromCity}-${toCity}`, ANCHOR_TEMPLATES.length);

  for (let offset = 0; offset < ANCHOR_TEMPLATES.length; offset++) {
    const index = (startIndex + offset) % ANCHOR_TEMPLATES.length;
    const template = ANCHOR_TEMPLATES[index];
    if (!usedTemplates.has(template)) {
      usedTemplates.add(template);
      return fillTemplate(template, fromCity, toCity);
    }
  }

  // Pool exhausted (more links on the page than templates) — wrap around,
  // still valid text, just not guaranteed unique anymore at that point.
  return fillTemplate(ANCHOR_TEMPLATES[startIndex], fromCity, toCity);
}
