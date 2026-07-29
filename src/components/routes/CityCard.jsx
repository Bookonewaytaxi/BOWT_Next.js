import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { slugify } from '@/lib/utils';

export default function CityCard({ cityName, count }) {
  return (
    <Link href={`/routes/city/${slugify(cityName)}`}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#161B22] border border-[#2F3336] hover:border-[#FFD700] rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/10 h-full flex flex-col items-center justify-center text-center group cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-[#0A0D11] border border-[#2F3336] flex items-center justify-center mb-4 group-hover:border-[#FFD700] transition-colors">
          <MapPin className="w-6 h-6 text-gray-400 group-hover:text-[#FFD700] transition-colors" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">
          {cityName}
        </h3>
        <span className="text-sm font-medium text-gray-400 bg-[#0A0D11] px-3 py-1 rounded-full border border-[#2F3336]">
          {count} routes
        </span>
      </motion.div>
    </Link>
  );
}