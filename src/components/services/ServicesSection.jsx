import React from 'react';
import { Map, Plane, Navigation, Building2, Briefcase, Heart } from 'lucide-react';
import ServiceCard from './ServiceCard';

export default function ServicesSection() {
  const services = [
    {
      icon: Navigation,
      title: "One Way Taxi Service",
      description: "Premium intercity travel where you pay only for the distance traveled one way. No hidden return fare charges."
    },
    {
      icon: Plane,
      title: "Airport Pickup & Drop",
      description: "Reliable airport transfers. We track flight delays to ensure your driver is waiting when you land."
    },
    {
      icon: Map,
      title: "Outstation Taxi",
      description: "Comfortable round-trip outstation cabs for weekend getaways or long vacations with family and friends."
    },
    {
      icon: Building2,
      title: "Local City Cab",
      description: "Hourly rental packages (8hr/80km, 12hr/120km) for shopping, city sightseeing, or local meetings."
    },
    {
      icon: Briefcase,
      title: "Corporate Travel",
      description: "Dedicated travel solutions for businesses with GST invoices, priority booking, and premium fleet."
    },
    {
      icon: Heart,
      title: "Wedding & Event Cab",
      description: "Luxury fleet for weddings and special events. Bulk booking options available for guest transportation."
    }
  ];

  return (
    <section className="py-20 bg-[#0F1419] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            OUR <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">SERVICES</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the gold standard in travel with our comprehensive range of taxi services designed for your comfort.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              {...service}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}