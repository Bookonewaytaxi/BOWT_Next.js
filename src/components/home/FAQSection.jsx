import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "What is a one-way taxi and how is it different from a round trip?",
    a: "With a one-way taxi, you pay only for the distance from your pickup city to your drop city — not for the return journey. Round-trip cabs usually charge you for both directions even if you're not traveling back with the same car."
  },
  {
    q: "Are toll, parking, and driver charges included in the fare?",
    a: "Yes. The fare shown on our website and WhatsApp quote is all-inclusive — tolls, state permit charges, and driver allowance are already built in. There are no hidden charges added at drop-off."
  },
  {
    q: "How do I book a one-way taxi with One Way Taxi?",
    a: "Enter your pickup city, drop city, date and time on our homepage, choose a vehicle (Sedan, Ertiga, Kia Carens, or Innova Crysta), and confirm your details. You'll receive instant booking confirmation on WhatsApp with your driver's details."
  },
  {
    q: "Can I book an intercity cab for the same day?",
    a: "Yes, same-day and even last-minute bookings are usually possible, subject to driver availability on your route. For guaranteed availability, we recommend booking at least a few hours in advance."
  },
  {
    q: "Do you provide cabs for airport transfers?",
    a: "Yes, we provide one-way airport pickup and drop services to and from major airports including Ahmedabad, Vadodara, Surat, and Mumbai."
  },
  {
    q: "Is corporate or business booking available?",
    a: "Yes, we offer dedicated one-way cab service for corporate travel and business clients, including monthly billing options. Contact us on WhatsApp to set up a corporate account."
  },
  {
    q: "What if my driver is late or I need to change my pickup time?",
    a: "Our support team is available on WhatsApp and phone to help you reschedule or track your assigned driver. We recommend informing us as early as possible for any change in plans."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <section className="py-20 px-4 bg-black border-t border-slate-900">
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Head>

      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Frequently Asked <span className="text-amber-500">Questions</span>
          </h2>
          <p className="text-slate-400">
            Everything you need to know before booking your one-way ride.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-white text-sm md:text-base">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-amber-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
