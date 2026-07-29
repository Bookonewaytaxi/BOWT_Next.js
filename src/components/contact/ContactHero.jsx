import React from 'react';
import { motion } from 'framer-motion';

export default function ContactHero() {
  return (
    <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-[#0F1419]">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2070&auto=format&fit=crop" 
          alt="Contact Support Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1419] via-[#0F1419]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1419]/90 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight font-serif">
            Contact <span className="text-[#FFD700]">Us</span>
          </h1>
          
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-[#FFD700] mb-8"
          />

          <p className="text-lg md:text-2xl text-[#E8E8E8] font-light max-w-2xl leading-relaxed">
            We're here to help. Get your <span className="text-[#FFD700] font-medium">one-way taxi quote</span> now.
          </p>
        </motion.div>
      </div>
    </div>
  );
}