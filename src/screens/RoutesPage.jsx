import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Filter, Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RouteCard from '@/components/common/RouteCard';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehicleTypes } from '@/hooks/useVehicleTypes';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch vehicles once to pass to all cards
  const { vehicleTypes, loading: vehiclesLoading } = useVehicleTypes();
  
  const ROUTES_PER_PAGE = 12;

  const fetchRoutes = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      const from = reset ? 0 : (page - 1) * ROUTES_PER_PAGE;
      const to = from + ROUTES_PER_PAGE - 1;

      let query = supabase
        .from('routes')
        .select('*', { count: 'exact' })
        .order('sedan_price', { ascending: true }) // You might want to sort by created_at or distance since sedan_price might be stale if hardcoded in DB
        .range(from, to);

      if (searchTerm) {
        query = query.or(`from_city.ilike.%${searchTerm}%,to_city.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      if (reset) {
        setRoutes(data);
      } else {
        setRoutes(prev => [...prev, ...data]);
      }

      setHasMore(data.length === ROUTES_PER_PAGE);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes(true);
  }, [searchTerm]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      fetchRoutes(false);
    }
  }, [page]);

  return (
    <>
      <Head>
        <title>Popular Taxi Routes | One Way Taxi</title>
        <meta name="description" content="Explore our popular one-way taxi routes across India. Affordable rates for Ahmedabad, Surat, Mumbai, Vadodara, Pune, and more. Book now!" />
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        
        {/* Header Section */}
        <div className="bg-slate-900 text-white py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Popular <span className="text-amber-500">Taxi Routes</span></h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Find the best one-way fares for your intercity travel. Select your route and book instantly.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="sticky top-0 z-30 bg-white shadow-md border-b border-slate-200 py-4 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  placeholder="Search city (e.g. Ahmedabad, Mumbai)" 
                  className="pl-10 h-12 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-auto">
                 <Select defaultValue="price_asc">
                    <SelectTrigger className="h-12 w-full md:w-[200px]">
                       <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-slate-500" />
                          <SelectValue placeholder="Sort By" />
                       </div>
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="price_asc">Price: Low to High</SelectItem>
                       <SelectItem value="price_desc">Price: High to Low</SelectItem>
                       <SelectItem value="dist_asc">Distance: Low to High</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="container mx-auto px-4 py-12 flex-1">
          {loading && page === 1 ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading routes...</p>
             </div>
          ) : (
            <>
               {routes.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                   {routes.map((route) => (
                     <RouteCard 
                       key={route.id} 
                       route={route} 
                       vehicleTypes={vehicleTypes}
                     />
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-20">
                    <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">No routes found</h3>
                    <p className="text-slate-500">Try searching for a different city.</p>
                 </div>
               )}

               {hasMore && routes.length > 0 && (
                 <div className="mt-12 text-center">
                   <Button 
                     onClick={loadMore} 
                     disabled={loading}
                     variant="outline"
                     className="min-w-[200px]"
                   >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                     {loading ? 'Loading...' : 'Load More Routes'}
                   </Button>
                 </div>
               )}
            </>
          )}
        </div>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}