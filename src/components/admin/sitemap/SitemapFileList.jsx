import React from 'react';
import { FileText, Database, Map } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SitemapFileList({ files = [] }) {
  const getTotalUrls = () => files.reduce((acc, file) => acc + (file.count || 0), 0);

  const getIcon = (type) => {
    switch (type) {
      case 'index': return <Database className="w-4 h-4 text-purple-400" />;
      case 'cities': return <Map className="w-4 h-4 text-blue-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'index': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'cities': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">File Breakdown</h4>
      
      <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden flex-1 flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-3 bg-slate-900 border-b border-slate-800 text-xs font-medium text-slate-400">
          <div className="col-span-7">FILE NAME</div>
          <div className="col-span-3 text-right">URLS</div>
          <div className="col-span-2 text-right">TYPE</div>
        </div>
        
        <ScrollArea className="flex-1 max-h-[240px]">
          <div className="divide-y divide-slate-800">
            {files.map((file, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 p-3 text-sm hover:bg-slate-800/50 transition-colors">
                <div className="col-span-7 flex items-center gap-2 text-slate-200 overflow-hidden">
                  {getIcon(file.type)}
                  <span className="truncate" title={file.name}>{file.name}</span>
                </div>
                <div className="col-span-3 text-right text-slate-400 font-mono">
                  {file.count.toLocaleString()}
                </div>
                <div className="col-span-2 flex justify-end">
                  <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${getBadgeColor(file.type)}`}>
                    {file.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-3 bg-slate-800/30 border-t border-slate-800 grid grid-cols-12 gap-4">
          <div className="col-span-7 text-sm font-medium text-slate-300">Total URLs</div>
          <div className="col-span-3 text-right text-sm font-bold text-emerald-400 font-mono">
            {getTotalUrls().toLocaleString()}
          </div>
          <div className="col-span-2"></div>
        </div>
      </div>
    </div>
  );
}