import React from 'react';
import { Globe, MoreVertical } from 'lucide-react';

export default function SEOPreview({ title, description, slug }) {
  const baseUrl = window.location.origin;
  const displaySlug = slug.startsWith('/') ? slug.substring(1) : slug;

  // Google typically truncates titles around 60 chars and descriptions around 160 chars
  const truncatedTitle = title.length > 60 ? title.substring(0, 58) + '...' : title;
  const truncatedDesc = description.length > 160 ? description.substring(0, 158) + '...' : description;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm font-sans">
      <div className="flex items-center gap-2 mb-4 text-slate-500 text-sm font-medium">
        <Globe className="h-4 w-4" />
        <span>Google Search Preview</span>
      </div>

      <div className="max-w-[600px] font-arial">
        {/* URL / Breadcrumb */}
        <div className="flex items-center gap-1 text-sm mb-1 group cursor-pointer">
           <div className="h-7 w-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
              <span className="uppercase">{baseUrl.split('//')[1]?.[0] || 'W'}</span>
           </div>
           <div className="flex flex-col leading-tight">
              <span className="text-[#202124] text-sm">{baseUrl.split('//')[1] || 'website.com'}</span>
              <span className="text-[#5f6368] text-xs">{baseUrl} › {displaySlug}</span>
           </div>
           <MoreVertical className="h-4 w-4 text-[#5f6368] ml-auto opacity-0 group-hover:opacity-100" />
        </div>

        {/* Title */}
        <h3 className="text-[#1a0dab] hover:underline text-xl font-normal truncate cursor-pointer mb-1 leading-snug">
          {truncatedTitle || 'Page Title'}
        </h3>

        {/* Description */}
        <div className="text-[#4d5156] text-sm leading-6">
          <span className="text-[#70757a]">{new Date().toDateString().split(' ').slice(1,3).join(' ')} — </span>
          {truncatedDesc || 'Meta description goes here. This is how your page description will appear in search engine results. Write something compelling to improve click-through rates.'}
        </div>
      </div>
    </div>
  );
}