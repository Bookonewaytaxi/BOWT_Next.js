import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useMotionValue } from 'framer-motion';

export default function StatCard({ number, label, description, icon: Icon, suffix = "+" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });
  const [displayNumber, setDisplayNumber] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(number);
    }
  }, [isInView, number, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      setDisplayNumber(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="bg-[#161B22] p-8 rounded-2xl border border-white/5 hover:border-[#FFD700] transition-all duration-300 group shadow-lg text-center relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 text-[#FFD700]" />
      </div>
      
      <div className="relative z-10">
        <div className="text-4xl md:text-5xl font-black text-[#FFD700] mb-2 font-serif">
          {displayNumber.toLocaleString()}{suffix}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{label}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </motion.div>
  );
}