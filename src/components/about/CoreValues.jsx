import React from 'react';
import { Shield, Eye, CheckCircle2, Wallet, Heart, Lightbulb } from 'lucide-react';
import ValueCard from './ValueCard';

export default function CoreValues() {
  const values = [
    {
      icon: Shield,
      title: "Safety",
      description: "We prioritize the safety of our customers above all else with verified drivers and GPS tracking."
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "We believe in honest and transparent pricing with no hidden charges or surprise fees."
    },
    {
      icon: CheckCircle2,
      title: "Reliability",
      description: "We deliver consistent and reliable service every time, ensuring punctual pickups and drops."
    },
    {
      icon: Wallet,
      title: "Affordability",
      description: "We offer competitive prices without compromising quality, saving you up to 40% on travel costs."
    },
    {
      icon: Heart,
      title: "Customer Focus",
      description: "Your satisfaction is our top priority. We go the extra mile to ensure a comfortable journey."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously improve our services and technology to provide a seamless booking experience."
    }
  ];

  return (
    <section className="py-20 bg-[#0A0D11]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            OUR <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">CORE VALUES</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4">
            The principles that drive us to deliver excellence in every mile.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {values.map((value, index) => (
            <ValueCard 
              key={index}
              {...value}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}