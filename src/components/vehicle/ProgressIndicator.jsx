import React from 'react';
import { motion } from 'framer-motion';
import { Check, Car, MapPin, User, CheckCircle } from 'lucide-react';

export default function ProgressIndicator({ currentStep = 2 }) {
  const steps = [
    { id: 1, label: 'Route', icon: MapPin },
    { id: 2, label: 'Vehicle', icon: Car },
    { id: 3, label: 'Details', icon: User },
    { id: 4, label: 'Confirm', icon: CheckCircle },
  ];

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-4">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="relative flex justify-between items-center">
          
          {/* Connecting Line - Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full -z-10" />
          
          {/* Connecting Line - Active Progress */}
          <motion.div 
            className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full -z-10"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <motion.div 
                  className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isActive ? 'bg-white border-[#d4af37] text-[#d4af37] shadow-gold-glow' : ''}
                    ${!isCompleted && !isActive ? 'bg-white border-slate-200 text-slate-300' : ''}
                  `}
                  initial={false}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-4 h-4 md:w-5 md:h-5" />}
                </motion.div>
                <span className={`
                  text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-300
                  ${isActive ? 'text-[#d4af37]' : isCompleted ? 'text-green-600' : 'text-slate-400'}
                `}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}