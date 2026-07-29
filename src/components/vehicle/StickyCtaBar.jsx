import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StickyCtaBar({ selectedVehicle, onContinue }) {
  return (
    <AnimatePresence>
      {selectedVehicle && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 md:hidden z-50"
        >
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Selected</p>
              <h4 className="text-sm font-bold text-slate-900">{selectedVehicle.name}</h4>
            </div>
            <div className="text-right">
              <span className="block text-xl font-black text-[#d4af37]">₹{selectedVehicle.price}</span>
            </div>
          </div>
          
          <Button 
            onClick={onContinue}
            className="w-full h-14 text-lg font-bold uppercase tracking-wider bg-gold-gradient text-white hover:opacity-90 transition-opacity shadow-lg"
          >
            Continue to Booking <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <div className="flex justify-center items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
             <MessageCircle className="w-3 h-3" />
             Instant WhatsApp confirmation
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}