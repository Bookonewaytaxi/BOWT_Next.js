import React from 'react';
import { IndianRupee, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PriceDisplay({ ourPrice, className, showSavings = true }) {
  if (!ourPrice) return null;

  const marketPrice = Math.round(ourPrice * 1.35);
  const savings = marketPrice - ourPrice;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
        <span className="line-through flex items-center">
          <IndianRupee className="w-3 h-3" />{marketPrice}
        </span>
        <span className="text-red-400 font-medium">Market Price</span>
      </div>
      
      <div className="flex items-center gap-1 text-2xl font-black text-slate-900">
        <IndianRupee className="w-5 h-5 mt-0.5" />
        {ourPrice.toLocaleString()}
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">
          Our Price
        </span>
      </div>

      {showSavings && (
        <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold mt-1">
          <Tag className="w-4 h-4" />
          Save ₹{savings.toLocaleString()}
        </div>
      )}
    </div>
  );
}