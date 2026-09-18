import { supabase } from '@/lib/customSupabaseClient';

const ROUTES_PER_SITEMAP = 1000;
const SITE_URL = 'https://www.bookonewaytaxi.in';

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default function SitemapXml() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const { count, error } = await supabase
      .from('routes')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('slug', 'is', null);

    if (error) throw error;

    const routeCount = Number.isFinite(count) ? count : 0;
    const routeSitemapCount = Math.ceil(routeCount / ROUTES_PER_SITEMAP);

    const sitemapUrls = [
      `${SITE_URL}/sitemap-pages.xml`,
      ...Array.from(
        { length: routeSitemapCount },
        (_, index) => `${SITE_URL}/sitemap-routes-${index + 1}.xml`
      ),
    ];

    const now = new Date().toISOString();
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      sitemapUrls
        .map(
          (url) =>
            `  <sitemap>\n    <loc>${xmlEscape(url)}</loc>\n    <lastmod>${xmlEscape(now)}</lastmod>\n  </sitemap>`
        )
        .join('\n') +
      '\n</sitemapindex>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
    );
    res.statusCode = 200;
    res.end(xml);
  } catch (error) {
    console.error('[sitemap.xml] Failed to generate sitemap index:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.statusCode = 500;
    res.end('Sitemap temporarily unavailable.');
  }

  return { props: {} };
}
