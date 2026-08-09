import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RouteCTASection from './RouteCTASection';

export default function RouteHero({ fromCity, toCity, distanceKm, startingPrice, onBookNow }) {
  return (
    <section id="hero" aria-labelledby="route-hero-heading" className="route-header mb-8 scroll-mt-24">
      <h1 id="route-hero-heading" className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
        {fromCity} <span className="text-[#667eea]">→</span> {toCity}
      </h1>

      <div className="route-meta flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
          <MapPin className="w-4 h-4 text-[#667eea]" />
          <span>{distanceKm ? `${distanceKm} km` : 'Standard Distance'}</span>
        </div>
        <Badge variant="outline" className="border-[#667eea] text-[#667eea] bg-[#667eea]/5 px-3 py-1">
          Fixed Pricing
        </Badge>
        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 px-3 py-1">
          Verified Route
        </Badge>
      </div>

      <div className="price-card-section transform hover:scale-[1.01] transition-transform duration-300 mb-6">
        <div className="price-card flex flex-col items-center text-center">
          <div className="price-label text-white/90 font-semibold tracking-wider text-sm uppercase mb-2">
            One Way Starts From
          </div>
          <div className="price-amount text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-sm">
            ₹{startingPrice.toLocaleString()}
          </div>
        </div>
      </div>

      <RouteCTASection fromCity={fromCity} toCity={toCity} startingPrice={startingPrice} onBookNow={onBookNow} />
    </section>
  );
}
