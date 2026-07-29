import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function RoutePagePreview({ sections, routeData, onClose }) {
  
  const renderSection = (section, index) => {
    const { content } = section;
    if (!content) return null;

    switch (section.type) {
      case 'hero':
        return (
          <div key={index} className="relative h-[400px] w-full overflow-hidden">
             {content.image ? (
                <img src={content.image} alt={content.alt || 'Hero'} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">No Image</div>
             )}
             <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{content.title || routeData.from_city + ' to ' + routeData.to_city}</h1>
                {content.subtitle && <p className="text-xl text-slate-200 drop-shadow-md">{content.subtitle}</p>}
             </div>
          </div>
        );
      
      case 'text':
         return (
            <div key={index} className="max-w-4xl mx-auto px-6 py-12 prose prose-lg prose-slate dark:prose-invert">
               <div dangerouslySetInnerHTML={{ __html: content.html }} />
            </div>
         );

      case 'image':
         return (
            <div key={index} className="max-w-5xl mx-auto px-6 py-12">
               {content.url && (
                  <figure className="text-center">
                     <img src={content.url} alt={content.alt} className="w-full rounded-xl shadow-lg" />
                     {content.caption && <figcaption className="mt-2 text-slate-500 italic">{content.caption}</figcaption>}
                  </figure>
               )}
            </div>
         );

      case 'table':
         return (
            <div key={index} className="max-w-4xl mx-auto px-6 py-12">
               {content.title && <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{content.title}</h3>}
               {content.tableData && (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                           <tr>
                              {content.tableData.headers.map((h, i) => (
                                 <th key={i} className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 border-b dark:border-slate-700">{h}</th>
                              ))}
                           </tr>
                        </thead>
                        <tbody>
                           {content.tableData.rows.map((row, r) => (
                              <tr key={r} className="border-b dark:border-slate-700 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                 {row.map((cell, c) => (
                                    <td key={c} className="px-6 py-4 text-slate-600 dark:text-slate-300">{cell}</td>
                                 ))}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         );

      case 'amenities':
          return (
             <div key={index} className="bg-slate-50 dark:bg-slate-900 py-12">
                <div className="max-w-4xl mx-auto px-6">
                   <h3 className="text-2xl font-bold mb-8 text-center text-slate-800 dark:text-white">Included Amenities</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {content.items?.map((item, i) => (
                         <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          );

      default:
         return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto">
       <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
             <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mr-3">Preview Mode</span>
             <span className="font-bold text-slate-900 dark:text-white">{routeData.from_city} to {routeData.to_city}</span>
          </div>
          <Button onClick={onClose} size="sm" variant="outline">
             <X className="h-4 w-4 mr-2" /> Close Preview
          </Button>
       </div>
       
       <div className="min-h-screen pb-20 bg-white dark:bg-[#0f172a]">
          {sections && sections.length > 0 ? (
             sections.map((section, index) => renderSection(section, index))
          ) : (
             <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <p>No sections added yet.</p>
             </div>
          )}
       </div>
    </div>
  );
}