import React, { useState, useRef } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { parseRouteFile } from '@/utils/routeImportUtils';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertTriangle, 
  XCircle, Loader2, ArrowRight, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImportRoutesModal({ isOpen, onClose, onImportComplete }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStep, setUploadStep] = useState('select'); // select, preview, processing, summary
  const [progress, setProgress] = useState({ current: 0, total: 0, added: 0, updated: 0, failed: 0 });
  const [failedRows, setFailedRows] = useState([]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile) => {
    setIsProcessing(true);
    try {
      const { data, errors } = await parseRouteFile(selectedFile);
      setParsedData(data);
      setValidationErrors(errors);
      setUploadStep('preview');
    } catch (error) {
      console.error("Parse error:", error);
      alert("Failed to parse file: " + error.message);
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const startImport = async () => {
    setUploadStep('processing');
    setProgress({ current: 0, total: parsedData.length, added: 0, updated: 0, failed: 0 });
    setFailedRows([]);

    let added = 0;
    let updated = 0;
    let failed = 0;
    let newFailedRows = [];

    // Create log entry start
    let logId = null;
    try {
       const { data: logData, error: logError } = await supabase
         .from('route_import_logs')
         .insert([{
            filename: file?.name,
            total_rows: parsedData.length,
            added_count: 0,
            updated_count: 0,
            failed_count: 0,
            details: { status: 'started' }
         }])
         .select('id')
         .single();
       if (!logError && logData) logId = logData.id;
    } catch (e) {
       console.warn("Logging failed", e);
    }

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        // 1. Check if route exists
        // We match by from_city and to_city (case insensitive ideally, but strict for now or normalize)
        // Let's rely on exact string match from excel parser which trimmed strings.
        
        // First, check if exact pair exists
        const { data: existingRoute, error: fetchError } = await supabase
          .from('routes')
          .select('id')
          .ilike('from_city', row.from_city)
          .ilike('to_city', row.to_city)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingRoute) {
          // UPDATE
          const { error: updateError } = await supabase
            .from('routes')
            .update({
              sedan_price: row.sedan_price || undefined,
              suv_price: row.suv_price || undefined,
              crysta_price: row.crysta_price || undefined,
              distance: row.distance || undefined,
              // don't update slug to preserve SEO if it exists
            })
            .eq('id', existingRoute.id);

          if (updateError) throw updateError;
          updated++;
        } else {
          // INSERT
          const { error: insertError } = await supabase
            .from('routes')
            .insert([{
              from_city: row.from_city,
              to_city: row.to_city,
              slug: row.slug,
              sedan_price: row.sedan_price,
              suv_price: row.suv_price,
              crysta_price: row.crysta_price,
              distance: row.distance,
              description: `One way taxi from ${row.from_city} to ${row.to_city}`
            }]);

          if (insertError) throw insertError;
          added++;
        }
      } catch (err) {
        console.error("Row Import Error:", err);
        failed++;
        newFailedRows.push({ ...row, error: err.message });
      }

      // Update stats state periodically
      setProgress(prev => ({ ...prev, added, updated, failed }));
    }

    // Final Log Update
    if (logId) {
       await supabase.from('route_import_logs').update({
          added_count: added,
          updated_count: updated,
          failed_count: failed,
          details: { 
             failed_rows: newFailedRows,
             validation_errors: validationErrors
          }
       }).eq('id', logId);
    }

    setFailedRows(newFailedRows);
    setUploadStep('summary');
    if (onImportComplete) onImportComplete();
  };

  const resetModal = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setUploadStep('select');
    setProgress({ current: 0, total: 0, added: 0, updated: 0, failed: 0 });
    setFailedRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    if (uploadStep === 'processing') return; // Prevent closing during import
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#1e293b] text-slate-100 border-slate-700 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="h-6 w-6 text-green-500" />
            Import Routes
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload an Excel or CSV file to bulk import or update routes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {uploadStep === 'select' && (
            <div 
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-amber-500 hover:bg-slate-800/50 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
              />
              <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 {isProcessing ? <Loader2 className="h-8 w-8 text-amber-500 animate-spin" /> : <Upload className="h-8 w-8 text-slate-400 group-hover:text-amber-500" />}
              </div>
              <p className="text-lg font-bold text-slate-200">Click to upload file</p>
              <p className="text-sm text-slate-500 mt-2">Supports .xlsx, .xls, .csv</p>
              <p className="text-xs text-slate-600 mt-4 max-w-xs">
                Expected columns: Start City, End City, Sedan, Suv/Ertiga, Crysta, Km count
              </p>
            </div>
          )}

          {uploadStep === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
                 <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                    <div>
                       <p className="font-bold text-sm text-white">{file?.name}</p>
                       <p className="text-xs text-slate-400">{(file?.size / 1024).toFixed(2)} KB • {parsedData.length} valid rows found</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="sm" onClick={resetModal} className="text-slate-400 hover:text-white">Change</Button>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
                   <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationErrors.length} Rows skipped due to errors
                   </div>
                   <div className="max-h-24 overflow-y-auto text-xs text-red-300 space-y-1 pl-6">
                      {validationErrors.map((e, idx) => (
                         <div key={idx}>Row {e.row}: {e.error}</div>
                      ))}
                   </div>
                </div>
              )}

              <div className="border border-slate-700 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                 <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase sticky top-0">
                       <tr>
                          <th className="p-3">From</th>
                          <th className="p-3">To</th>
                          <th className="p-3">Sedan</th>
                          <th className="p-3">SUV</th>
                          <th className="p-3">Crysta</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                       {parsedData.slice(0, 50).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/50">
                             <td className="p-3 text-slate-300">{row.from_city}</td>
                             <td className="p-3 text-slate-300">{row.to_city}</td>
                             <td className="p-3 font-mono text-amber-500">{row.sedan_price}</td>
                             <td className="p-3 font-mono text-amber-500">{row.suv_price}</td>
                             <td className="p-3 font-mono text-amber-500">{row.crysta_price}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {parsedData.length > 50 && (
                    <div className="p-2 text-center text-xs text-slate-500 bg-slate-800/30">
                       And {parsedData.length - 50} more rows...
                    </div>
                 )}
              </div>
            </div>
          )}

          {uploadStep === 'processing' && (
             <div className="text-center py-8">
                <div className="mb-4 relative h-4 w-full bg-slate-700 rounded-full overflow-hidden">
                   <motion.div 
                     className="absolute left-0 top-0 bottom-0 bg-amber-500"
                     initial={{ width: 0 }}
                     animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                   />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Processing Import...</h3>
                <p className="text-slate-400 text-sm mb-6">Processing row {progress.current} of {progress.total}</p>
                
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                   <div className="bg-slate-800 p-3 rounded border border-slate-700">
                      <div className="text-2xl font-black text-green-500">{progress.added}</div>
                      <div className="text-xs text-slate-500 uppercase">Added</div>
                   </div>
                   <div className="bg-slate-800 p-3 rounded border border-slate-700">
                      <div className="text-2xl font-black text-blue-500">{progress.updated}</div>
                      <div className="text-xs text-slate-500 uppercase">Updated</div>
                   </div>
                   <div className="bg-slate-800 p-3 rounded border border-slate-700">
                      <div className="text-2xl font-black text-red-500">{progress.failed}</div>
                      <div className="text-xs text-slate-500 uppercase">Failed</div>
                   </div>
                </div>
             </div>
          )}

          {uploadStep === 'summary' && (
             <div className="text-center py-4">
                <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Import Completed</h3>
                <p className="text-slate-400 text-sm mb-6">
                   Successfully processed {progress.added + progress.updated} routes.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                   <div className="text-green-400 flex flex-col items-center">
                      <span className="font-bold text-xl">{progress.added}</span> New Routes
                   </div>
                   <div className="text-blue-400 flex flex-col items-center">
                      <span className="font-bold text-xl">{progress.updated}</span> Updated
                   </div>
                   <div className="text-red-400 flex flex-col items-center">
                      <span className="font-bold text-xl">{progress.failed}</span> Failed
                   </div>
                </div>

                {(failedRows.length > 0 || validationErrors.length > 0) && (
                   <div className="bg-slate-800/50 rounded-lg p-4 text-left border border-slate-700 max-h-48 overflow-y-auto">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 sticky top-0 bg-slate-800/90 py-1">Error Log</h4>
                      <div className="space-y-1 text-xs font-mono">
                         {failedRows.map((row, i) => (
                            <div key={`fail-${i}`} className="text-red-400">
                               <span className="text-slate-500">{row.from_city}-{row.to_city}:</span> {row.error}
                            </div>
                         ))}
                         {validationErrors.map((err, i) => (
                            <div key={`val-${i}`} className="text-amber-500">
                               <span className="text-slate-500">Row {err.row}:</span> {err.error}
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          )}
        </div>

        <DialogFooter>
          {uploadStep === 'preview' && (
             <div className="flex w-full gap-2">
                <Button variant="outline" onClick={resetModal} className="flex-1 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">Cancel</Button>
                <Button onClick={startImport} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                   <Save className="h-4 w-4 mr-2" /> Start Import
                </Button>
             </div>
          )}
          {uploadStep === 'summary' && (
             <Button onClick={handleClose} className="w-full bg-slate-700 hover:bg-slate-600">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}