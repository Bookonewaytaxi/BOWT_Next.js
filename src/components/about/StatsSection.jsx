import React from 'react';
import { Smile, Car, Map } from 'lucide-react';
import StatCard from './StatCard';

export default function StatsSection() {
  return (
    <section className="py-20 bg-[#0F1419] relative">
      <div className="absolute inset-0 bg-[#FFD700]/5 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            OUR <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">ACHIEVEMENTS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4">
            Milestones that reflect our commitment to excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <StatCard 
            number={50000} 
            label="Happy Customers" 
            description="Trusted by thousands across India" 
            icon={Smile} 
          />
          <StatCard 
            number={500000} 
            label="Completed Rides" 
            description="Safe and reliable journeys" 
            icon={Car} 
          />
          <StatCard 
            number={25} 
            label="Cities Covered" 
            description="Expanding across India" 
            icon={Map} 
          />
        </div>
      </div>
    </section>
  );
}