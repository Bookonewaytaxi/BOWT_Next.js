import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';

export default function MissionVision() {
  return (
    <section className="py-20 bg-[#0F1419]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            OUR <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">MISSION & VISION</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#161B22] p-8 md:p-12 rounded-2xl border border-white/5 hover:border-[#FFD700]/50 transition-colors shadow-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-bl-full transition-transform group-hover:scale-110" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#0A0D11] p-3 rounded-lg border border-[#FFD700]/20">
                <Target className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Our <span className="text-[#FFD700]">Mission</span></h3>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              To provide safe, affordable, and reliable one-way taxi service that makes travel easy and accessible for everyone across India. We aim to revolutionize intercity travel by eliminating unfair return charges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#161B22] p-8 md:p-12 rounded-2xl border border-white/5 hover:border-[#FFD700]/50 transition-colors shadow-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-bl-full transition-transform group-hover:scale-110" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#0A0D11] p-3 rounded-lg border border-[#FFD700]/20">
                <Eye className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Our <span className="text-[#FFD700]">Vision</span></h3>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              To become the most trusted and preferred one-way taxi service provider in India, known for quality, reliability, and customer satisfaction. We envision a future where luxury travel is affordable for all.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}