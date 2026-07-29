import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, CheckCircle2, BadgeCheck } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    { icon: BadgeCheck, text: "No Hidden Charges" },
    { icon: CheckCircle2, text: "Instant WhatsApp Confirmation" },
    { icon: ShieldCheck, text: "Verified Drivers" },
    { icon: Clock, text: "24/7 Support" },
  ];

  return (
    <div className="grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-8 mt-6">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
          className="flex items-center gap-2 group"
        >
          <div className="bg-amber-500/10 p-1.5 rounded-full border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
            <badge.icon className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-sm text-slate-300 font-medium group-hover:text-amber-400 transition-colors">
            {badge.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}