import React from 'react';
import { Route as Road, Eye, ShieldCheck, Phone } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function WhyChooseSection() {
  const features = [
    {
      icon: Road,
      title: "No Return Fare",
      description: "Pay only for the one-way journey. Why pay for a return trip when you don't need it? Save up to 40%."
    },
    {
      icon: Eye,
      title: "Transparent Pricing",
      description: "Know the exact fare before you book. No hidden costs, driver allowances, or night charges surprise."
    },
    {
      icon: ShieldCheck,
      title: "Verified Drivers",
      description: "All our drivers undergo rigorous background checks and training to ensure your safety and comfort."
    },
    {
      icon: Phone,
      title: "24x7 Customer Support",
      description: "Round-the-clock support for all your queries. We are always just a call or message away."
    }
  ];

  return (
    <section className="py-20 bg-[#0A0D11]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            WHY <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">CHOOSE US</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4">
            We offer unique benefits that set us apart from traditional taxi services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              {...feature}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}