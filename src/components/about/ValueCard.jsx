import React from 'react';
import { motion } from 'framer-motion';

export default function ValueCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="bg-[#161B22] p-8 rounded-2xl border border-white/5 hover:border-[#FFD700] transition-all duration-300 group shadow-lg hover:shadow-[#FFD700]/10 flex flex-col h-full items-center text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-6 group-hover:bg-[#FFD700] transition-colors duration-300">
        <Icon className="w-8 h-8 text-[#FFD700] group-hover:text-[#0F1419] transition-colors duration-300" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#FFD700] transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}