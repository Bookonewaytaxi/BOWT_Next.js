import React from 'react';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '@/utils/billingUtils';

export default function PriceBreakdownSection({ 
  baseFare = 0, 
  distance = 0, 
  subtotal = 0, 
  tax = 0, 
  total = 0,
  carType = 'Standard'
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-slate-500" /> Price Breakdown
        </h3>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center space-y-3">
        {/* Base Fare */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Base Fare ({carType})</span>
          <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
        </div>

        {/* Distance (Informational) */}
        {distance > 0 && (
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Estimated Distance</span>
            <span>{distance} km</span>
          </div>
        )}

        <div className="border-t border-dashed border-slate-200 my-1" />

        {/* Subtotal */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">GST (5%)</span>
          <span className="font-medium text-red-600">+{formatCurrency(tax)}</span>
        </div>

        <div className="border-t border-slate-200 my-2" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-800">Total Amount</span>
          <span className="font-black text-xl text-slate-900">{formatCurrency(total)}</span>
        </div>
        
        <p className="text-[10px] text-slate-400 text-right mt-1">
          * Includes Tolls & Driver Allowance
        </p>
      </div>
    </div>
  );
}