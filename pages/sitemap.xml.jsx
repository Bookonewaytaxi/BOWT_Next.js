import { supabase } from '@/lib/customSupabaseClient';

export default function SitemapXml() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const { data } = supabase.storage.from('sitemaps').getPublicUrl('sitemap.xml');
    if (!data?.publicUrl) throw new Error('Sitemap public URL is unavailable');

    const response = await fetch(data.publicUrl);
    if (!response.ok) throw new Error(`Sitemap storage returned ${response.status}`);

    const xml = await response.text();
    if (!xml.trim().startsWith('<?xml') && !xml.trim().startsWith('<sitemap')) {
      throw new Error('Invalid sitemap XML payload');
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.statusCode = 200;
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('[sitemap.xml] Failed to serve sitemap:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write('Sitemap temporarily unavailable.');
    res.end();
  }

  return { props: {} };
}
