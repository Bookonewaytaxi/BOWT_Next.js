import { supabase } from '@/lib/customSupabaseClient';

export default function RoutesSitemapXml() {
  return null;
}

export async function getServerSideProps({ res, params }) {
  const { page } = params;

  try {
    const fileName = `sitemap-routes-${page}.xml`;
    const { data } = supabase.storage.from('sitemaps').getPublicUrl(fileName);
    const response = await fetch(data.publicUrl);
    if (!response.ok) throw new Error('File not found');
    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml');
    res.write(xml);
    res.end();
  } catch (error) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.write('Error loading routes sitemap. It might not exist yet.');
    res.end();
  }

  return { props: {} };
}
