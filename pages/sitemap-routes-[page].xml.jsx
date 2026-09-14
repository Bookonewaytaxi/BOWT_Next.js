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

export async function getServerSideProps({ res, params }) {
  const pageNumber = Number.parseInt(params?.page, 10);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write('Invalid sitemap page.');
    res.end();
    return { props: {} };
  }

  try {
    const from = (pageNumber - 1) * ROUTES_PER_SITEMAP;
    const to = from + ROUTES_PER_SITEMAP - 1;

    const { data: routes, error } = await supabase
      .from('routes')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) throw error;

    if (!routes?.length) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.write('Sitemap page not found.');
      res.end();
      return { props: {} };
    }

    const fallbackLastmod = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      routes
        .filter((route) => route?.slug)
        .map((route) =>
          `  <url>\n    <loc>${xmlEscape(`${SITE_URL}/routes/${route.slug}`)}</loc>\n    <lastmod>${xmlEscape(route.updated_at || fallbackLastmod)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`
        )
        .join('\n') +
      `\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    res.statusCode = 200;
    res.write(xml);
    res.end();
  } catch (error) {
    console.error(`[sitemap-routes-${pageNumber}.xml] Failed to generate route sitemap:`, error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write('Route sitemap temporarily unavailable.');
    res.end();
  }

  return { props: {} };
}
