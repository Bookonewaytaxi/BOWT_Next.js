import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { parseExcelFile } from '@/utils/excelImportUtils';
import { cn } from '@/lib/utils';

export default function BulkImportModal({ isOpen, onClose, onFileProcessed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;

    // Check size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return false;
    }

    // Check extension
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = selectedFile.name.toLowerCase();
    if (!validExtensions.some(ext => fileName.endsWith(ext))) {
      setError("Invalid file type. Please upload .xlsx, .xls, or .csv");
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const result = await parseExcelFile(file);
      onFileProcessed(result);
      // Reset state and close is handled by parent or by success
      setFile(null);
    } catch (err) {
      setError("Failed to parse file. Please ensure it's a valid Excel/CSV file with correct columns.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle>Bulk Import Routes</DialogTitle>
          <DialogDescription>
             Upload Excel file (.xlsx, .xls, .csv). <br/>
             <span className="text-xs text-slate-500 mt-2 block">
               <strong>Required Columns (in order):</strong><br/>
               A: From City, B: To City, C: Distance (km), D: Sedan ₹, E: SUV/Ertiga ₹, F: Carens ₹, G: Crysta ₹, H: Is Active (Optional)
             </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[200px]",
                isDragging ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-amber-500 hover:bg-slate-50",
                error ? "border-red-200 bg-red-50" : ""
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
              />
              <Upload className={cn("w-10 h-10 mb-4", isDragging ? "text-amber-500" : "text-slate-400")} />
              <p className="font-bold text-slate-700">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-400 mt-1">XLSX, XLS or CSV (max 5MB)</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile} className="hover:bg-slate-200">
                  <X className="w-4 h-4 text-slate-500" />
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={processFile} 
            disabled={!file || processing}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              'Preview Import'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}