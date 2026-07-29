import React from 'react';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

export default function RouteContentSection({ content, className }) {
  if (!content) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No additional details available for this route yet.</p>
      </div>
    );
  }

  return (
    <section 
      className={cn(
        "prose prose-slate max-w-none bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100",
        // Typography Styling
        "[&>h2]:text-2xl md:[&>h2]:text-3xl [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-slate-900 [&>h2]:font-bold [&>h2]:border-b [&>h2]:border-slate-100 [&>h2]:pb-2",
        "[&>h3]:text-xl md:[&>h3]:text-2xl [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-slate-800 [&>h3]:font-semibold",
        "[&>h4]:text-lg [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:text-slate-800 [&>h4]:font-semibold",
        "[&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-slate-600 [&>p]:text-base md:[&>p]:text-lg",
        
        // List Styling
        "[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:text-slate-600 [&>ul]:space-y-2",
        "[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:text-slate-600 [&>ol]:space-y-2",
        "[&>li]:mb-1",
        
        // Table styling (if any tables in content)
        "[&>table]:w-full [&>table]:border-collapse [&>table]:mb-6 [&>table]:border [&>table]:border-slate-200",
        "[&>table>thead>tr>th]:bg-slate-50 [&>table>thead>tr>th]:p-3 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-semibold [&>table>thead>tr>th]:border-b [&>table>thead>tr>th]:border-slate-200",
        "[&>table>tbody>tr>td]:p-3 [&>table>tbody>tr>td]:border-b [&>table>tbody>tr>td]:border-slate-100 [&>table>tbody>tr:last-child>td]:border-0",
        
        className
      )}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </section>
  );
}