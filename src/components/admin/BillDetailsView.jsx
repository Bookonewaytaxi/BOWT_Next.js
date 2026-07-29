import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Send } from 'lucide-react';
import BillTemplate from './BillTemplate';
import { useBills } from '@/hooks/useBills';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BillEditButton from './billing/BillEditButton';
import BillDownloadButton from './billing/BillDownloadButton';
import BillWhatsAppButton from './billing/BillWhatsAppButton';

export default function BillDetailsView({ bill: initialBill, onSendEmail, sending, onBack }) {
  const { updateBillStatus } = useBills();
  const [bill, setBill] = useState(initialBill);
  const [currentStatus, setCurrentStatus] = useState(initialBill?.status || 'Generated');

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus) => {
    await updateBillStatus(bill.id, newStatus);
    setCurrentStatus(newStatus);
    setBill(prev => ({ ...prev, status: newStatus }));
  };
  
  const handleBillUpdated = (updatedBill) => {
    setBill(updatedBill);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Control Bar - Hidden on Print */}
      <div className="bg-white border-b border-slate-200 p-4 flex flex-col xl:flex-row justify-between items-center gap-4 shadow-sm sticky top-0 z-10 no-print">
         <div className="flex items-center gap-3 w-full xl:w-auto">
            {onBack && (
               <Button variant="ghost" size="icon" onClick={onBack}>
                  <ArrowLeft className="h-5 w-5 text-slate-500" />
               </Button>
            )}
            <h2 className="font-bold text-slate-700">Invoice: {bill.bill_number}</h2>
         </div>
         
         <div className="flex items-center gap-2 w-full xl:w-auto justify-end flex-wrap">
            <BillEditButton bill={bill} onBillUpdated={handleBillUpdated} />
            
            <Select value={currentStatus} onValueChange={handleStatusChange}>
               <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Generated">Generated</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
               </SelectContent>
            </Select>

            <BillDownloadButton bill={bill} />
            <BillWhatsAppButton bill={bill} />

            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
               <Printer className="h-4 w-4" /> Print
            </Button>
            
            {onSendEmail && (
               <Button onClick={onSendEmail} disabled={sending} size="sm" className="gap-2 bg-navy hover:bg-slate-800 text-white">
                  <Send className="h-4 w-4" /> {sending ? 'Sending...' : (currentStatus === 'Sent' ? 'Resend Email' : 'Send Email')}
               </Button>
            )}
         </div>
      </div>

      {/* Bill Content with Scroll Container */}
      <div className="flex-1 p-4 md:p-8 overflow-hidden">
         <div className="bill-details-scroll-container">
            <div className="shadow-2xl max-w-4xl mx-auto bg-white">
               <BillTemplate bill={{ ...bill, status: currentStatus }} />
            </div>
         </div>
      </div>
    </div>
  );
}