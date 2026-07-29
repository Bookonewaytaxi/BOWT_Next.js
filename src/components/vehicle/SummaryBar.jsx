import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, IndianRupee, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VehicleImage from './VehicleImage';

export default function SummaryBar({ 
  route, 
  selectedVehicle, 
  totalFare, 
  onContinue,
  className 
}) {
  const marketPrice = totalFare ? Math.round(totalFare * 1.35) : 0;
  const savings = marketPrice - totalFare;

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      <div className="container mx-auto max-w-6xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Mobile: Simple Route */}
          <div className="flex md:hidden flex-col">
             <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                <span className="truncate max-w-[80px]">{route?.from_city}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[80px]">{route?.to_city}</span>
             </div>
             {selectedVehicle ? (
                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                   <span className="font-bold text-amber-600">{selectedVehicle.name.split(' ')[0]}</span> • {selectedVehicle.seating_capacity} Seats
                </div>
             ) : (
                <div className="text-[10px] text-slate-400 italic">Select a vehicle</div>
             )}
          </div>

          {/* Desktop: Full Info */}
          <div className="hidden md:flex items-center gap-6">
             <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                   <MapPin className="w-4 h-4 text-amber-500" />
                   {route?.from_city} <ArrowRight className="w-3 h-3 text-slate-300" /> {route?.to_city}
                </div>
                <div className="text-xs text-slate-400 pl-6">{route?.distance}</div>
             </div>
             
             {selectedVehicle && (
                <div className="h-10 w-[1px] bg-slate-200"></div>
             )}

             <AnimatePresence mode="wait">
                {selectedVehicle && (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 10 }}
                     className="flex items-center gap-3"
                   >
                      <div className="w-20 h-14 rounded-md overflow-hidden border border-slate-100 shadow-sm">
                         <VehicleImage 
                            src={selectedVehicle.image_url} 
                            alt={selectedVehicle.name} 
                            containerClassName="w-full h-full"
                         />
                      </div>
                      <div>
                         <div className="font-bold text-slate-900 text-sm">{selectedVehicle.name}</div>
                         <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {selectedVehicle.seating_capacity} Seater
                         </div>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Price & Action */}
          <div className="flex items-center gap-3 md:gap-6 ml-auto">
             <AnimatePresence mode="wait">
                {selectedVehicle ? (
                   <motion.div 
                     key="price"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-right"
                   >
                      <div className="text-[10px] md:text-xs text-slate-400 line-through">₹{marketPrice}</div>
                      <div className="flex items-center justify-end text-xl md:text-3xl font-black text-slate-900 leading-none">
                         <IndianRupee className="w-4 h-4 md:w-6 md:h-6" />{totalFare}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-green-600 font-bold uppercase">You Save ₹{savings}</div>
                   </motion.div>
                ) : (
                   <div className="hidden md:block text-slate-400 text-sm italic pr-4">
                      Total fare will appear here
                   </div>
                )}
             </AnimatePresence>
             
             <Button 
                onClick={onContinue}
                disabled={!selectedVehicle}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-6 md:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none"
             >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
             </Button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}