import { supabase } from '@/lib/customSupabaseClient';

const ROUTES_PER_SITEMAP = 1000;
const SUPABASE_PAGE_SIZE = 1000;
const SITE_URL = 'https://www.bookonewaytaxi.in';

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
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) throw error;

    const validRoutes = (routes || []).filter((route) => route?.slug);

    if (!validRoutes.length) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Sitemap page not found.');
      return { props: {} };
    }

    const fallbackLastmod = new Date().toISOString();
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      validRoutes
        .map(
          (route) =>
            `  <url>\n    <loc>${xmlEscape(`${SITE_URL}/routes/${route.slug}`)}</loc>\n    <lastmod>${xmlEscape(route.updated_at || fallbackLastmod)}</lastmod>\n  </url>`
        )
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
