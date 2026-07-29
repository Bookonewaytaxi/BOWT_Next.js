import React from 'react';
import { motion } from 'framer-motion';
import { Car, Users, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function VehiclePricingCard({ 
  vehicleType, 
  pricePerKm, 
  distance, 
  onPriceChange,
  error 
}) {
  const estimatedFare = distance && pricePerKm ? Math.round(Number(distance) * Number(pricePerKm)) : 0;
  
  const colors = {
    sedan: 'border-blue-500/50 bg-blue-500/5 text-blue-500',
    suv6: 'border-green-500/50 bg-green-500/5 text-green-500',
    suv7: 'border-orange-500/50 bg-orange-500/5 text-orange-500',
    crysta: 'border-purple-500/50 bg-purple-500/5 text-purple-500',
  };

  const theme = colors[vehicleType.typeKey] || colors.sedan;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative rounded-xl border-2 p-4 transition-all duration-300 flex flex-col gap-3",
        theme,
        error ? "border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : ""
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg bg-white/10 backdrop-blur-sm", theme)}>
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100">{vehicleType.name}</h4>
            <div className="flex items-center gap-1 text-xs opacity-80">
              <Users className="w-3 h-3" />
              <span>{vehicleType.seating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mt-2">
        <Label htmlFor={`price-${vehicleType.typeKey}`} className="text-xs uppercase font-bold opacity-70">
          Price Per KM (₹)
        </Label>
        <Input
          id={`price-${vehicleType.typeKey}`}
          type="number"
          min="1"
          placeholder="e.g. 14"
          value={pricePerKm || ''}
          onChange={(e) => onPriceChange(e.target.value)}
          className={cn(
            "h-10 bg-slate-900/50 border-slate-700 text-slate-100 focus:ring-2 focus:ring-offset-0",
            error ? "border-red-500 focus:ring-red-500" : "focus:ring-amber-500"
          )}
        />
        {error && <p className="text-[10px] text-red-400 font-medium">{error}</p>}
      </div>

      <div className="mt-2 pt-3 border-t border-slate-700/30">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium opacity-60">Est. Total Fare</span>
          <span className="font-black text-lg flex items-center">
            <IndianRupee className="w-4 h-4" />
            {estimatedFare.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-[10px] text-right opacity-40">
          ({distance || 0} km × ₹{pricePerKm || 0}/km)
        </p>
      </div>
    </motion.div>
  );
}