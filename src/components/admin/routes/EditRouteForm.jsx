import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, X, Trash2, Sparkles, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import RouteFormFields from './RouteFormFields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SEOPreview from '../seo/SEOPreview';
import SEOKeywordEditor from '../seo/SEOKeywordEditor';
import ContentGenerator from '../content/ContentGenerator';
import { 
  generateSEOTitle, 
  generateMetaDescription, 
  generateKeywords
} from '@/utils/seoGeneratorService';

export default function EditRouteForm({ routeId, initialData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [formData, setFormData] = useState({
    from_city: '',
    to_city: '',
    distance_km: '',
    sedan_price: '',
    ertiga_price: '',
    carens_price: '',
    innova_crysta_price: '',
    description: '',
    is_active: true,
    // SEO Fields
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    seo_content: '',
    seo_content_language: 'hindi',
    content_word_count: 0,
    content_validation_status: 'pending',
    content_version: 1
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        from_city: initialData.from_city || '',
        to_city: initialData.to_city || '',
        distance_km: initialData.distance_km || '',
        
        sedan_price: initialData.sedan_price || initialData.route_price || '',
        ertiga_price: initialData.ertiga_price || initialData.suv_ertiga_price || '',
        carens_price: initialData.carens_price || initialData.kia_carens_price || '',
        innova_crysta_price: initialData.innova_crysta_price || initialData.crysta_price || '',
        
        description: initialData.description || '',
        is_active: initialData.is_active ?? true,

        // SEO Fields
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || '',
        seo_keywords: initialData.seo_keywords || [],
        seo_content: initialData.seo_content || '',
        seo_content_language: initialData.seo_content_language || 'hindi',
        content_word_count: initialData.content_word_count || 0,
        content_validation_status: initialData.content_validation_status || 'pending',
        content_version: initialData.content_version || 1
      });
    }
  }, [initialData]);

  const handleContentSave = (content, report, language) => {
    setFormData(prev => ({
      ...prev,
      seo_content: content,
      seo_content_language: language,
      content_word_count: report.wordCount,
      content_validation_status: report.status,
      content_version: (prev.content_version || 0) + 1
    }));
    setShowContentGenerator(false);
    toast({ title: `Content Updated (${language})`, className: "bg-green-600 text-white" });
  };

  const handleRegenerateSEO = () => {
     if (!formData.from_city || !formData.to_city || !formData.sedan_price) {
      toast({
        variant: "destructive",
        title: "Missing Data",
        description: "Please fill From City, To City and Sedan Price first."
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      seo_title: generateSEOTitle(formData.from_city, formData.to_city, formData.sedan_price),
      seo_description: generateMetaDescription(formData.from_city, formData.to_city),
      seo_keywords: generateKeywords(formData.from_city, formData.to_city, formData.sedan_price),
    }));

    toast({
      title: "SEO Meta Tags Regenerated",
      className: "bg-amber-600 text-white"
    });
  };

  const validate = (data) => {
    const newErrors = {};
    if (!data.from_city || data.from_city.length < 2 || data.from_city.length > 50) {
      newErrors.from_city = 'From City must be between 2 and 50 characters';
    }
    if (!data.to_city || data.to_city.length < 2 || data.to_city.length > 50) {
      newErrors.to_city = 'To City must be between 2 and 50 characters';
    }
    
    ['sedan_price', 'ertiga_price', 'carens_price', 'innova_crysta_price'].forEach(field => {
       if (!data[field] || isNaN(data[field]) || Number(data[field]) < 0) {
         newErrors[field] = 'Valid price required';
       }
    });

    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validate(formData);
    if (validationErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('routes').update({
        from_city: formData.from_city,
        to_city: formData.to_city,
        distance_km: formData.distance_km ? Number(formData.distance_km) : null,
        
        sedan_price: Number(formData.sedan_price),
        ertiga_price: Number(formData.ertiga_price),
        carens_price: Number(formData.carens_price),
        innova_crysta_price: Number(formData.innova_crysta_price),
        route_price: Number(formData.sedan_price), 

        description: formData.description,
        is_active: formData.is_active,
        
        distance: formData.distance_km ? `${formData.distance_km} km` : '0 km',
        suv_price: Number(formData.ertiga_price),
        crysta_price: Number(formData.innova_crysta_price),
        suv_ertiga_price: Number(formData.ertiga_price),
        kia_carens_price: Number(formData.carens_price),

        // SEO Fields
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        seo_keywords: formData.seo_keywords,
        seo_content: formData.seo_content,
        seo_content_language: formData.seo_content_language,

        // Content Metrics
        content_word_count: formData.content_word_count,
        content_validation_status: formData.content_validation_status,
        content_version: formData.content_version,
        content_last_updated: new Date().toISOString(),

        // EXPLICITLY SETTING UPDATED_AT
        updated_at: new Date().toISOString()
      }).eq('id', routeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route updated successfully",
        className: "bg-green-600 text-white"
      });
      router.push('/admin/routes');
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update route"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('routes').delete().eq('id', routeId);
      if (error) throw error;
      toast({
        title: "Deleted",
        description: "Route deleted successfully",
      });
      router.push('/admin/routes');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete route",
      });
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl max-w-4xl mx-auto">
      <div className="mb-6 pb-6 border-b border-slate-800 flex justify-between items-center">
        <div>
           <h3 className="text-xl font-bold text-white">Edit Route Details</h3>
           <p className="text-slate-400 text-sm">Modify information for this route including vehicle pricing and SEO.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="bg-red-900/30 text-red-500 hover:bg-red-900/50 border border-red-900/50">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Route
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This action cannot be undone. This will permanently delete the route from your database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-100">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <RouteFormFields 
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        touched={touched}
      />

       <div className="mt-8 border-t border-slate-800 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">SEO & Content</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRegenerateSEO} className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10">
              <Sparkles className="w-3 h-3 mr-2" /> Reset Meta Tags
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowContentGenerator(true)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-3 h-3 mr-2" /> Manage Content ({formData.seo_content_language})
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">SEO Title</Label>
              <Input 
                value={formData.seo_title}
                onChange={(e) => handleChange('seo_title', e.target.value)}
                className="bg-slate-950 border-slate-800"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Meta Description</Label>
              <Textarea 
                value={formData.seo_description}
                onChange={(e) => handleChange('seo_description', e.target.value)}
                className="bg-slate-950 border-slate-800 h-24"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">SEO Keywords</Label>
              <SEOKeywordEditor 
                keywords={formData.seo_keywords}
                onChange={(newKeywords) => handleChange('seo_keywords', newKeywords)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="sticky top-4">
              <Label className="text-slate-300 mb-2 block">Preview</Label>
              <SEOPreview 
                title={formData.seo_title}
                description={formData.seo_description}
                keywordCount={formData.seo_keywords?.length || 0}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/routes')}
          className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Update Route
        </Button>
      </div>

      {/* Content Generator Modal */}
      <Dialog open={showContentGenerator} onOpenChange={setShowContentGenerator}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] bg-slate-900 border-slate-800 p-6 overflow-hidden flex flex-col">
          <ContentGenerator 
            route={formData}
            keywords={formData.seo_keywords}
            initialContent={formData.seo_content}
            initialLanguage={formData.seo_content_language}
            onSave={handleContentSave}
            onClose={() => setShowContentGenerator(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}