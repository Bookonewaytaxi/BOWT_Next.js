import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Snowflake, CheckCircle2 } from 'lucide-react';

export default function TrustSignals() {
  const badges = [
    { icon: CheckCircle2, text: "Verified Drivers", color: "text-green-600" },
    { icon: Snowflake, text: "AC Vehicles", color: "text-blue-500" },
    { icon: ShieldCheck, text: "Sanitized Cars", color: "text-purple-500" },
  ];

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mt-8">
      <h3 className="text-base font-bold text-slate-900 mb-4">Why Choose Our Vehicles?</h3>
      <div className="flex flex-wrap gap-4 md:gap-8">
        {badges.map((badge, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className={`p-1.5 bg-white rounded-full shadow-sm border border-slate-100 ${badge.color}`}>
              <badge.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-600">{badge.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}