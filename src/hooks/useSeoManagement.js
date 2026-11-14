import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { generateSeoForRoute } from '@/utils/seoGenerator';
import { calculateSeoScore } from '@/utils/seoScoreCalculator';

const ROUTE_SEO_COLUMNS = 'id, from_city, to_city, slug, distance_km, sedan_price, seo_title, seo_description, seo_keywords, seo_content, updated_at';

export const useSeoManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSeoData = useCallback(async (routeId) => {
    if (!routeId) return { success: false, error: new Error('Route ID is required') };
    setLoading(true);
    try {
      const [{ data: route, error: routeError }, { data: faqs, error: faqError }] = await Promise.all([
        supabase.from('routes').select(ROUTE_SEO_COLUMNS).eq('id', routeId).maybeSingle(),
        supabase.from('route_faqs').select('id, category, question, answer, priority, status').eq('route_id', routeId).order('priority', { ascending: true })
      ]);
      if (routeError) throw routeError;
      if (faqError) throw faqError;
      if (!route) throw new Error('Route not found');
      return {
        success: true,
        data: {
          ...route,
          meta_title: route.seo_title || '',
          meta_description: route.seo_description || '',
          secondary_keywords: route.seo_keywords || [],
          long_form_content: route.seo_content || '',
          h1_heading: `One Way Taxi from ${route.from_city} to ${route.to_city}`,
          focus_keyword: `${route.from_city} to ${route.to_city} one way taxi`,
          faq_section: faqs || []
        }
      };
    } catch (error) {
      console.error('[SEO] Failed to load route SEO:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSeoData = useCallback(async (routeId, seoData, isAuto = false) => {
    if (!routeId) return { success: false, error: new Error('Route ID is required') };
    setLoading(true);
    try {
      const validation = validateRouteSeo(seoData);
      if (validation.length) throw new Error(validation.join(' '));
      const routeUpdate = {
        seo_title: seoData.meta_title.trim(),
        seo_description: seoData.meta_description.trim(),
        seo_keywords: Array.isArray(seoData.secondary_keywords) ? seoData.secondary_keywords.filter(Boolean) : [],
        seo_content: seoData.long_form_content || '',
        content_word_count: (seoData.long_form_content || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length,
        content_validation_status: isAuto ? 'draft' : 'reviewed',
        content_last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data: savedRoute, error } = await supabase.from('routes').update(routeUpdate).eq('id', routeId).select(ROUTE_SEO_COLUMNS).single();
      if (error) throw error;

      // Preserve existing FAQ IDs and update/delete only the rows explicitly edited in this form.
      const incomingFaqs = Array.isArray(seoData.faq_section) ? seoData.faq_section : [];
      const { data: existingFaqs, error: existingError } = await supabase.from('route_faqs').select('id').eq('route_id', routeId);
      if (existingError) throw existingError;
      const retainedIds = [];
      for (let index = 0; index < incomingFaqs.length; index += 1) {
        const faq = incomingFaqs[index];
        if (!faq.question?.trim() || !faq.answer?.trim()) continue;
        const row = {
          route_id: routeId,
          category: (faq.category || `custom-${index + 1}`).trim(),
          question: faq.question.trim(),
          answer: faq.answer.trim(),
          priority: index,
          status: faq.status === 'draft' ? 'draft' : 'approved',
          updated_at: new Date().toISOString()
        };
        if (faq.id) {
          const { error: updateError } = await supabase.from('route_faqs').update(row).eq('id', faq.id).eq('route_id', routeId);
          if (updateError) throw updateError;
          retainedIds.push(faq.id);
        } else {
          const { data: inserted, error: insertError } = await supabase.from('route_faqs').insert(row).select('id').single();
          if (insertError) throw insertError;
          retainedIds.push(inserted.id);
        }
      }
      const staleIds = (existingFaqs || []).map((item) => item.id).filter((id) => !retainedIds.includes(id));
      if (staleIds.length) {
        const { error: deleteError } = await supabase.from('route_faqs').delete().eq('route_id', routeId).in('id', staleIds);
        if (deleteError) throw deleteError;
      }

      const score = calculateSeoScore({ ...seoData, slug: savedRoute.slug });
      toast({ title: 'SEO saved', description: `Route SEO saved. On-page score: ${score.totalScore}/100`, className: 'bg-green-600 text-white' });
      return { success: true, data: savedRoute, score };
    } catch (error) {
      console.error('[SEO] Failed to save route SEO:', error);
      toast({ variant: 'destructive', title: 'SEO save failed', description: error.message || 'Please try again.' });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const generateAndSaveSeo = useCallback(async (route) => {
    const generated = generateSeoForRoute(route);
    if (!generated) return { success: false, error: new Error('Route data is required') };
    return saveSeoData(route.id, generated, true);
  }, [saveSeoData]);

  return { loading, getSeoData, saveSeoData, generateAndSaveSeo, calculateSeoScore };
};

export function validateRouteSeo(data = {}) {
  const issues = [];
  const title = (data.meta_title || '').trim();
  const description = (data.meta_description || '').trim();
  if (!title) issues.push('Meta title is required.');
  if (title.length > 60) issues.push('Meta title must be 60 characters or fewer.');
  if (!description) issues.push('Meta description is required.');
  if (!description.includes('+91 75675 75578')) issues.push('Meta description must include +91 75675 75578.');
  if (description.length < 140 || description.length > 160) issues.push('Meta description should be 140–160 characters.');
  return issues;
}
