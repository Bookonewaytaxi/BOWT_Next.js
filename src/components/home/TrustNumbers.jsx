import React from 'react';
import { motion } from 'framer-motion';
import { MapPinned, Car, IndianRupee, CalendarDays } from 'lucide-react';

const stats = [
  { icon: MapPinned, value: '1,700+', label: 'Route Options' },
  { icon: Car, value: '4', label: 'Vehicle Options' },
  { icon: IndianRupee, value: 'Fixed', label: 'One-Way Fares' },
  { icon: CalendarDays, value: 'Since 2015', label: 'Taxi Experience' },
];

export default function TrustNumbers() {
  return (
    <section className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 py-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.5 }} className="flex flex-col items-center text-center gap-1">
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
