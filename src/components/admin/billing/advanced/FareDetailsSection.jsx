import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/billingUtils';

export default function FareDetailsSection({ 
  data, 
  onChange, 
  isEditable,
  errors = {}
}) {
  const bookingAmount = Number(data.booking_amount) || 0;
  const manualFare = Number(data.manual_fare) || 0;
  
  // Validation check
  const isInvalidManualFare = manualFare > 0 && manualFare < bookingAmount;

  return (
    <div className="mb-5 p-4 border border-slate-200 rounded-md bg-slate-50/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-500" /> Fare Calculation
        </h3>
      </div>

      <div className="space-y-6">
        {/* Original Booking Amount */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Booking Amount</span>
            <span className="text-xs text-slate-400">Original price from booking</span>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="text-slate-500 font-mono">Original</Badge>
             <span className="text-lg font-medium text-slate-700">{formatCurrency(bookingAmount)}</span>
          </div>
        </div>

        {/* Manual Override */}
        <div className={`flex justify-between items-start bg-white p-3 rounded-lg border ${isInvalidManualFare || errors.manual_fare ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'}`}>
           <div className="flex flex-col flex-1 mr-4">
             <Label htmlFor="manual_fare" className="text-sm font-medium text-slate-900">Override Amount (Optional)</Label>
             <span className="text-xs text-slate-400">If set, this replaces the booking amount.</span>
             
             {(isInvalidManualFare || errors.manual_fare) && (
               <div className="flex items-start gap-1 mt-1 text-red-600">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span className="text-xs font-medium leading-tight">
                    {errors.manual_fare || `Cannot be less than booking amount (${formatCurrency(bookingAmount)})`}
                  </span>
               </div>
             )}
           </div>
           
           {isEditable ? (
             <Input 
                id="manual_fare"
                type="number" 
                value={manualFare || ''}
                onChange={(e) => onChange('manual_fare', e.target.value)}
                className={`w-32 text-right font-mono ${isInvalidManualFare ? "border-red-500 text-red-600" : ""}`}
                placeholder="0"
             />
           ) : (
             <span className="text-lg font-medium text-slate-900">{manualFare > 0 ? formatCurrency(manualFare) : '-'}</span>
           )}
        </div>

        {/* GST Toggle */}
        <div className="flex justify-between items-center py-2">
           <div className="flex items-center space-x-2">
              <Checkbox 
                id="add_gst" 
                checked={data.add_gst}
                onCheckedChange={(checked) => isEditable && onChange('add_gst', checked)}
                disabled={!isEditable}
              />
              <label
                htmlFor="add_gst"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Add GST Invoice (5%)
              </label>
           </div>
           {data.add_gst && (
             <span className="text-red-600 font-medium">+{formatCurrency(data.gst_amount)}</span>
           )}
        </div>

        <div className="border-t border-slate-200 my-4"></div>

        {/* Total */}
        <div className="flex justify-between items-center">
           <span className="text-xl font-bold text-slate-900">TOTAL PAYABLE</span>
           <div className="flex flex-col items-end">
             <span className="text-2xl font-black text-amber-600 tracking-tight">{formatCurrency(data.total_payable)}</span>
             {data.final_fare > 0 && (
                <span className="text-xs text-slate-400">Base: {formatCurrency(data.final_fare)}</span>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}