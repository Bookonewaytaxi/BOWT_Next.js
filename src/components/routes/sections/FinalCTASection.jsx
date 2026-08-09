import React from 'react';
import RouteCTASection from './RouteCTASection';

export default function FinalCTASection({ fromCity, toCity, startingPrice, onBookNow }) {
  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-heading"
      className="scroll-mt-24 bg-slate-900 rounded-2xl p-8 text-center"
    >
      <h2 id="final-cta-heading" className="sr-only">
        Book Your {fromCity} to {toCity} Taxi Now
      </h2>
      <p className="text-white/80 mb-6">
        Ready to travel from {fromCity} to {toCity}? Fixed pricing, verified drivers, instant confirmation.
      </p>
      <div className="max-w-2xl mx-auto">
        <RouteCTASection
          fromCity={fromCity}
          toCity={toCity}
          startingPrice={startingPrice}
          onBookNow={onBookNow}
        />
      </div>
    </section>
  );
}
