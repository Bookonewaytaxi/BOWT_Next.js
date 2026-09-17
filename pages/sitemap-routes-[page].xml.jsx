import { supabase } from '@/lib/customSupabaseClient';

const ROUTES_PER_SITEMAP = 5000;
const SITE_URL = 'https://bookonewaytaxi.in';

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default function RoutesSitemapXml() {
  return null;
}

/**
 * Live route sitemap page.
 *
 * Each sitemap contains up to 5,000 active routes read directly from
 * Supabase. Existing routes remain included and newly uploaded active routes
 * appear automatically; no XML file needs to be manually created or edited.
 */
export async function getServerSideProps({ res, params }) {
  const pageNumber = Number.parseInt(params?.page, 10);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Invalid sitemap page.');
    return { props: {} };
  }

  try {
    const from = (pageNumber - 1) * ROUTES_PER_SITEMAP;
    const to = from + ROUTES_PER_SITEMAP - 1;

    const { data: routes, error } = await supabase
      .from('routes')
      .select('id, slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) throw error;

    if (!routes?.length) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Sitemap page not found.');
      return { props: {} };
    }

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      routes
        .filter((route) => route?.slug)
        .map((route) => {
          const lastmod = route.updated_at
            ? new Date(route.updated_at).toISOString()
            : null;

          return (
            '  <url>\n' +
            `    <loc>${xmlEscape(`${SITE_URL}/routes/${route.slug}`)}</loc>\n` +
            (lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` : '') +
            '  </url>'
          );
        })
        .join('\n') +
      '\n</urlset>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
    );
    res.statusCode = 200;
    res.end(xml);
  } catch (error) {
    console.error(
      `[sitemap-routes-${pageNumber}.xml] Failed to generate route sitemap:`,
      error
    );
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Route sitemap temporarily unavailable.');
  }

  return { props: {} };
}
