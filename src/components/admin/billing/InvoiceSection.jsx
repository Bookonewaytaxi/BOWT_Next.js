import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/billingUtils';
import BillDownloadButton from './BillDownloadButton';
import BillEditButton from './BillEditButton';
import BillWhatsAppButton from './BillWhatsAppButton';

export default function InvoiceSection({ 
  invoiceNumber, 
  invoiceDate, 
  status = 'Pending', 
  bill,
  onBillUpdated,
  hasBill = false
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" /> Invoice Actions
        </h3>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-4">
        {hasBill ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">Invoice #</p>
                <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">Date</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{formatDate(invoiceDate)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded text-xs text-slate-600">
              <span className={`w-2 h-2 rounded-full ${status === 'Sent' ? 'bg-green-500' : 'bg-amber-500'}`} />
              Status: <span className="font-medium">{status}</span>
            </div>

            <div className="mt-auto space-y-2">
               <div className="grid grid-cols-2 gap-2">
                 <BillEditButton bill={bill} onBillUpdated={onBillUpdated} className="w-full" />
                 <BillDownloadButton bill={bill} className="w-full bg-blue-600 hover:bg-blue-700 text-white" />
               </div>
               <BillWhatsAppButton bill={bill} className="w-full" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center h-full">
            <div className="bg-amber-50 text-amber-500 p-3 rounded-full mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-800">No Invoice Generated</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Generate a bill to enable invoice actions.</p>
          </div>
        )}
      </div>
    </div>
  );
}