import React from 'react';
import { IndianRupee, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function StickyBookingSummary({ route, vehicle, price, onContinue, disabled }) {
  if (!route || !vehicle || !price) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
             {route.from_city} <ArrowRight className="w-3 h-3" /> {route.to_city}
          </div>
          <div className="font-bold text-slate-900 truncate">
            {vehicle.name}
          </div>
          <div className="font-black text-lg text-slate-900 flex items-center">
            <IndianRupee className="w-4 h-4" /> {price.toLocaleString()}
          </div>
        </div>
        <Button 
          onClick={onContinue} 
          disabled={disabled}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shrink-0"
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
}