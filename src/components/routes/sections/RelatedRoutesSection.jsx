import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function RelatedRoutesSection({ fromCity, relatedRoutes }) {
  if (!relatedRoutes || relatedRoutes.length === 0) return null;

  return (
    <section id="related-routes" aria-labelledby="related-routes-heading" className="scroll-mt-24">
      <h2 id="related-routes-heading" className="text-2xl font-bold mb-8 text-slate-900">
        Related Routes from {fromCity}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedRoutes.map((related) => (
          <Link
            key={related.id}
            href={`/routes/${related.slug}`}
            className="group flex justify-between items-center p-5 bg-white rounded-xl border border-slate-200 hover:border-[#667eea] hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">To</span>
              <span className="font-bold text-slate-900 text-lg group-hover:text-[#667eea] transition-colors">
                {related.to_city}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#667eea] transition-colors">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
