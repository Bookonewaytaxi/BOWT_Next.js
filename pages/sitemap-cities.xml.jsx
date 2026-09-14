import { supabase } from '@/lib/customSupabaseClient';

const PAGE_SIZE = 5000;
const SITE_URL = 'https://bookonewaytaxi.in';

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugifyCity(city) {
  return String(city)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CitiesSitemapXml() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const cities = new Set();
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from('routes')
        .select('from_city')
        .eq('is_active', true)
        .order('id', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;

      const page = data || [];
      page.forEach((row) => {
        if (row?.from_city) cities.add(String(row.from_city).trim());
      });

      if (page.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      [...cities]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map((city) =>
          `  <url>\n    <loc>${xmlEscape(`${SITE_URL}/routes/city/${slugifyCity(city)}`)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
        )
        .join('\n') +
      `\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
    res.statusCode = 200;
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('[sitemap-cities.xml] Failed to generate cities sitemap:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write('Cities sitemap temporarily unavailable.');
    res.end();
  }

  return { props: {} };
}
