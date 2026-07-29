import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Snowflake, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FleetCard({ image, name, tagline, features, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="bg-[#161B22] rounded-2xl overflow-hidden border border-white/10 hover:border-[#FFD700]/50 shadow-xl group flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden bg-[#0A0D11]">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161B22] to-transparent opacity-80" />
        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl font-bold text-white">{name}</h3>
          <p className="text-[#FFD700] text-sm font-medium tracking-wide uppercase">{tagline}</p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-400 text-sm">
              <CheckCircle className="w-4 h-4 text-[#FFD700]" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={() => window.location.href='/booking'}
          className="w-full mt-auto bg-[#FFD700] hover:bg-[#E5C100] text-[#0F1419] font-bold"
        >
          Book Now
        </Button>
      </div>
    </motion.div>
  );
}