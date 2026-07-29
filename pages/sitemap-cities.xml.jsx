import { supabase } from '@/lib/customSupabaseClient';

export default function CitiesSitemapXml() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const { data } = supabase.storage.from('sitemaps').getPublicUrl('sitemap-cities.xml');
    const response = await fetch(data.publicUrl);
    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml');
    res.write(xml);
    res.end();
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.write('Error loading cities sitemap.');
    res.end();
  }

  return { props: {} };
}
