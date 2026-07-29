import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Award, ShieldCheck } from 'lucide-react';

export default function CorporateSection() {
  return (
    <section className="py-20 px-4 bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-amber-500 font-bold uppercase text-xs tracking-widest">Since 2016</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Trusted Intercity Travel Partner for Almost a Decade
            </h2>
            <p className="text-slate-400 leading-relaxed">
              One Way Taxi has been serving travelers across Ahmedabad, Gujarat and neighboring states since 2016.
              What started as a single-car service has grown into a network of verified drivers covering 800+
              routes — built on one simple promise: fair, one-way pricing with zero hidden charges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                <Building2 className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-amber-500 font-bold uppercase text-xs tracking-widest">For Businesses</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Corporate & Business Cab Service
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              We support corporate travel needs with dedicated intercity cab bookings, priority driver
              assignment, and monthly invoicing for teams that travel frequently between cities.
            </p>
            <a
              href="https://wa.me/917567575578?text=Hi%2C%20I%27m%20interested%20in%20corporate%20cab%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-900 bg-amber-500 hover:bg-amber-400 font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Talk to Us About Corporate Bookings
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
