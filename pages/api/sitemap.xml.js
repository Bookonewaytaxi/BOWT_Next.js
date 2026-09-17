import { supabase } from '@/lib/customSupabaseClient';
import { SITE_URL } from '@/lib/schema/organizationSchema';

const ROUTES_PER_SITEMAP = 5000;
const SITEMAP_CACHE_SECONDS = 3600;

export default async function sitemapIndex(req, res) {
  try {
    const { count, error } = await supabase
      .from('routes')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('slug', 'is', null);

    if (error) throw error;

    const totalRoutes = Number.isFinite(count) ? count : 0;
    const sitemapCount = Math.max(1, Math.ceil(totalRoutes / ROUTES_PER_SITEMAP));
    const items = [
      `${SITE_URL}/sitemap-pages.xml`,
      `${SITE_URL}/sitemap-cities.xml`,
      ...Array.from(
        { length: sitemapCount },
        (_, index) => `${SITE_URL}/sitemap/${index + 1}.xml`
      ),
    ]
      .map((url) => `<sitemap><loc>${url}</loc></sitemap>`)
      .join('');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${SITEMAP_CACHE_SECONDS}, stale-while-revalidate=${SITEMAP_CACHE_SECONDS}`
    );
    res.status(200).send(
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`
    );
  } catch (error) {
    console.error('[sitemap.xml] Failed to generate sitemap index:', error);
    res.status(500).end();
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
