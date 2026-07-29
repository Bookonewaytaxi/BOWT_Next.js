import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { Users, CheckCircle, Map } from 'lucide-react';

function Counter({ value, label, icon: Icon }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const springValue = useSpring(0, { duration: 3000, bounce: 0 });
  const displayValue = useTransform(springValue, (current) => Math.round(current));

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  const [currentDisplay, setCurrentDisplay] = useState(0);
  
  useEffect(() => {
    const unsubscribe = displayValue.on("change", (latest) => {
      setCurrentDisplay(latest);
    });
    return () => unsubscribe();
  }, [displayValue]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm hover:border-amber-500/50 transition-colors">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 text-slate-900 shadow-lg shadow-amber-500/20">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-4xl font-black text-white mb-2">
        {currentDisplay}+
      </h3>
      <p className="text-slate-400 font-medium uppercase tracking-wider text-sm">{label}</p>
    </div>
  );
}

export default function StatsCounter() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <Counter value={5000} label="Happy Customers" icon={Users} />
      <Counter value={12000} label="Completed Rides" icon={CheckCircle} />
      <Counter value={250} label="Cities Covered" icon={Map} />
    </div>
  );
}