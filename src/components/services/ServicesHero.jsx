import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ServicesHero() {
  const trustItems = [
    { icon: CheckCircle2, text: "No Return Fare" },
    { icon: MapPin, text: "Fixed Route Pricing" },
    { icon: Clock, text: "24x7 Support" },
    { icon: ShieldCheck, text: "Sanitized Vehicles" }
  ];

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1580538887464-fcf1cfbb282a?q=80&w=2072&auto=format&fit=crop" 
          alt="Luxury Taxi Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0F1419]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1419] via-transparent to-[#0F1419]/50" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight font-serif"
          >
            Affordable <span className="text-[#FFD700]">One-Way Taxi</span> Service
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-[#E8E8E8] mb-10 font-light max-w-2xl mx-auto"
          >
            Pay only one-side fare, no return charges. Save up to <span className="text-[#FFD700] font-semibold">40%</span> compared to round-trip taxis.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto"
          >
            {trustItems.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#FFD700]/30 transition-colors">
                <item.icon className="w-6 h-6 text-[#FFD700]" />
                <span className="text-xs md:text-sm text-gray-300 font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={() => window.location.href='/booking'}
              className="w-full sm:w-auto bg-[#FFD700] text-[#0F1419] hover:bg-[#E5C100] font-bold text-lg h-14 px-8 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all transform hover:-translate-y-1"
            >
              Book Now
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href='/booking'}
              className="w-full sm:w-auto border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10 bg-transparent font-bold text-lg h-14 px-8 rounded-full transition-all"
            >
              Get Instant Quote
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}