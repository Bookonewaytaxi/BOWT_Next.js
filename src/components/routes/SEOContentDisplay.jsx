import React from 'react';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

export default function SEOContentDisplay({ content, route }) {
  // Comprehensive Logging
  console.log('[SEOContentDisplay] Rendering check:', { 
    hasContent: !!content, 
    contentLength: content ? content.length : 0 
  });

  // Fallback UI if content is strictly missing/null
  if (!content) {
    return (
      <div className="seo-content-display-section mt-12 mb-12 bg-slate-50 border border-slate-100 rounded-xl p-8 text-center opacity-70">
         <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
         <p className="text-slate-400 text-sm">Additional route information is currently being updated.</p>
      </div>
    );
  }

  return (
    <div className="seo-content-display-section mt-12 mb-12">
      <div className="flex items-center gap-2 mb-6 opacity-80">
        <FileText className="w-5 h-5 text-[#667eea]" />
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">About This Route</span>
      </div>
      
      <div 
        className="seo-content-body prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-[#667eea] prose-strong:text-slate-800"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
}