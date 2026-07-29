import React from 'react';
import { ArrowRightLeft, BadgeIndianRupee, Headphones, ShieldCheck } from 'lucide-react';
import TrustBenefitCard from './TrustBenefitCard';

export default function TrustBenefitsSection() {
  const benefits = [
    {
      icon: ArrowRightLeft,
      title: "One-Way Only",
      subtitle: "No Return Fare",
      description: "Pay only for the distance you travel one way. Why pay double when you don't return?"
    },
    {
      icon: BadgeIndianRupee,
      title: "Fixed & Transparent Pricing",
      subtitle: "Know exact fare",
      description: "Get a complete fare breakdown before booking. No hidden charges or last-minute surprises."
    },
    {
      icon: Headphones,
      title: "24x7 Customer Support",
      subtitle: "Round-the-clock",
      description: "Our dedicated support team is available 24/7 to assist you with bookings and queries."
    },
    {
      icon: ShieldCheck,
      title: "Trusted by 50,000+ Customers",
      subtitle: "Safe & Reliable",
      description: "Over 5 years of experience delivering safe, sanitized, and reliable taxi services across India."
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 h-full content-start">
      {benefits.map((benefit, index) => (
        <TrustBenefitCard 
          key={index}
          {...benefit}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}