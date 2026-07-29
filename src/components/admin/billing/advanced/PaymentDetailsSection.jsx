import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';

export default function PaymentDetailsSection({ 
  data, 
  onChange, 
  isEditable,
  errors = {}
}) {
  return (
    <div className="mb-5 p-4 border border-slate-200 rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-500" /> Payment Details
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Payment Mode</Label>
          {isEditable ? (
            <Select 
              value={data.payment_mode || 'Cash'} 
              onValueChange={(val) => onChange('payment_mode', val)}
            >
              <SelectTrigger className={errors.payment_mode ? "border-red-500" : ""}>
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2">{data.payment_mode || 'Cash'}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Payment Status</Label>
          {isEditable ? (
             <Select 
              value={data.payment_status || 'Pending'} 
              onValueChange={(val) => onChange('payment_status', val)}
            >
              <SelectTrigger className={errors.payment_status ? "border-red-500" : ""}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              data.payment_status === 'Completed' ? 'bg-green-100 text-green-800' : 
              data.payment_status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {data.payment_status || 'Pending'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}