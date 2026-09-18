const SITE_URL = 'https://www.bookonewaytaxi.in';

const STATIC_PAGES = [
  '/',
  '/services',
  '/about',
  '/contact',
];

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default function PagesSitemapXml() {
  return null;
}

export async function getServerSideProps({ res }) {
  const now = new Date().toISOString();

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    STATIC_PAGES
      .map(
        (path) =>
          `  <url>\n    <loc>${xmlEscape(`${SITE_URL}${path}`)}</loc>\n    <lastmod>${xmlEscape(now)}</lastmod>\n  </url>`
      )
      .join('\n') +
    '\n</urlset>';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200'
  );
  res.statusCode = 200;
  res.end(xml);

  return { props: {} };
}
