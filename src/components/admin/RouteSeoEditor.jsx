import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Eye, Globe, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSeoManagement } from '@/hooks/useSeoManagement';
import { calculateSeoScore } from '@/utils/seoScoreCalculator';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function RouteSeoEditor({ routeId, initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || {});
  const [scoreData, setScoreData] = useState({ totalScore: 0, breakdown: {} });
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    // Recalculate score whenever form data changes
    if (formData) {
       const score = calculateSeoScore(formData);
       setScoreData(score);
    }
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleJsonChange = (field, index, value, subField = null) => {
      // Helper for array/json fields like FAQs or Keywords
      const currentList = [...(formData[field] || [])];
      if (subField) {
          currentList[index] = { ...currentList[index], [subField]: value };
      } else {
          currentList[index] = value;
      }
      handleChange(field, currentList);
  };

  const handleSave = () => {
    onSave(formData);
  };

  const ScoreBadge = ({ score, max }) => {
      const percentage = (score / max) * 100;
      let color = 'bg-red-500';
      if (percentage > 70) color = 'bg-green-500';
      else if (percentage > 40) color = 'bg-yellow-500';

      return (
          <Badge className={`${color} text-white border-0`}>{score}/{max}</Badge>
      );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Toolbar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
           <h2 className="text-xl font-bold text-slate-900">SEO Editor</h2>
           <p className="text-sm text-slate-500 flex items-center gap-2">
              Score: <span className={`font-bold ${scoreData.totalScore > 70 ? 'text-green-600' : 'text-yellow-600'}`}>{scoreData.totalScore}/100</span>
           </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
                <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
          {/* Main Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 w-full bg-slate-200">
                    <TabsTrigger value="basic">Basic & Meta</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                    <TabsTrigger value="media">Media & Links</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 mt-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="slug">URL Slug (Unique)</Label>
                                <Input 
                                    id="slug" 
                                    value={formData.slug || ''} 
                                    onChange={(e) => handleChange('slug', e.target.value)} 
                                />
                                <p className="text-xs text-slate-500">example: mumbai-to-pune-taxi</p>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="focus_keyword">Focus Keyword</Label>
                                <Input 
                                    id="focus_keyword" 
                                    value={formData.focus_keyword || ''} 
                                    onChange={(e) => handleChange('focus_keyword', e.target.value)} 
                                    className="border-amber-200 bg-amber-50/50"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="meta_title">Meta Title</Label>
                                    <span className={`text-xs ${(formData.meta_title?.length || 0) > 60 ? 'text-red-500' : 'text-slate-500'}`}>
                                        {formData.meta_title?.length || 0}/60
                                    </span>
                                </div>
                                <Input 
                                    id="meta_title" 
                                    value={formData.meta_title || ''} 
                                    onChange={(e) => handleChange('meta_title', e.target.value)} 
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="meta_description">Meta Description</Label>
                                    <span className={`text-xs ${(formData.meta_description?.length || 0) > 160 ? 'text-red-500' : 'text-slate-500'}`}>
                                        {formData.meta_description?.length || 0}/160
                                    </span>
                                </div>
                                <Textarea 
                                    id="meta_description" 
                                    value={formData.meta_description || ''} 
                                    onChange={(e) => handleChange('meta_description', e.target.value)} 
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="h1_heading">H1 Heading</Label>
                                <Input 
                                    id="h1_heading" 
                                    value={formData.h1_heading || ''} 
                                    onChange={(e) => handleChange('h1_heading', e.target.value)} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content" className="mt-6">
                    <Card>
                        <CardContent className="pt-6">
                            <Label className="mb-2 block">Long Form Content</Label>
                            <div className="prose-editor">
                                <ReactQuill 
                                    theme="snow"
                                    value={formData.long_form_content || ''}
                                    onChange={(val) => handleChange('long_form_content', val)}
                                    className="h-[500px] mb-12"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="keywords" className="mt-6 space-y-6">
                     <Card>
                        <CardContent className="pt-6 space-y-4">
                            <Label>Secondary Keywords</Label>
                            {(formData.secondary_keywords || []).map((kw, i) => (
                                <Input 
                                    key={i} 
                                    value={kw} 
                                    onChange={(e) => handleJsonChange('secondary_keywords', i, e.target.value)}
                                    className="mb-2"
                                />
                            ))}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleChange('secondary_keywords', [...(formData.secondary_keywords || []), ''])}
                            >
                                + Add Keyword
                            </Button>
                        </CardContent>
                     </Card>
                </TabsContent>

                <TabsContent value="faq" className="mt-6">
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            {(formData.faq_section || []).map((faq, i) => (
                                <div key={i} className="p-4 border rounded-lg bg-slate-50">
                                    <div className="grid gap-2 mb-2">
                                        <Label>Question {i + 1}</Label>
                                        <Input 
                                            value={faq.question} 
                                            onChange={(e) => handleJsonChange('faq_section', i, e.target.value, 'question')}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Answer</Label>
                                        <Textarea 
                                            value={faq.answer} 
                                            onChange={(e) => handleJsonChange('faq_section', i, e.target.value, 'answer')}
                                        />
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        className="text-red-500 text-xs mt-2"
                                        onClick={() => {
                                            const newFaqs = [...formData.faq_section];
                                            newFaqs.splice(i, 1);
                                            handleChange('faq_section', newFaqs);
                                        }}
                                    >
                                        Remove FAQ
                                    </Button>
                                </div>
                            ))}
                            <Button onClick={() => handleChange('faq_section', [...(formData.faq_section || []), { question: '', answer: '' }])}>
                                + Add FAQ Item
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="media" className="mt-6">
                     <Card>
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-bold">Image Alt Text</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(formData.image_alt_text || {}).map((key) => (
                                    <div key={key}>
                                        <Label className="capitalize">{key}</Label>
                                        <Input 
                                            value={formData.image_alt_text[key]} 
                                            onChange={(e) => {
                                                const newAlt = { ...formData.image_alt_text, [key]: e.target.value };
                                                handleChange('image_alt_text', newAlt);
                                            }} 
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <h3 className="font-bold mt-6">Internal CTA Blocks</h3>
                            <div className="space-y-2">
                                {(formData.internal_cta_blocks || []).map((cta, i) => (
                                    <div key={i} className="flex gap-2">
                                        <Input 
                                            placeholder="CTA Text" 
                                            value={cta.text} 
                                            onChange={(e) => handleJsonChange('internal_cta_blocks', i, e.target.value, 'text')}
                                            className="flex-1"
                                        />
                                        <Input 
                                            placeholder="URL" 
                                            value={cta.link} 
                                            onChange={(e) => handleJsonChange('internal_cta_blocks', i, e.target.value, 'link')}
                                            className="flex-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                     </Card>
                </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Score */}
          <div className="w-80 border-l bg-white p-6 overflow-y-auto hidden xl:block">
               <h3 className="font-bold text-lg mb-4">SEO Score Analysis</h3>
               <div className="space-y-4">
                   {Object.entries(scoreData.breakdown || {}).map(([key, data]) => (
                       <div key={key} className="border-b pb-4 last:border-0">
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                               <ScoreBadge score={data.score} max={data.max} />
                           </div>
                           {data.issues && data.issues.length > 0 && (
                               <ul className="text-xs text-red-500 list-disc pl-4 space-y-1 mt-2">
                                   {data.issues.map((issue, i) => (
                                       <li key={i}>{issue}</li>
                                   ))}
                               </ul>
                           )}
                           {data.issues && data.issues.length === 0 && (
                               <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                   <CheckCircle2 className="w-3 h-3" /> Perfect
                               </p>
                           )}
                       </div>
                   ))}
               </div>
          </div>
      </div>
    </div>
  );
}