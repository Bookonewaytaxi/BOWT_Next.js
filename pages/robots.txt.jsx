export default function RobotsTxt() {
  return null;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /booking',
    '',
    'Sitemap: https://bookonewaytaxi.in/sitemap.xml',
    'Sitemap: https://bookonewaytaxi.in/sitemap-cities.xml',
  ].join('\n');

  res.write(body);
  res.end();

  return { props: {} };
}
