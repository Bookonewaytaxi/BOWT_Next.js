import { supabase } from '@/lib/customSupabaseClient';

// Default settings if none exist
const DEFAULT_SETTINGS = {
  sitemap_enabled: true,
  auto_regenerate: false,
  regeneration_frequency: 'weekly',
  last_generated: null
};

/**
 * Fetches sitemap settings from app_settings table
 */
export async function getSitemapSettings() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'sitemap_settings')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    if (!data) {
      return DEFAULT_SETTINGS;
    }

    return { ...DEFAULT_SETTINGS, ...data.value };
  } catch (error) {
    console.error('Error fetching sitemap settings:', error);
    throw new Error('Failed to fetch sitemap settings');
  }
}

/**
 * Updates sitemap settings in app_settings table
 */
export async function updateSitemapSettings(settings) {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({
        key: 'sitemap_settings',
        value: settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;
    return { ...DEFAULT_SETTINGS, ...data.value };
  } catch (error) {
    console.error('Error updating sitemap settings:', error);
    throw new Error('Failed to update settings');
  }
}

/**
 * Fetches statistics for cities and routes
 */
export async function getSitemapStatistics() {
  try {
    const { count: routesCount, error: routesError } = await supabase
      .from('routes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (routesError) throw routesError;

    const { data: citiesData, error: citiesError } = await supabase
      .from('routes')
      .select('from_city')
      .eq('is_active', true);

    if (citiesError) throw citiesError;

    const uniqueCities = new Set(citiesData.map(r => r.from_city));
    
    const routesChunks = Math.ceil((routesCount || 0) / 1000) || 1;
    
    const files = [
      { name: 'sitemap.xml', count: 1 + 1 + routesChunks, type: 'index' },
      { name: 'sitemap-cities.xml', count: uniqueCities.size, type: 'cities' }
    ];

    for (let i = 1; i <= routesChunks; i++) {
      const chunkCount = i === routesChunks ? (routesCount % 1000) || 1000 : 1000;
      files.push({ 
        name: `sitemap-routes-${i}.xml`, 
        count: chunkCount, 
        type: 'routes' 
      });
    }

    return {
      citiesCount: uniqueCities.size,
      routesCount: routesCount || 0,
      filesCount: files.length,
      files: files
    };
  } catch (error) {
    console.error('Error fetching sitemap stats:', error);
    throw new Error('Failed to calculate statistics');
  }
}

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugifyCity(city) {
  return String(city).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function uploadSitemapFile(fileName, xmlContent) {
  const { error } = await supabase.storage
    .from('sitemaps')
    .upload(fileName, new Blob([xmlContent], { type: 'application/xml' }), {
      upsert: true,
      contentType: 'application/xml'
    });
  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from('sitemaps').getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}

/**
 * Generates and uploads all sitemap XML files directly from the browser,
 * replacing the previous (now-missing) Supabase Edge Function approach.
 */
export async function regenerateSitemap() {
  try {
    const siteUrl = window.location.origin;
    const nowIso = new Date().toISOString();

    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('from_city, to_city, slug, updated_at')
      .eq('is_active', true);

    if (routesError) throw routesError;

    // Static pages sitemap
    const staticPages = ['', 'routes', 'services', 'about', 'contact'];
    const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      staticPages.map(p => 
        `  <url>\n    <loc>${xmlEscape(`${siteUrl}/${p}`)}</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      ).join('\n') +
      `\n</urlset>`;
    await uploadSitemapFile('sitemap-pages.xml', pagesXml);
    const { data: pagesPublicUrl } = supabase.storage.from('sitemaps').getPublicUrl('sitemap-pages.xml');
    const uniqueCities = [...new Set((routes || []).map(r => r.from_city))].sort();
    const citiesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      uniqueCities.map(city => 
        `  <url>\n    <loc>${xmlEscape(`${siteUrl}/routes/city/${slugifyCity(city)}`)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      ).join('\n') +
      `\n</urlset>`;

    const chunkSize = 1000;
    const routeChunks = [];
    for (let i = 0; i < (routes || []).length; i += chunkSize) {
      routeChunks.push(routes.slice(i, i + chunkSize));
    }
    if (routeChunks.length === 0) routeChunks.push([]);

    const routeFileNames = [];
    for (let i = 0; i < routeChunks.length; i++) {
      const chunk = routeChunks[i];
      const fileName = `sitemap-routes-${i + 1}.xml`;
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        chunk.map(r => 
          `  <url>\n    <loc>${xmlEscape(`${siteUrl}/routes/${r.slug}`)}</loc>\n    <lastmod>${r.updated_at || nowIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`
        ).join('\n') +
        `\n</urlset>`;
      await uploadSitemapFile(fileName, xml);
      routeFileNames.push(fileName);
    }

    const citiesUrl = await uploadSitemapFile('sitemap-cities.xml', citiesXml);
    const { data: citiesPublicUrl } = supabase.storage.from('sitemaps').getPublicUrl('sitemap-cities.xml');

    const indexEntries = [
      `  <sitemap>\n    <loc>${xmlEscape(pagesPublicUrl.publicUrl)}</loc>\n    <lastmod>${nowIso}</lastmod>\n  </sitemap>`,
      `  <sitemap>\n    <loc>${xmlEscape(citiesPublicUrl.publicUrl)}</loc>\n    <lastmod>${nowIso}</lastmod>\n  </sitemap>`,
      ...routeFileNames.map(fn => {
        const { data } = supabase.storage.from('sitemaps').getPublicUrl(fn);
        return `  <sitemap>\n    <loc>${xmlEscape(data.publicUrl)}</loc>\n    <lastmod>${nowIso}</lastmod>\n  </sitemap>`;
      })
    ];
    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      indexEntries.join('\n') +
      `\n</sitemapindex>`;

    await uploadSitemapFile('sitemap.xml', indexXml);

    const currentSettings = await getSitemapSettings();
    await updateSitemapSettings({
      ...currentSettings,
      last_generated: nowIso
    });

    return { 
      success: true, 
      cityCount: uniqueCities.length, 
      routeCount: routes?.length || 0,
      files: ['sitemap.xml', 'sitemap-pages.xml', 'sitemap-cities.xml', ...routeFileNames]
    };
  } catch (error) {
    console.error('Error regenerating sitemap:', error);
    throw new Error('Failed to regenerate sitemap: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Returns the public URL for a given sitemap file in Supabase Storage.
 */
export function getSitemapViewUrl(fileName) {
  const { data } = supabase.storage.from('sitemaps').getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Downloads the current sitemap.xml (index file) to the browser.
 */
export async function downloadSitemap() {
  try {
    const url = getSitemapViewUrl('sitemap.xml');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Sitemap file not found. Please regenerate first.');
    const xmlText = await response.text();

    const blob = new Blob([xmlText], { type: 'application/xml' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading sitemap:', error);
    throw new Error('Failed to download sitemap');
  }
}
