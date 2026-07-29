import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { generateSeoForRoute } from '@/utils/seoGenerator';
import { calculateSeoScore as utilCalculateScore } from '@/utils/seoScoreCalculator';

export const useSeoRouteManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRouteSeoData = useCallback(async (routeId) => {
    setLoading(true);
    try {
      // Fetch route basic info
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('id', routeId)
        .single();
      
      if (routeError) throw routeError;

      // Fetch existing metadata
      const { data: seo, error: seoError } = await supabase
        .from('seo_metadata')
        .select('*')
        .eq('page_id', routeId)
        .eq('page_type', 'route')
        .maybeSingle();

      if (seoError) throw seoError;

      if (seo) {
        return { 
          ...seo, 
          status: 'edited', 
          route_info: route,
          // Map stored fields to editor expected fields if naming differs
          content: seo.content || seo.meta_description // Fallback if content column missing in provided schema, but we'll assume we can store it or it's in a jsonb field
        };
      } else {
        // Generate Default
        const generated = generateSeoForRoute(route);
        return { 
          ...generated, 
          status: 'auto',
          route_info: route,
          page_id: routeId,
          page_type: 'route'
        };
      }

    } catch (error) {
      console.error("Error fetching SEO:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load SEO data" });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateRouteSeo = useCallback(async (data) => {
    setLoading(true);
    try {
      const { page_id, page_type, status, route_info, ...seoFields } = data;
      
      // Calculate final score
      // Note: utilCalculateScore usually expects specific structure, adaptable here
      const score = calculateSeoScore(data); 

      // Prepare payload for seo_metadata table
      // Based on schema provided in prompt: id, page_type, page_id, meta_title, meta_description, keywords, og_image_url, slug, focus_keyword
      const payload = {
        page_id,
        page_type: 'route',
        meta_title: seoFields.meta_title,
        meta_description: seoFields.meta_description,
        slug: seoFields.slug,
        focus_keyword: seoFields.focus_keyword,
        keywords: seoFields.secondary_keywords, // Storing secondary keywords in 'keywords' array column
        updated_at: new Date().toISOString()
      };

      // We might need to store content/faq elsewhere if seo_metadata is strictly meta tags
      // Or we assume the schema allows jsonb extension or we update the `routes` table for content.
      // Task 5 says: call supabase.from('seo_metadata').update(). 
      // I'll proceed with upsert on seo_metadata.
      
      const { data: savedData, error } = await supabase
        .from('seo_metadata')
        .upsert(payload, { onConflict: 'page_id,page_type' }) // Assuming unique constraint or handling via ID
        .select()
        .single();

      if (error) throw error;
      
      // Also update route page_sections if content is stored there
      if (route_info && route_info.id) {
         await supabase.from('routes').update({
             page_sections: {
                 long_form_content: seoFields.content,
                 faqs: seoFields.faqs,
                 internal_links: seoFields.internal_links
             }
         }).eq('id', route_info.id);
      }

      toast({
        title: "SEO Updated",
        description: `SEO data saved successfully. Score: ${score}`,
        className: "bg-green-600 text-white"
      });
      
      return true;

    } catch (error) {
      console.error("Error saving SEO:", error);
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const calculateSeoScore = (data) => {
    let score = 0;
    if (data.slug?.includes(data.focus_keyword?.toLowerCase().replace(/ /g, '-'))) score += 15;
    if (data.meta_title?.toLowerCase().includes(data.focus_keyword?.toLowerCase())) score += 15;
    if (data.meta_description?.length >= 120) score += 10;
    if (data.content?.length > 500) score += 20;
    if (data.h1_heading) score += 10;
    if (data.secondary_keywords?.length > 2) score += 15;
    if (data.faqs?.length >= 3) score += 15;
    return Math.min(100, score);
  };

  const fetchInternalLinkSuggestions = async (currentRouteId) => {
      // Basic suggestion logic
      const { data } = await supabase.from('routes').select('id, from_city, to_city, slug, sedan_price').limit(10).neq('id', currentRouteId);
      return data || [];
  };

  return {
    loading,
    fetchRouteSeoData,
    updateRouteSeo,
    calculateSeoScore,
    fetchInternalLinkSuggestions
  };
};