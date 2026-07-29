import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, AlertCircle, CheckCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { calculateSEOScore } from '@/utils/SEOScoreCalculator';
import SEOPreview from '@/components/admin/SEOPreview';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function SEOEditor({ page, onClose, onSave }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    meta_title: '',
    meta_description: '',
    slug: '',
    focus_keyword: '',
    keywords: '',
    og_image_url: '',
    ...page,
    keywords: Array.isArray(page.keywords) ? page.keywords.join(', ') : (page.keywords || '')
  });

  const [scores, setScores] = useState({ overall_score: 0, suggestions: [] });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const keywordArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
    const calculated = calculateSEOScore({
      ...formData,
      keywords: keywordArray
    });
    setScores(calculated);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const keywordArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      // Update or Insert Metadata
      const payload = {
        page_type: formData.page_type,
        page_id: formData.page_id || null, // Ensure uuid or null
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        slug: formData.slug,
        focus_keyword: formData.focus_keyword,
        keywords: keywordArray,
        og_image_url: formData.og_image_url,
        updated_at: new Date().toISOString()
      };

      let { data, error } = await supabase
        .from('seo_metadata')
        .upsert(
           // If we have an ID, use it for update, otherwise let DB handle it or match on unique constraint
           formData.id ? { ...payload, id: formData.id } : payload, 
           { onConflict: 'page_type, page_id' } // Depends on unique constraint
        )
        .select()
        .single();

      if (error) {
         // Fallback: if unique constraint issue on ID vs unique keys, try matching by unique keys manually if needed, 
         // but upsert usually handles it if conflict target is correct.
         // Let's assume ID is reliable if provided.
         throw error;
      }

      // Save Score History
      if (data) {
        await supabase.from('seo_scores').insert({
          metadata_id: data.id,
          overall_score: scores.overall_score,
          title_score: scores.title_score,
          description_score: scores.description_score,
          keyword_score: scores.keyword_score,
          image_score: scores.image_score,
          content_score: scores.content_score,
          suggestions: scores.suggestions
        });
      }

      toast({
        title: "SEO Saved",
        description: "Metadata and scores have been updated successfully."
      });
      onSave(); // Refresh parent
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Error Saving",
        description: error.message || "Failed to save SEO data."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#0f172a] w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-[#1e293b]">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit SEO Metadata</h2>
            <p className="text-slate-400 text-sm">Optimizing for: <span className="text-amber-500 font-mono">{formData.slug}</span></p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase font-bold">SEO Score</span>
                <div className={`text-2xl font-black ${
                  scores.overall_score > 75 ? 'text-green-500' : 
                  scores.overall_score > 50 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {scores.overall_score}/100
                </div>
             </div>
             <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
               <X className="h-6 w-6" />
             </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Form */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-700 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
            <div className="space-y-2">
               <Label htmlFor="meta_title" className="text-slate-300 flex justify-between">
                 Meta Title 
                 <span className={`text-xs ${formData.meta_title.length >= 50 && formData.meta_title.length <= 60 ? 'text-green-500' : 'text-slate-500'}`}>
                   {formData.meta_title.length} / 60
                 </span>
               </Label>
               <Input 
                 id="meta_title" name="meta_title" 
                 value={formData.meta_title} onChange={handleChange}
                 className="bg-[#1e293b] border-slate-600 text-white focus:border-amber-500"
                 placeholder="Primary Keyword - Brand Name"
               />
               <p className="text-xs text-slate-500">Optimal length: 50-60 characters</p>
            </div>

            <div className="space-y-2">
               <Label htmlFor="slug" className="text-slate-300">URL Slug</Label>
               <Input 
                 id="slug" name="slug" 
                 value={formData.slug} onChange={handleChange}
                 className="bg-[#1e293b] border-slate-600 text-white focus:border-amber-500 font-mono text-sm"
               />
            </div>

            <div className="space-y-2">
               <Label htmlFor="meta_description" className="text-slate-300 flex justify-between">
                 Meta Description
                 <span className={`text-xs ${formData.meta_description.length >= 120 && formData.meta_description.length <= 160 ? 'text-green-500' : 'text-slate-500'}`}>
                   {formData.meta_description.length} / 160
                 </span>
               </Label>
               <Textarea 
                 id="meta_description" name="meta_description" 
                 value={formData.meta_description} onChange={handleChange}
                 rows={4}
                 className="bg-[#1e293b] border-slate-600 text-white focus:border-amber-500"
                 placeholder="Summarize the page content..."
               />
               <p className="text-xs text-slate-500">Optimal length: 120-160 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="focus_keyword" className="text-slate-300">Focus Keyword</Label>
                 <Input 
                   id="focus_keyword" name="focus_keyword" 
                   value={formData.focus_keyword} onChange={handleChange}
                   className="bg-[#1e293b] border-slate-600 text-white focus:border-amber-500"
                   placeholder="Main topic"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="keywords" className="text-slate-300">Keywords (Comma sep)</Label>
                 <Input 
                   id="keywords" name="keywords" 
                   value={formData.keywords} onChange={handleChange}
                   className="bg-[#1e293b] border-slate-600 text-white focus:border-amber-500"
                   placeholder="taxi, travel, cab"
                 />
               </div>
            </div>

            <div className="space-y-2">
               <Label htmlFor="og_image_url" className="text-slate-300 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> OG Image URL
               </Label>
               <Input 
                 id="og_image_url" name="og_image_url" 
                 value={formData.og_image_url} onChange={handleChange}
                 className="bg-[#1e293b] border-slate-600 text-white focus:border-amber-500"
                 placeholder="https://example.com/image.jpg"
               />
            </div>
          </div>

          {/* Right: Preview & Analysis */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#0B1120] space-y-8">
             <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Search Preview</h3>
                <SEOPreview 
                  title={formData.meta_title} 
                  description={formData.meta_description} 
                  slug={formData.slug} 
                />
             </div>

             <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Analysis & Suggestions</h3>
                <div className="space-y-3">
                   {scores.suggestions.length === 0 ? (
                      <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-3">
                         <CheckCircle className="h-5 w-5 text-green-500" />
                         <span className="text-green-400 text-sm font-medium">Great job! Your SEO is well optimized.</span>
                      </div>
                   ) : (
                      scores.suggestions.map((suggestion, idx) => (
                         <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 ${
                            suggestion.priority === 'high' 
                               ? 'bg-red-500/10 border-red-500/20 text-red-200' 
                               : suggestion.priority === 'medium'
                               ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                               : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
                         }`}>
                            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                               suggestion.priority === 'high' ? 'text-red-500' : 
                               suggestion.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                            }`} />
                            <span className="text-sm">{suggestion.message}</span>
                         </div>
                      ))
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-[#1e293b] flex justify-end gap-4">
           <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-700">Cancel</Button>
           <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold min-w-[120px]">
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
           </Button>
        </div>
      </div>
    </motion.div>
  );
}