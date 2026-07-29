import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ImportPreviewModal({ isOpen, onClose, onConfirm, data, isImporting }) {
  const { validRows = [], invalidRows = [], total = 0 } = data || {};
  const hasErrors = invalidRows.length > 0;
  
  // Combine rows for display, showing errors first
  const allRows = [...invalidRows, ...validRows];
  const displayedRows = allRows.slice(0, 50); // Limit rendering for performance

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !isImporting && onClose(val)}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-6xl h-[90vh] flex flex-col bg-white text-slate-900 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl">Import Preview</DialogTitle>
            <DialogDescription>
              Review the data before importing. Only rows marked as valid will be imported.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              <span className="text-sm text-slate-500 font-medium">Total Rows</span>
              <span className="text-3xl font-bold text-slate-900">{total}</span>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex flex-col items-center justify-center">
              <span className="text-sm text-green-700 font-medium">Valid Rows</span>
              <span className="text-3xl font-bold text-green-700">{validRows.length}</span>
            </div>
            <div className={cn(
              "p-4 rounded-xl border flex flex-col items-center justify-center transition-colors",
              hasErrors ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
            )}>
              <span className={cn("text-sm font-medium", hasErrors ? "text-red-700" : "text-slate-500")}>Invalid Rows</span>
              <span className={cn("text-3xl font-bold", hasErrors ? "text-red-700" : "text-slate-900")}>{invalidRows.length}</span>
            </div>
          </div>

          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-800 mb-4">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Action Required</p>
                <p>The {invalidRows.length} invalid rows highlighted below will be <strong>skipped</strong>. Please fix these in your Excel file and re-upload if needed.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden border-t border-slate-200 bg-slate-50/50">
          <ScrollArea className="h-full">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <tr>
                  <th className="p-3 border-b text-center w-16 bg-slate-50">Status</th>
                  <th className="p-3 border-b bg-slate-50">Row</th>
                  <th className="p-3 border-b bg-slate-50">From</th>
                  <th className="p-3 border-b bg-slate-50">To</th>
                  <th className="p-3 border-b text-right bg-slate-50">Dist (km)</th>
                  <th className="p-3 border-b text-right bg-slate-50">Sedan</th>
                  <th className="p-3 border-b text-right bg-slate-50">SUV6</th>
                  <th className="p-3 border-b text-right bg-slate-50">SUV7</th>
                  <th className="p-3 border-b text-right bg-slate-50">Crysta</th>
                  <th className="p-3 border-b text-center bg-slate-50">Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {displayedRows.map((row, idx) => {
                  const isInvalid = row.errors && row.errors.length > 0;
                  return (
                    <tr key={idx} className={cn("hover:bg-slate-50 transition-colors", isInvalid ? "bg-red-50/30" : "")}>
                      <td className="p-3 text-center">
                        {isInvalid ? (
                          <div className="flex justify-center group relative">
                             <XCircle className="w-5 h-5 text-red-500 cursor-help" />
                             <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-800 text-white text-xs p-3 rounded shadow-xl z-50 w-64 text-left">
                               <p className="font-bold mb-1 border-b border-slate-600 pb-1">Errors on Row {row.rowNum}:</p>
                               <ul className="list-disc pl-3 space-y-1">
                                 {row.errors.map((e, i) => <li key={i}>{e}</li>)}
                               </ul>
                             </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 text-xs">{row.rowNum}</td>
                      <td className="p-3 font-medium">{row.from_city || '-'}</td>
                      <td className="p-3 font-medium">{row.to_city || '-'}</td>
                      <td className="p-3 text-right text-slate-600">{row.distance_km || '-'}</td>
                      <td className="p-3 text-right font-mono text-slate-700">{row.sedan_price ? `₹${row.sedan_price}` : '-'}</td>
                      <td className="p-3 text-right font-mono text-slate-700">{row.suv_ertiga_price ? `₹${row.suv_ertiga_price}` : '-'}</td>
                      <td className="p-3 text-right font-mono text-slate-700">{row.kia_carens_price ? `₹${row.kia_carens_price}` : '-'}</td>
                      <td className="p-3 text-right font-mono text-slate-700">{row.innova_crysta_price ? `₹${row.innova_crysta_price}` : '-'}</td>
                      <td className="p-3 text-center">
                        <Badge variant={row.is_active ? "default" : "secondary"} className={cn("text-[10px]", row.is_active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-slate-100 text-slate-500")}>
                          {row.is_active ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {allRows.length > 50 && (
              <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 border-t">
                Showing first 50 rows. Total {allRows.length} rows processed.
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={() => !isImporting && onClose()} disabled={isImporting}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={validRows.length === 0 || isImporting}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8"
          >
            {isImporting ? (
               <>Processing Import...</>
            ) : (
               `Import ${validRows.length} Routes`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}