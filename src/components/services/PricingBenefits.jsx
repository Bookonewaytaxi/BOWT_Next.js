import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Moon, Check, Map, Receipt } from 'lucide-react';

export default function PricingBenefits() {
  const benefits = [
    {
      icon: Eye,
      title: "No Hidden Charges",
      description: "All-inclusive fares. What you see is what you pay."
    },
    {
      icon: Moon,
      title: "No Night Charges",
      description: "Travel anytime. We don't charge extra for night driving."
    },
    {
      icon: Check,
      title: "Toll & Driver Allowance",
      description: "Included in the final fare. No haggling with drivers."
    },
    {
      icon: Map,
      title: "Fixed Route-Wise Pricing",
      description: "Transparent pricing based on routes, not meters."
    },
    {
      icon: Receipt,
      title: "Transparent Fares",
      description: "Know your complete fare breakdown before booking."
    }
  ];

  return (
    <section className="py-20 bg-[#0F1419]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            TRANSPARENT <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">PRICING & BENEFITS</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#161B22] p-6 rounded-xl border border-white/5 hover:border-[#FFD700] transition-colors group text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-4 group-hover:bg-[#FFD700] transition-colors">
                <benefit.icon className="w-6 h-6 text-[#FFD700] group-hover:text-[#0F1419] transition-colors" />
              </div>
              <h3 className="text-white font-bold mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}