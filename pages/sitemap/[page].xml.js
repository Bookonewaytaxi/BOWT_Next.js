import { supabase } from '@/lib/customSupabaseClient';
import { SITE_URL } from '@/lib/schema/organizationSchema';

const ROUTES_PER_SITEMAP = 5000;
const SITEMAP_CACHE_SECONDS = 3600;

const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export default async function routeSitemap(req, res) {
  const page = Number.parseInt(req.query.page, 10);

  if (!Number.isInteger(page) || page < 1) {
    res.status(400).end();
    return;
  }

  const from = (page - 1) * ROUTES_PER_SITEMAP;
  const to = from + ROUTES_PER_SITEMAP - 1;

  try {
    const { data, error } = await supabase
      .from('routes')
      .select('slug, created_at')
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) throw error;

    if (!data || data.length === 0) {
      res.status(404).end();
      return;
    }

    const urls = data
      .filter((route) => route.slug)
      .map((route) => {
        const lastmod = route.created_at ? `<lastmod>${escapeXml(route.created_at)}</lastmod>` : '';
        return `<url><loc>${escapeXml(`${SITE_URL}/routes/${route.slug}`)}</loc>${lastmod}</url>`;
      })
      .join('');

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', `public, s-maxage=${SITEMAP_CACHE_SECONDS}, stale-while-revalidate=${SITEMAP_CACHE_SECONDS}`);
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  } catch (error) {
    console.error(`[sitemap/${page}.xml] Failed to generate route sitemap:`, error);
    res.status(500).end();
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
