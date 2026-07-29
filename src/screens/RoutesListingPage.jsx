import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Search, MapPin, ArrowRight, Loader2, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RouteCard from '@/components/common/RouteCard'; // Import RouteCard
import { VEHICLE_TYPES_CONSTANTS } from '@/lib/constants'; // Import constants if RouteCard needs it

export default function RoutesListingPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true)
        .order('from_city');
      
      if (error) throw error;
      setRoutes(data || []);
    } catch (err) {
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => 
    route.from_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.to_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>All Taxi Routes | One Way Taxi</title>
        <meta name="description" content="Explore all our available one-way taxi routes with fixed pricing." />
      </Head>
      
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        
        <div className="bg-slate-900 pt-24 pb-12 px-4 text-white">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl md:text-5xl font-black mb-6">Popular Routes</h1>
            <div className="max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input 
                placeholder="Search by city (e.g. Mumbai, Pune)" 
                className="pl-12 h-14 bg-white/10 border-slate-700 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 flex-1 max-w-7xl">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => (
                <RouteCard 
                  key={route.id} 
                  route={route} 
                  // vehicleTypes={VEHICLE_TYPES_CONSTANTS} // RouteCard now calculates its own vehicle data
                />
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}