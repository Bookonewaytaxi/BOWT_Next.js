import React from 'react';
import { motion } from 'framer-motion';

export default function WhoWeAre() {
  return (
    <section className="py-20 bg-[#0F1419]">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            WHO <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">WE ARE</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-[#FFD700] font-serif italic mb-12">
            "Trusted by 50,000+ customers across India for safe, affordable, and reliable one-way taxi service"
          </p>

          <div className="space-y-8 text-lg text-gray-300 leading-relaxed text-justify md:text-center">
            <p>
              One-Way Taxi is a leading one-way taxi service provider in India. We believe in making travel affordable, safe, and convenient for everyone. By optimizing our routes and fleet management, we ensure you only pay for what you use—eliminating the burden of return fares.
            </p>
            <p>
              With over 5 years of experience, we have served thousands of customers across multiple cities. Our commitment to quality service and customer satisfaction has made us a trusted name in the taxi industry. From rigorous driver background checks to vehicle sanitization, we leave no stone unturned.
            </p>
            <p>
              We operate with transparency, integrity, and a customer-first approach. Every ride with us is designed to be safe, comfortable, and affordable. Whether you're traveling for business, leisure, or an emergency, One-Way Taxi is your reliable companion on the road.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}