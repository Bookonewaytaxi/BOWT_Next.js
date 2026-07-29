import React, { useState, useEffect } from 'react';
import { Wand2, Edit3, Save, RotateCcw, X, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ContentEditor from './ContentEditor';
import KeywordValidationReport from './KeywordValidationReport';
import { generateRouteContent, validateKeywordUsage } from '@/utils/ContentGeneratorService';
import { useToast } from '@/components/ui/use-toast';

export default function ContentGenerator({ route, keywords = [], initialContent = '', onSave, onClose }) {
  const language = 'english';
  const [content, setContent] = useState(initialContent);
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initial validation
    const validation = validateKeywordUsage(content, keywords, language);
    setReport(validation);
  }, [content, keywords]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const generated = generateRouteContent(route, keywords, language);
        setContent(generated);
        toast({ title: "Content Generated", description: "Successfully generated optimized English content." });
      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate content." });
      } finally {
        setIsGenerating(false);
      }
    }, 500); 
  };

  const handleSave = () => {
    if (report?.status === 'error') {
      toast({ 
        variant: "destructive", 
        title: "Content Quality Low", 
        description: "Please ensure content meets word count requirements before saving." 
      });
    }
    onSave(content, report, language);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-500" /> AI Content Assistant
          </h3>
        </div>

        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
             {isGenerating ? <RotateCcw className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
             Regenerate (English)
           </Button>
           <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
             <Save className="w-4 h-4 mr-2" /> Apply Content
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Editor Area */}
        <div className="lg:col-span-8 flex flex-col min-h-0 h-full">
           <ContentEditor 
             value={content} 
             onChange={setContent} 
           />
        </div>

        {/* Validation Sidebar */}
        <div className="lg:col-span-4 flex flex-col min-h-0 h-full">
           <KeywordValidationReport report={report} language={language} />
        </div>
      </div>
    </div>
  );
}
