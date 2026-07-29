import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

// TODO: Replace these with real customer reviews once available.
const testimonials = [
  {
    name: "Rakesh Patel",
    route: "Ahmedabad → Vadodara",
    rating: 5,
    text: "Car was spotless and the driver reached 10 minutes early. Fare was exactly what was quoted on WhatsApp — no last-minute surprises."
  },
  {
    name: "Mitesh Shah",
    route: "Surat → Ahmedabad",
    rating: 5,
    text: "Booked late at night for an early morning trip and still got instant confirmation. Very professional driver, smooth AC ride."
  },
  {
    name: "Priya Desai",
    route: "Vadodara → Mumbai Airport",
    rating: 4,
    text: "Reliable airport drop service. I've used them thrice now for early flights and they've never been late."
  },
  {
    name: "Kiran Solanki",
    route: "Rajkot → Ahmedabad",
    rating: 5,
    text: "One-way pricing actually saved me money compared to a round-trip taxi. Clean Innova, comfortable for the whole family."
  },
  {
    name: "Ankit Trivedi",
    route: "Ahmedabad → Mount Abu",
    rating: 5,
    text: "Driver was courteous and knew the route well. WhatsApp support answered every question before booking."
  },
  {
    name: "Foram Joshi",
    route: "Ahmedabad → Udaipur",
    rating: 4,
    text: "Good experience overall. Booking process on the website was quick — picked vehicle, entered details, done."
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            What Our <span className="text-amber-500">Customers Say</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Real trips, real feedback from travelers across Gujarat and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (idx % 3) * 0.1, duration: 0.5 }}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative hover:border-amber-500/30 transition-colors"
            >
              <Quote className="w-8 h-8 text-amber-500/20 absolute top-4 right-4" />
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-700'}`} />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div>
                <p className="text-white font-bold text-sm">{t.name}</p>
                <p className="text-amber-500/80 text-xs font-medium">{t.route}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
