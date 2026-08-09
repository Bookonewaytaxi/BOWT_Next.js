import React from 'react';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

export default function SEOContentDisplay({ content, route, startingPrice }) {
  // Comprehensive Logging
  console.log('[SEOContentDisplay] Rendering check:', { 
    hasContent: !!content, 
    contentLength: content ? content.length : 0 
  });

  const hasFacts = Boolean(route?.distance_km) || Boolean(startingPrice);

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
    <section id="travel-guide" aria-labelledby="travel-guide-heading" className="seo-content-display-section mt-12 mb-12 scroll-mt-24">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-[#667eea]" />
        <h2 id="travel-guide-heading" className="text-2xl font-bold text-slate-900">Complete Travel Guide</h2>
      </div>

      {hasFacts && (
        <dl className="flex flex-wrap gap-6 mb-6 text-sm">
          {route?.distance_km && (
            <div>
              <dt className="text-slate-400 uppercase text-xs font-semibold tracking-wider">Distance</dt>
              <dd className="font-bold text-slate-900">{route.distance_km} km</dd>
            </div>
          )}
          {startingPrice > 0 && (
            <div>
              <dt className="text-slate-400 uppercase text-xs font-semibold tracking-wider">Taxi Fare</dt>
              <dd className="font-bold text-slate-900">Starting ₹{startingPrice.toLocaleString()}</dd>
            </div>
          )}
        </dl>
      )}

      {/* Travel Information / Travel Tips / Best Time to Travel currently
          live inside this single admin-authored content field (seo_content),
          not as separate structured DB fields yet — relabeling the section
          heading is a real, honest change; splitting this into distinct
          structured sub-fields is future Content Engine (Module B) work,
          not fabricated here. */}
      <div 
        className="seo-content-body prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-[#667eea] prose-strong:text-slate-800"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </section>
  );
}