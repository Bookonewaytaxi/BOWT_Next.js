import React, { useState, useRef } from 'react';
import { Upload, Download, Loader2, FileSpreadsheet, AlertCircle, CheckCircle, FileWarning, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseFile } from '@/utils/RouteImportProcessor';
import { validateRouteData } from '@/utils/RouteImportService';

export default function RouteImportModal({ isOpen, onClose, onImportComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFile = (selectedFile) => {
    setError(null);
    setValidationErrors([]);
    const ext = String(selectedFile.name || '').split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Invalid file type. Please upload .csv, .xlsx, or .xls');
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File is larger than 25 MB. Please split the route sheet into smaller files.');
      return;
    }
    setFile(selectedFile);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setValidationErrors([]);
    setError(null);

    try {
      const result = await parseFile(file);
      const rows = result.data || [];
      const validation = validateRouteData(rows);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      await onImportComplete({ data: rows, errors: result.errors }, file.name);
      setFile(null);
    } catch (err) {
      setError(err.message || 'Failed to process file');
      console.error('[RouteImportModal] process error', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'pickup_city',
      'drop_city',
      'distance_km',
      'sedan_price',
      'ertiga_price',
      'carens_price',
      'innova_price'
    ].join(',');

    const rows = [
      'Ahmedabad,Vadodara,110,1800,2400,3000,3800',
      'Anand,Ahmedabad,80,1400,1900,2400,3000',
      'Rajkot,Ahmedabad,215,3000,4000,5200,6500'
    ].join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'routes_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Import Routes</DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload a CSV or Excel route sheet. The importer accepts the canonical route columns and older column aliases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <div className="bg-blue-950/20 border border-blue-900/40 p-4 rounded-lg text-sm text-slate-300 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-3 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase mb-2 tracking-wider">Required Columns</p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {['pickup_city', 'drop_city', 'distance_km', 'sedan_price', 'ertiga_price', 'carens_price', 'innova_price'].map((item) => (
                        <li key={item} className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" />{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Optional Columns</p>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {['status', 'seo_title', 'seo_description', 'seo_keywords', 'seo_content', 'description'].map((item) => (
                        <li key={item} className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-600 rounded-full" />{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-900/20 rounded p-3 border border-blue-900/30">
                  <p className="text-xs text-blue-200 font-medium mb-1 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-blue-400" />
                    Do NOT include a slug column
                  </p>
                  <p className="text-xs text-blue-300/80 pl-5">
                    The importer generates the canonical slug automatically, for example:
                    <span className="font-mono text-amber-300 ml-1">ahmedabad-to-vadodara-taxi</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!validationErrors.length && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative group ${
                dragActive ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-950'
              } ${file ? 'border-green-500 bg-green-500/5' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleChange}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet className="w-12 h-12 text-green-500 mb-3" />
                  <p className="font-medium text-green-400">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/30"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setValidationErrors([]); }}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-slate-500 mb-3 group-hover:text-slate-400" />
                  <p className="font-medium text-slate-300">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">CSV, XLSX or XLS · max 25 MB · up to 25,000 rows</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-950/20 border border-red-900/50 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="bg-red-950/10 border border-red-900/30 rounded-lg overflow-hidden flex flex-col max-h-[300px]">
              <div className="bg-red-900/20 p-3 border-b border-red-900/30 flex items-center justify-between sticky top-0 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  <FileWarning className="w-4 h-4" />
                  Validation Failed ({validationErrors.length} errors)
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setValidationErrors([]); }} className="h-6 text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300">
                  Clear & Retry
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <ul className="space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="text-xs text-red-300 flex items-start gap-2 py-1 px-2 rounded hover:bg-red-900/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      {err}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs">
              <Download className="w-3 h-3 mr-2" /> Template
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} disabled={loading} className="text-slate-400 hover:text-white">Cancel</Button>
              <Button onClick={handleProcess} disabled={!file || loading || validationErrors.length > 0} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold min-w-[120px]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? 'Importing...' : 'Start Import'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
