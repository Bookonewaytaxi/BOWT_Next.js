import React from 'react';
import { motion } from 'framer-motion';

export default function AboutHero() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1702367062977-ee588c7673f2?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury Taxi Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0F1419]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1419] via-transparent to-[#0F1419]/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight font-serif"
        >
          About <span className="text-[#FFD700]">One-Way Taxi</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-[#E8E8E8] font-light max-w-3xl mx-auto leading-relaxed"
        >
          Your Trusted Partner for <span className="text-[#FFD700] font-medium">Affordable</span> One-Way Travel
        </motion.p>
      </div>
    </div>
  );
}