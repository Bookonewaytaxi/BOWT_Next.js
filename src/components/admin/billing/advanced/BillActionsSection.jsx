import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle, Download, Share2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function BillActionsSection({ 
  onSaveDraft, 
  onFinalize, 
  onDownload, 
  onWhatsApp, 
  isDraft,
  loading 
}) {
  return (
    <div className="mb-0 p-4 border border-slate-200 rounded-md bg-slate-50 flex flex-col sm:flex-row justify-end gap-3 border-t">
      {isDraft && (
        <>
          <Button 
            variant="outline" 
            onClick={onSaveDraft} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
          <Button 
            variant="default" 
            className="bg-slate-900 text-white hover:bg-slate-800 w-full sm:w-auto" 
            onClick={onFinalize}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Finalize Bill
          </Button>
        </>
      )}

      <div className="h-6 w-px bg-slate-300 hidden sm:block mx-2 self-center"></div>

      <Button 
        variant="outline" 
        className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={onDownload}
        disabled={loading}
      >
        <Download className="w-4 h-4 mr-2" />
        Download PDF
      </Button>

      <Button 
        variant="outline" 
        className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50"
        onClick={onWhatsApp}
        disabled={loading}
      >
        <Share2 className="w-4 h-4 mr-2" />
        WhatsApp
      </Button>
    </div>
  );
}