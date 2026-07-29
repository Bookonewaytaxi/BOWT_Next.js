import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255, 215, 0, 0.1)" }}
      className="bg-[#161B22] p-8 rounded-xl border border-white/5 hover:border-[#FFD700]/50 transition-all duration-300 flex flex-col items-start h-full"
    >
      <div className="bg-[#0A0D11] p-3 rounded-lg mb-6 border border-white/10 group-hover:border-[#FFD700]/30 transition-colors">
        <Icon className="w-8 h-8 text-[#FFD700]" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}