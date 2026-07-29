import React from 'react';
import { Download, XCircle, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RouteImportReport({ isOpen, onClose, report }) {
  if (!report) return null;

  const { totalRows, createdCount, updatedCount, errorCount, errors, createdRoutes, updatedRoutes } = report;

  const handleDownloadErrors = () => {
    if (!errors || errors.length === 0) return;
    // Format error string safely
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Row_Info,Error_Message\n"
      + errors.map(e => `"${typeof e === 'string' ? e.replace(/"/g, '""') : JSON.stringify(e).replace(/"/g, '""')}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "import_errors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
             Import Summary
          </DialogTitle>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 py-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
            <div className="text-slate-400 text-xs uppercase font-bold mb-1">Total Processed</div>
            <div className="text-2xl font-black">{totalRows}</div>
          </div>
          <div className="bg-green-950/30 p-4 rounded-lg border border-green-900/50 text-center">
            <div className="text-green-500 text-xs uppercase font-bold mb-1">Created</div>
            <div className="text-2xl font-black text-green-400">{createdCount}</div>
          </div>
          <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-900/50 text-center">
            <div className="text-blue-500 text-xs uppercase font-bold mb-1">Updated</div>
            <div className="text-2xl font-black text-blue-400">{updatedCount}</div>
          </div>
          <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/50 text-center">
            <div className="text-red-500 text-xs uppercase font-bold mb-1">Failed</div>
            <div className="text-2xl font-black text-red-400">{errorCount}</div>
          </div>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-900/30 p-3 rounded-lg mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-purple-200">
               <strong>Auto-generation:</strong> Slugs, SEO titles, and descriptions were automatically created for new routes where missing.
            </p>
        </div>

        <ScrollArea className="flex-1 pr-4 -mr-4">
           <div className="space-y-6">
              {/* Success Details */}
              {(createdRoutes?.length > 0 || updatedRoutes?.length > 0) && (
                <div className="space-y-2">
                   <h4 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-green-500" /> Success Log
                   </h4>
                   <div className="bg-slate-950 rounded border border-slate-800 p-3 text-xs text-slate-400 max-h-32 overflow-y-auto">
                      {createdRoutes?.map((r, i) => (
                        <div key={`c-${i}`} className="flex justify-between py-1 border-b border-slate-800/50 last:border-0">
                          <span>{r.from_city} → {r.to_city}</span>
                          <span className="text-green-500 font-medium">Created</span>
                        </div>
                      ))}
                      {updatedRoutes?.map((r, i) => (
                        <div key={`u-${i}`} className="flex justify-between py-1 border-b border-slate-800/50 last:border-0">
                          <span>{r.from_city} → {r.to_city}</span>
                          <span className="text-blue-500 font-medium">Updated</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Errors */}
              {errors?.length > 0 && (
                <div className="space-y-2">
                   <h4 className="font-bold text-sm text-red-400 flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4" /> Errors ({errors.length})
                   </h4>
                   <div className="bg-red-950/10 rounded border border-red-900/30 divide-y divide-red-900/30">
                      {errors.map((err, idx) => (
                        <div key={idx} className="p-3 text-xs text-red-300">
                           {typeof err === 'string' ? err : JSON.stringify(err)}
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
           {errorCount > 0 && (
             <Button variant="destructive" onClick={handleDownloadErrors} className="gap-2">
               <Download className="w-4 h-4" /> Download Error Log
             </Button>
           )}
           <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800">
             Close
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}