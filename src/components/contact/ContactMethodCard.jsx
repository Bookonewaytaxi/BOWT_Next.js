import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ContactMethodCard({ icon: Icon, title, info, buttonText, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-[#161B22] p-8 rounded-xl border border-white/5 hover:border-[#FFD700] transition-all duration-300 group shadow-lg hover:shadow-[#FFD700]/20 flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-6 group-hover:bg-[#FFD700] transition-colors duration-300">
        <Icon className="w-8 h-8 text-[#FFD700] group-hover:text-[#0F1419] transition-colors duration-300" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 font-medium text-sm md:text-base">{info}</p>
      
      <Button 
        onClick={onClick}
        variant="outline"
        className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0F1419] font-bold w-full rounded-full transition-all"
      >
        {buttonText}
      </Button>
    </motion.div>
  );
}