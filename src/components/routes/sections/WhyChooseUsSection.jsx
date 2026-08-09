import React from 'react';
import { Info } from 'lucide-react';

const REASONS = [
  { title: 'Lowest Price Guarantee', text: 'on all one-way and round trips.' },
  { title: 'Verified Drivers', text: 'for maximum safety and comfort.' },
  { title: '24/7 Support', text: 'team available for assistance.' },
];

export default function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" aria-labelledby="why-choose-us-heading" className="scroll-mt-24">
      <h2 id="why-choose-us-heading" className="text-2xl font-bold mb-6 text-slate-900">
        Why Choose Us
      </h2>
      <ul className="grid sm:grid-cols-3 gap-4">
        {REASONS.map((reason) => (
          <li key={reason.title} className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#667eea]/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-[#667eea]" />
            </div>
            <span className="text-sm text-slate-600">
              <strong className="text-slate-900">{reason.title}</strong> {reason.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
