import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ServiceCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#161B22] p-8 rounded-2xl border border-white/5 hover:border-[#FFD700]/50 transition-all duration-300 group shadow-lg hover:shadow-xl hover:shadow-[#FFD700]/10 flex flex-col h-full"
    >
      <div className="w-14 h-14 rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-6 group-hover:bg-[#FFD700] transition-colors duration-300">
        <Icon className="w-7 h-7 text-[#FFD700] group-hover:text-[#0F1419] transition-colors duration-300" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed mb-6 flex-grow">{description}</p>
      
      <div className="flex items-center text-[#FFD700] font-medium text-sm gap-2 cursor-pointer group-hover:underline underline-offset-4">
        <span>Learn More</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
}