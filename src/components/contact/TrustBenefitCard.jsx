import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function TrustBenefitCard({ icon: Icon, title, subtitle, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#161B22] p-6 rounded-xl border border-white/5 hover:border-[#FFD700] transition-all duration-300 group shadow-lg hover:shadow-[#FFD700]/10 flex gap-4"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center group-hover:bg-[#FFD700] transition-colors duration-300">
          <Icon className="w-6 h-6 text-[#FFD700] group-hover:text-[#0F1419] transition-colors duration-300" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FFD700] transition-colors">{title}</h3>
        <p className="text-[#FFD700] text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> {subtitle}
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}