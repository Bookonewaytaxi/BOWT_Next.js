import React from 'react';
import { MapPin, Car, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { icon: MapPin, title: "Enter Details", desc: "Select pickup & drop cities" },
    { icon: Car, title: "Choose Car", desc: "Select your preferred vehicle" },
    { icon: CheckCircle2, title: "Confirm Booking", desc: "Fill details & confirm" },
    { icon: MessageSquare, title: "Get Confirmation", desc: "Receive updates via WhatsApp" }
  ];

  return (
    <section className="py-20 bg-[#0A0D11] border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            HOW IT <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">WORKS</span>
          </h2>
          <p className="text-gray-400">Simple 4-step process to book your taxi</p>
        </div>

        <div className="relative grid md:grid-cols-4 gap-8">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-[#161B22] border-4 border-[#0A0D11] flex items-center justify-center mb-6 shadow-xl relative">
                <div className="absolute inset-0 rounded-full border border-[#FFD700]/30" />
                <step.icon className="w-10 h-10 text-[#FFD700]" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#FFD700] text-[#0F1419] font-bold flex items-center justify-center border-4 border-[#0A0D11]">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}