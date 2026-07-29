import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPinned, Star, CalendarDays } from 'lucide-react';

const stats = [
  { icon: Users, value: "15,000+", label: "Happy Customers" },
  { icon: MapPinned, value: "800+", label: "Routes Covered" },
  { icon: Star, value: "4.8★", label: "Average Rating" },
  { icon: CalendarDays, value: "Since 2016", label: "In Business" },
];

export default function TrustNumbers() {
  return (
    <section className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 py-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center gap-1"
            >
              <stat.icon className="w-7 h-7 text-slate-900 mb-1" />
              <span className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</span>
              <span className="text-xs md:text-sm font-semibold text-slate-800 uppercase tracking-wide">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
