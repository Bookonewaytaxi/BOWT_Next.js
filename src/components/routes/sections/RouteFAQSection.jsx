import React from 'react';

export default function RouteFAQSection({ faqs = [] }) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;

  return (
    <section id="faq" className="scroll-mt-24" aria-labelledby="route-faq-heading">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <h2 id="route-faq-heading" className="text-2xl font-bold text-slate-900 md:text-3xl">
          Frequently Asked Questions
        </h2>
        <div className="mt-6 divide-y divide-slate-200">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5 first:pt-0 last:pb-0">
              <summary className="cursor-pointer list-none pr-8 font-semibold text-slate-900 marker:hidden">
                {faq.question}
              </summary>
              <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
