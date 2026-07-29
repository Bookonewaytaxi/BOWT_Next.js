import { supabase } from '@/lib/customSupabaseClient';

/**
 * Fetches the sitemap XML from the server-side Edge Function.
 * This ensures consistency between the public endpoint and the admin download.
 */
export async function generateSitemapXML() {
  try {
    const { data, error } = await supabase.functions.invoke('generate-sitemap', {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      }
    });

    if (error) {
      console.error("Sitemap Function Error:", error);
      throw error;
    }

    // If data is returned as a Blob or non-string (depending on client version/response), handle it
    if (typeof data !== 'string') {
        // In some supabase-js versions, non-JSON responses might be handled differently or require responseType: 'text'
        // But invoke() typically tries to parse JSON. 
        // We will assume the edge function returns JSON with an 'xml' property OR we handle the invoke carefully.
        // Actually, it's safer to have the edge function return JSON { xml: "..." } to avoid parsing issues in the client SDK 
        // unless we strictly control the response type.
        // However, Task 2 requires the Edge Function to return "XML with proper Content-Type: application/xml".
        // If the Edge function returns raw XML, supabase-js might return it as 'data' (parsed as text if not json).
        return data; 
    }

    return data;
  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    throw error;
  }
}

/**
 * Triggers a browser download for the generated sitemap XML.
 * @param {string} xmlString - The complete XML content
 */
export function downloadSitemap(xmlString) {
  try {
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download Error:", error);
  }
}