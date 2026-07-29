import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Route } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function PopularRoutesSection() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const loadRoutes = async () => {
      const { data } = await supabase
        .from('routes')
        .select('from_city, to_city, slug, sedan_price')
        .eq('is_active', true)
        .order('from_city', { ascending: true })
        .limit(16);
      if (data) setRoutes(data);
    };
    loadRoutes();
  }, []);

  if (routes.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Popular One-Way <span className="text-amber-500">Routes</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Fixed fares, no surge pricing. Pick your route and book in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.map((route, idx) => (
            <motion.div
              key={route.slug}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (idx % 4) * 0.08, duration: 0.4 }}
            >
              <Link
                href={`/routes/${route.slug}`}
                className="flex items-center justify-between gap-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl px-4 py-3 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Route className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-200 truncate">
                    {route.from_city} → {route.to_city}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/routes"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-bold border-b-2 border-amber-500/30 hover:border-amber-500 pb-1 transition-all"
          >
            View All Routes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
