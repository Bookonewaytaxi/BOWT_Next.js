import React from 'react';
import { CreditCard, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPaymentStatus, getStatusColor, formatDateTime } from '@/utils/billingUtils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PaymentDetailsSection({ 
  status = 'pending', 
  method = 'Cash', 
  transactionId, 
  date, 
  amountPaid = 0, 
  totalAmount = 0 
}) {
  const remaining = Math.max(0, totalAmount - amountPaid);
  
  const getStatusIcon = (s) => {
    const statusLower = s?.toLowerCase() || 'pending';
    if (statusLower === 'paid' || statusLower === 'completed' || statusLower === 'success') return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
    if (statusLower === 'failed') return <XCircle className="w-3.5 h-3.5 mr-1" />;
    return <Clock className="w-3.5 h-3.5 mr-1" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-500" /> Payment Details
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Status</span>
          <Badge variant="outline" className={cn("pl-2 pr-3 py-1 border-0 flex items-center", getStatusColor(status))}>
            {getStatusIcon(status)}
            {formatPaymentStatus(status)}
          </Badge>
        </div>

        {/* Payment Method */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Payment Method</span>
          <span className="font-medium text-slate-900">{method || 'Not Specified'}</span>
        </div>

        {/* Transaction ID */}
        {transactionId && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Transaction Ref</span>
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{transactionId}</span>
          </div>
        )}

        {/* Date */}
        {date && (
           <div className="flex justify-between items-center text-sm">
             <span className="text-slate-600">Payment Date</span>
             <span className="text-slate-900">{formatDateTime(date)}</span>
           </div>
        )}

        <div className="border-t border-slate-100 my-2" />

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs text-green-700 font-medium uppercase mb-1">Paid</p>
            <p className="text-lg font-bold text-green-800">{formatCurrency(amountPaid)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
             <p className="text-xs text-slate-500 font-medium uppercase mb-1 flex items-center gap-1">
               Remaining {remaining > 0 && <AlertCircle className="w-3 h-3 text-amber-500" />}
             </p>
             <p className="text-lg font-bold text-slate-800">{formatCurrency(remaining)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}