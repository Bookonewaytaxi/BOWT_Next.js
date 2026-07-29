import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function VehicleImage({ 
  src, 
  alt, 
  className,
  containerClassName 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state if src changes
  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", containerClassName)}>
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <Skeleton className="w-full h-full bg-slate-200" />
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
               <Car className="w-8 h-8 opacity-20 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasError ? (
        <img
          src={src}
          alt={alt || "Vehicle Image"}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-out",
            isLoading ? "scale-105 blur-sm" : "scale-100 blur-0",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-center">Image Not Available</span>
        </div>
      )}
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent opacity-50" />
    </div>
  );
}