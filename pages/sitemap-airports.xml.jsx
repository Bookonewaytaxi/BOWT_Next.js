import { AIRPORT_PAGES } from '@/lib/airportConfig';

const SITE_URL = 'https://www.bookonewaytaxi.in';
const xmlEscape = (value) => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');

export default function AirportSitemapXml() { return null; }

export async function getServerSideProps({ res }) {
  const now = new Date().toISOString();
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n' +
    AIRPORT_PAGES.map((airport) => `  <url><loc>${xmlEscape(`${SITE_URL}/airports/${airport.slug}`)}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('\\n') +
    '\\n</urlset>';
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
  res.statusCode = 200;
  res.end(xml);
  return { props: {} };
}
