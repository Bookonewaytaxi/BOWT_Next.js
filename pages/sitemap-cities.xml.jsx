import { supabase } from '@/lib/customSupabaseClient';

const PAGE_SIZE = 1000;
const SITE_URL = 'https://www.bookonewaytaxi.in';

function xmlEscape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function slugifyCity(city) {
  return String(city || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CitySitemapXml() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const cityNames = new Map();
    for (let offset = 0; offset < 20000; offset += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('routes')
        .select('from_city,to_city')
        .eq('is_active', true)
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      (data || []).forEach((row) => {
        [row.from_city, row.to_city].filter(Boolean).forEach((name) => {
          const normalized = String(name).trim();
          const slug = slugifyCity(normalized);
          if (slug && !cityNames.has(slug)) cityNames.set(slug, normalized);
        });
      });
      if (!data || data.length < PAGE_SIZE) break;
    }

    const now = new Date().toISOString();
    const urls = [...cityNames.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(([slug]) => `  <url>\n    <loc>${xmlEscape(`${SITE_URL}/routes/city/${encodeURIComponent(slug)}`)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n') +
      '\n</urlset>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    res.statusCode = 200;
    res.end(xml);
  } catch (error) {
    console.error('[sitemap-cities] Failed to generate city sitemap:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.statusCode = 500;
    res.end('City sitemap temporarily unavailable.');
  }
  return { props: {} };
}
