import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function KeywordValidationReport({ report, language = 'hindi' }) {
  if (!report) return null;

  const { wordCount, totalKeywords, validKeywords, invalidKeywords, keywordCounts, status } = report;
  
  const score = totalKeywords > 0 ? (validKeywords / totalKeywords) * 100 : 0;
  
  const handleDownload = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Keyword,Count,Status\n"
      + Object.entries(keywordCounts).map(([k, c]) => `${k},${c},${c >= 2 ? 'Valid' : 'Invalid'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `keyword_report_${language}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" /> Analysis ({language})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload} title="Download Report">
              <Download className="w-3 h-3" />
            </Button>
            <Badge className={cn(
              "uppercase font-bold tracking-wider",
              status === 'valid' ? "bg-green-900/50 text-green-400" :
              status === 'warning' ? "bg-amber-900/50 text-amber-400" :
              "bg-red-900/50 text-red-400"
            )}>
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6">
            {/* Word Count */}
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Word Count</span>
                 <span className={cn("font-mono font-bold", wordCount >= 2000 ? "text-green-400" : "text-amber-400")}>
                   {wordCount} / 2000+
                 </span>
               </div>
               <Progress value={Math.min((wordCount / 2000) * 100, 100)} className="h-1 bg-slate-800" />
            </div>

            {/* Keyword Score */}
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Keyword Usage Score</span>
                 <span className="font-mono font-bold text-blue-400">{Math.round(score)}%</span>
               </div>
               <Progress value={score} className="h-1 bg-slate-800" />
            </div>

            {/* Keyword List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Keyword Density</h4>
              
              {/* Invalid / Warning Keywords first */}
              {invalidKeywords.length > 0 && (
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-red-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Missing or Low Usage ({invalidKeywords.length})
                  </div>
                  {invalidKeywords.map((k, i) => (
                    <div key={i} className="flex items-center justify-between bg-red-950/10 border border-red-900/20 rounded p-2 text-xs">
                      <span className="text-red-200">{k.keyword}</span>
                      <span className="font-mono text-red-400 font-bold">{k.count}/{k.required}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Valid Keywords */}
              <div className="space-y-1">
                 {Object.entries(keywordCounts)
                   .filter(([k]) => !invalidKeywords.some(ik => ik.keyword === k))
                   .map(([keyword, count], i) => (
                   <div key={i} className="flex items-center justify-between group hover:bg-slate-800 rounded px-2 py-1 transition-colors">
                     <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3 text-green-500" />
                       <span className="text-slate-300 text-xs">{keyword}</span>
                     </div>
                     <span className="text-slate-500 text-xs font-mono group-hover:text-white transition-colors">{count}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}