import { supabase } from '@/lib/customSupabaseClient';

const ROUTES_PER_SITEMAP = 5000;
const SUPABASE_PAGE_SIZE = 1000;
const SITE_URL = 'https://bookonewaytaxi.in';

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getActiveRoutesForSitemap(pageNumber) {
  const start = (pageNumber - 1) * ROUTES_PER_SITEMAP;
  const end = start + ROUTES_PER_SITEMAP - 1;
  const routes = [];

  for (let from = start; from <= end; from += SUPABASE_PAGE_SIZE) {
    const to = Math.min(from + SUPABASE_PAGE_SIZE - 1, end);

    const { data, error } = await supabase
      .from('routes')
      .select('slug, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) throw error;

    const batch = (data || []).filter((route) => route?.slug);
    routes.push(...batch);

    if (batch.length < to - from + 1) break;
  }

  return routes;
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
    const routes = await getActiveRoutesForSitemap(pageNumber);

    if (!routes.length) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Sitemap page not found.');
      return { props: {} };
    }

    const fallbackLastmod = new Date().toISOString();
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      routes
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
      `[sitemap-route-page-${pageNumber}] Failed to generate route sitemap:`,
      error
    );
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Route sitemap temporarily unavailable.');
  }

  return { props: {} };
}
