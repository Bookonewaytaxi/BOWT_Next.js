import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, RefreshCw, Eye } from 'lucide-react';
import SeoScoreDisplay from './SeoScoreDisplay';
import { useSeoRouteManagement } from '@/hooks/useSeoRouteManagement';

export default function RouteSeoEditorModal({ isOpen, onClose, initialData, onSaved, onPreview }) {
  const [formData, setFormData] = useState(initialData || {});
  const [score, setScore] = useState(0);
  const { calculateSeoScore, updateRouteSeo, loading } = useSeoRouteManagement();
  
  useEffect(() => {
    if (initialData) {
        setFormData(JSON.parse(JSON.stringify(initialData))); // Deep copy
    }
  }, [initialData]);

  useEffect(() => {
    setScore(calculateSeoScore(formData));
  }, [formData, calculateSeoScore]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const success = await updateRouteSeo(formData);
    if (success) {
        onSaved();
        onClose();
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 bg-slate-50">
        <div className="p-4 bg-white border-b flex justify-between items-center">
            <div>
                <DialogTitle>Edit SEO: {formData.route_info?.from_city} to {formData.route_info?.to_city}</DialogTitle>
                <div className="mt-2">
                    <SeoScoreDisplay score={score} size="sm" />
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onPreview(formData)}>
                    <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
                <Button onClick={handleSave} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                    Save Changes
                </Button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="basic" className="h-full flex flex-col">
                <div className="px-4 pt-2 bg-white border-b">
                    <TabsList>
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="meta">Meta Data</TabsTrigger>
                        <TabsTrigger value="keywords">Keywords</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="faq">FAQs</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <TabsContent value="basic" className="space-y-4 m-0">
                        <div className="grid gap-2">
                            <Label>URL Slug</Label>
                            <Input value={formData.slug || ''} onChange={e => handleChange('slug', e.target.value)} />
                            <p className="text-xs text-slate-500">Unique identifier for the route page.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Focus Keyword</Label>
                            <Input value={formData.focus_keyword || ''} onChange={e => handleChange('focus_keyword', e.target.value)} className="bg-amber-50 border-amber-200" />
                        </div>
                    </TabsContent>

                    <TabsContent value="meta" className="space-y-6 m-0">
                        <div className="grid gap-2">
                             <div className="flex justify-between">
                                <Label>Meta Title</Label>
                                <span className={`text-xs ${(formData.meta_title?.length || 0) > 60 ? 'text-red-500' : 'text-slate-500'}`}>{formData.meta_title?.length || 0}/60</span>
                             </div>
                             <Input value={formData.meta_title || ''} onChange={e => handleChange('meta_title', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                             <div className="flex justify-between">
                                <Label>Meta Description</Label>
                                <span className={`text-xs ${(formData.meta_description?.length || 0) > 160 ? 'text-red-500' : 'text-slate-500'}`}>{formData.meta_description?.length || 0}/160</span>
                             </div>
                             <Textarea value={formData.meta_description || ''} onChange={e => handleChange('meta_description', e.target.value)} rows={4} />
                        </div>
                        <div className="grid gap-2">
                             <Label>H1 Heading</Label>
                             <Input value={formData.h1_heading || ''} onChange={e => handleChange('h1_heading', e.target.value)} />
                        </div>
                    </TabsContent>

                    <TabsContent value="keywords" className="space-y-4 m-0">
                        <Label>Secondary Keywords</Label>
                        {(formData.secondary_keywords || []).map((kw, i) => (
                            <div key={i} className="flex gap-2">
                                <Input 
                                    value={kw} 
                                    onChange={(e) => {
                                        const newKw = [...formData.secondary_keywords];
                                        newKw[i] = e.target.value;
                                        handleChange('secondary_keywords', newKw);
                                    }} 
                                />
                                <Button variant="ghost" size="icon" onClick={() => {
                                    const newKw = formData.secondary_keywords.filter((_, idx) => idx !== i);
                                    handleChange('secondary_keywords', newKw);
                                }}>
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleChange('secondary_keywords', [...(formData.secondary_keywords || []), ''])}>
                            <Plus className="w-4 h-4 mr-2" /> Add Keyword
                        </Button>
                    </TabsContent>

                    <TabsContent value="content" className="m-0 h-full">
                        <Label className="mb-2 block">Long-form Content</Label>
                        <ReactQuill 
                            theme="snow"
                            value={formData.content || ''}
                            onChange={(val) => handleChange('content', val)}
                            className="h-[400px]"
                        />
                    </TabsContent>

                    <TabsContent value="faq" className="space-y-4 m-0">
                        {(formData.faqs || []).map((faq, i) => (
                            <div key={i} className="p-4 border rounded-lg bg-white relative group">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        const newFaqs = formData.faqs.filter((_, idx) => idx !== i);
                                        handleChange('faqs', newFaqs);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                                <div className="grid gap-2 mb-3">
                                    <Label>Question</Label>
                                    <Input 
                                        value={faq.question} 
                                        onChange={(e) => {
                                            const newFaqs = [...formData.faqs];
                                            newFaqs[i] = { ...newFaqs[i], question: e.target.value };
                                            handleChange('faqs', newFaqs);
                                        }} 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Answer</Label>
                                    <Textarea 
                                        value={faq.answer} 
                                        onChange={(e) => {
                                            const newFaqs = [...formData.faqs];
                                            newFaqs[i] = { ...newFaqs[i], answer: e.target.value };
                                            handleChange('faqs', newFaqs);
                                        }} 
                                    />
                                </div>
                            </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={() => handleChange('faqs', [...(formData.faqs || []), { question: '', answer: '' }])}>
                            <Plus className="w-4 h-4 mr-2" /> Add FAQ Item
                        </Button>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}