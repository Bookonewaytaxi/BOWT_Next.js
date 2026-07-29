import React from 'react';
import { Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SEOPreview({ title, description, keywordCount }) {
  const titleLength = title?.length || 0;
  const descLength = description?.length || 0;
  
  const isTitleValid = titleLength >= 30 && titleLength <= 60;
  const isDescValid = descLength >= 120 && descLength <= 160;
  const isKeywordsValid = keywordCount >= 15;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <Eye className="w-4 h-4" /> SEO Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Search Result Preview */}
        <div className="bg-white p-4 rounded-lg shadow-sm font-sans max-w-2xl">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
            example.com › route › {title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          </div>
          <div className="text-[#1a0dab] text-xl font-medium hover:underline truncate cursor-pointer leading-tight mb-1">
            {title || 'Enter a title...'}
          </div>
          <div className="text-[#4d5156] text-sm leading-snug">
            {description || 'Enter a meta description...'}
          </div>
        </div>

        {/* Validation Indicators */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={cn(
            "p-2 rounded border flex items-center justify-between",
            isTitleValid ? "bg-green-950/20 border-green-900/30 text-green-500" : "bg-red-950/20 border-red-900/30 text-red-500"
          )}>
            <span>Title ({titleLength}/60)</span>
            {isTitleValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          </div>
          
          <div className={cn(
            "p-2 rounded border flex items-center justify-between",
            isDescValid ? "bg-green-950/20 border-green-900/30 text-green-500" : "bg-red-950/20 border-red-900/30 text-red-500"
          )}>
            <span>Desc ({descLength}/160)</span>
            {isDescValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          </div>

          <div className={cn(
            "p-2 rounded border flex items-center justify-between",
            isKeywordsValid ? "bg-green-950/20 border-green-900/30 text-green-500" : "bg-amber-950/20 border-amber-900/30 text-amber-500"
          )}>
            <span>Keywords ({keywordCount}/15+)</span>
            {isKeywordsValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
