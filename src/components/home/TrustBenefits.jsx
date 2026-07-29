import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, CheckCircle2, IndianRupee } from 'lucide-react';

export default function TrustBenefits() {
  const benefits = [
    {
      icon: IndianRupee,
      title: "No Return Fare",
      description: "Pay only for one way. Zero hidden charges."
    },
    {
      icon: ShieldCheck,
      title: "Verified Drivers",
      description: "Background checked & professional chauffeurs."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock WhatsApp assistance."
    },
    {
      icon: CheckCircle2,
      title: "Guaranteed Cabs",
      description: "100% booking confirmation promise."
    }
  ];

  return (
    <section className="py-16 px-4 bg-slate-950 relative z-10 border-t border-slate-900">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                <benefit.icon className="h-6 w-6 text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                {benefit.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}