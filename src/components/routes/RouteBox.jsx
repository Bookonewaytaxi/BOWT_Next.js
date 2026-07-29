import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function RouteBox({ route }) {
  return (
    <Link href={`/routes/${route.slug}`}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#161B22] border border-[#2F3336] hover:border-[#FFD700] rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/10 h-full flex flex-col items-center justify-center text-center group cursor-pointer min-h-[140px]"
      >
        <div className="flex items-center justify-center gap-3 text-lg font-bold text-gray-300 group-hover:text-white transition-colors w-full">
          <span className="truncate max-w-[40%]">{route.from_city}</span>
          <ArrowRight className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
          <span className="truncate max-w-[40%]">{route.to_city}</span>
        </div>
        
        <div className="mt-4 text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-[#FFD700] transition-colors">
          View Details
        </div>
      </motion.div>
    </Link>
  );
}