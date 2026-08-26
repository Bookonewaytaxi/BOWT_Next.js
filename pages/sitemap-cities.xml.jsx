import { supabase } from '@/lib/customSupabaseClient';

export default function CitiesSitemapXml() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const { data } = supabase.storage.from('sitemaps').getPublicUrl('sitemap-cities.xml');
    if (!data?.publicUrl) throw new Error('Cities sitemap public URL is unavailable');

    const response = await fetch(data.publicUrl);
    if (!response.ok) throw new Error(`Cities sitemap storage returned ${response.status}`);

    const xml = await response.text();
    if (!xml.trim().startsWith('<?xml') && !xml.trim().startsWith('<urlset')) {
      throw new Error('Invalid cities sitemap XML payload');
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.statusCode = 200;
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('[sitemap-cities.xml] Failed to serve cities sitemap:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write('Cities sitemap temporarily unavailable.');
    res.end();
  }

  return { props: {} };
}
