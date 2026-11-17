import { AIRPORT_PAGES } from '@/lib/airportConfig';

const SITE_URL = 'https://www.bookonewaytaxi.in';

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export default function AirportSitemapXml() {
  return null;
}

export async function getServerSideProps({ res }) {
  const now = new Date().toISOString();
  const urls = AIRPORT_PAGES.map(
    (airport) =>
      `  <url>\n    <loc>${xmlEscape(`${SITE_URL}/airports/${airport.slug}`)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
  );
  res.statusCode = 200;
  res.end(xml);

  return { props: {} };
}
