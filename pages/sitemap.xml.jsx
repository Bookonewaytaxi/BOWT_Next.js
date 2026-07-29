import { supabase } from '@/lib/customSupabaseClient';

export default function SitemapXml() {
  // getServerSideProps handles the actual response; this component never renders.
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const { data } = supabase.storage.from('sitemaps').getPublicUrl('sitemap.xml');
    const response = await fetch(data.publicUrl);
    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml');
    res.write(xml);
    res.end();
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.write('Error loading sitemap.');
    res.end();
  }

  return { props: {} };
}
