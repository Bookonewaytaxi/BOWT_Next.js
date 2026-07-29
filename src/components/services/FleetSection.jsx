import React from 'react';
import FleetCard from './FleetCard';

export default function FleetSection() {
  const fleet = [
    {
      name: "Sedan (4+1)",
      tagline: "Compact & Comfortable",
      image: "https://images.unsplash.com/photo-1699078160988-6ab4727d7f82?q=80&w=1000&auto=format&fit=crop",
      features: ["4 Passengers", "2 Luggage Bags", "AC", "Best for Couples"]
    },
    {
      name: "SUV Ertiga (6+1)",
      tagline: "Spacious Family Car",
      image: "https://images.unsplash.com/photo-1550966871-116aadde4c26?q=80&w=1000&auto=format&fit=crop",
      features: ["6 Passengers", "3 Luggage Bags", "Dual AC", "Best for Families"]
    },
    {
      name: "SUV Kia Carens (7+1)",
      tagline: "Modern Comfort",
      image: "https://images.unsplash.com/photo-1685738041298-3e5913b35318?q=80&w=1000&auto=format&fit=crop",
      features: ["7 Passengers", "4 Luggage Bags", "Premium Interiors", "Best for Long Trips"]
    },
    {
      name: "Innova Crysta",
      tagline: "Ultimate Luxury",
      image: "https://images.unsplash.com/photo-1554832347-21e8c8ffa9ea?q=80&w=1000&auto=format&fit=crop",
      features: ["7 Passengers", "4 Luggage Bags", "Captain Seats", "VIP Experience"]
    }
  ];

  return (
    <section className="py-20 bg-[#0A0D11]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            OUR <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">FLEET</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the perfect vehicle for your journey. All our cars are well-maintained, sanitized, and driven by professional chauffeurs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleet.map((car, index) => (
            <FleetCard 
              key={index}
              {...car}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}