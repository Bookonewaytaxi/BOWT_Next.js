import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function FareTableSection() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const loadRoutes = async () => {
      const { data } = await supabase
        .from('routes')
        .select('from_city, to_city, slug, distance_km, sedan_price, ertiga_price, suv_ertiga_price, innova_crysta_price, crysta_price')
        .eq('is_active', true)
        .order('from_city', { ascending: true })
        .limit(8);
      if (data) setRoutes(data);
    };
    loadRoutes();
  }, []);

  if (routes.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-black border-t border-slate-900">
      <div className="container mx-auto">
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" /> Transparent, All-Inclusive Fares
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Sample Route <span className="text-amber-500">Fares</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12">
            No return fare, no hidden tolls or driver charges — the price you see is the price you pay.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto rounded-2xl border border-slate-800 shadow-2xl"
        >
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-xs uppercase tracking-wider text-amber-500">
                <th className="p-4 font-bold">Route</th>
                <th className="p-4 font-bold text-center">KM</th>
                <th className="p-4 font-bold text-center">Sedan</th>
                <th className="p-4 font-bold text-center">Ertiga</th>
                <th className="p-4 font-bold text-center">Innova Crysta</th>
                <th className="p-4 font-bold text-center"></th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.slug} className="border-t border-slate-800 hover:bg-slate-900/60 transition-colors">
                  <td className="p-4 font-semibold text-white">{route.from_city} → {route.to_city}</td>
                  <td className="p-4 text-center text-slate-400">{route.distance_km || '-'} km</td>
                  <td className="p-4 text-center font-mono text-emerald-400 font-bold">₹{(route.sedan_price || 0).toLocaleString()}</td>
                  <td className="p-4 text-center font-mono text-amber-400 font-bold">₹{(route.ertiga_price || route.suv_ertiga_price || 0).toLocaleString()}</td>
                  <td className="p-4 text-center font-mono text-purple-400 font-bold">₹{(route.innova_crysta_price || route.crysta_price || 0).toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <Link href={`/routes/${route.slug}`} className="text-amber-500 hover:text-amber-400 text-sm font-bold whitespace-nowrap">
                      Book Now →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Prices shown are indicative for sample routes. <Link href="/routes" className="text-amber-500 hover:underline">See fares for all 800+ routes →</Link>
        </p>
      </div>
    </section>
  );
}
