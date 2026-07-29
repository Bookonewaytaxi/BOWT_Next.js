import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { generateSeoForRoute } from '@/utils/seoGenerator';
import { calculateSeoScore } from '@/utils/seoScoreCalculator';

export const useSeoManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSeoData = useCallback(async (routeId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes_seo')
        .select('*')
        .eq('route_id', routeId)
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSeoData = useCallback(async (routeId, seoData, isAuto = false) => {
    setLoading(true);
    try {
      // Calculate score before saving
      const { totalScore } = calculateSeoScore(seoData);
      const dataToSave = {
        ...seoData,
        route_id: routeId,
        seo_score: isAuto ? Math.min(70, totalScore) : totalScore,
        is_auto: isAuto,
        updated_at: new Date().toISOString()
      };

      // Check if exists
      const { data: existing } = await supabase.from('routes_seo').select('id, is_auto').eq('route_id', routeId).maybeSingle();

      let result;
      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('routes_seo')
          .update(dataToSave)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;

        // Create history (simplified for brevity)
        if (!isAuto) {
             await supabase.from('routes_seo_history').insert({
                 route_seo_id: existing.id,
                 changed_fields: JSON.stringify(Object.keys(seoData)),
                 // changed_by: user_id handled by RLS or passed explicitly if needed
             });
        }

      } else {
        // Insert
        const { data, error } = await supabase
          .from('routes_seo')
          .insert(dataToSave)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      toast({
        title: 'SEO Data Saved',
        description: `Score: ${result.seo_score}/100`,
        className: "bg-green-600 text-white"
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('Error saving SEO data:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const generateAndSaveSeo = useCallback(async (route) => {
    // route object must have from_city, to_city, distance_km, sedan_price
    const prices = { sedan_price: route.sedan_price };
    const seoData = generateSeoForRoute(route.from_city, route.to_city, route.distance_km, prices);
    return await saveSeoData(route.id, seoData, true);
  }, [saveSeoData]);

  return {
    loading,
    getSeoData,
    saveSeoData,
    generateAndSaveSeo,
    calculateSeoScore
  };
};