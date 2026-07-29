import React from 'react';
import { Users, Snowflake, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VehicleImage from '@/components/vehicle/VehicleImage';
import PriceDisplay from '@/components/common/PriceDisplay';
import { motion } from 'framer-motion';

export default function VehicleCard({ vehicle, price, isSelected, onSelect }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col h-full",
        isSelected 
          ? "border-amber-500 shadow-xl ring-2 ring-amber-500/20" 
          : "border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-200"
      )}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Check className="w-3 h-3" /> SELECTED
        </div>
      )}

      {/* Image Section */}
      <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden group">
        <VehicleImage 
          src={vehicle.image_url} 
          alt={vehicle.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          containerClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-60" />
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-bold text-lg leading-tight">{vehicle.name}</h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Features */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
            <Users className="w-3.5 h-3.5" />
            {vehicle.capacity} Seater
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
            <Snowflake className="w-3.5 h-3.5" />
            AC
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50">
          <div className="flex justify-between items-end mb-4">
            <PriceDisplay ourPrice={price} />
          </div>

          <Button 
            onClick={() => onSelect(vehicle)}
            className={cn(
              "w-full font-bold transition-all",
              isSelected 
                ? "bg-amber-500 hover:bg-amber-600 text-white" 
                : "bg-slate-900 hover:bg-slate-800 text-white"
            )}
          >
            {isSelected ? 'Vehicle Selected' : 'Select Vehicle'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}