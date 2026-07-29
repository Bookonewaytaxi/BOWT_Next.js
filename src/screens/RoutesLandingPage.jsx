import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CityCard from '@/components/routes/CityCard';
import CitySearchBox from '@/components/routes/CitySearchBox';
import RoutePagination from '@/components/routes/RoutePagination';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import RouteBreadcrumb from '@/components/routes/RouteBreadcrumb';

export default function RoutesLandingPage() {
  const [cities, setCities] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchRoutesData();
  }, []);

  const fetchRoutesData = async () => {
    setLoading(true);
    try {
      // Fetch all routes to aggregate cities
      // Note: For large datasets, this should be an RPC call or separate table
      const { data, error } = await supabase
        .from('routes')
        .select('from_city, is_active')
        .eq('is_active', true);

      if (error) throw error;

      // Aggregate cities
      const cityMap = {};
      data.forEach(route => {
        const city = route.from_city;
        if (city) {
          cityMap[city] = (cityMap[city] || 0) + 1;
        }
      });

      const cityList = Object.keys(cityMap).map(city => ({
        name: city,
        count: cityMap[city]
      }));

      // Sort popular (by count desc)
      const sortedByCount = [...cityList].sort((a, b) => b.count - a.count);
      setPopularCities(sortedByCount.slice(0, 8));

      // Sort all (alphabetical)
      const sortedByName = [...cityList].sort((a, b) => a.name.localeCompare(b.name));
      setCities(sortedByName);

    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Filter and Paginate
  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCities.length / ITEMS_PER_PAGE);
  const paginatedCities = filteredCities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Head>
        <title>One-Way Taxi Routes | Book Affordable Taxis</title>
        <meta name="description" content="Explore all one-way taxi routes. Select your pickup city and find affordable taxis to your destination. Best rates guaranteed." />
        <meta name="keywords" content="one way taxi routes, intercity cab routes, taxi service cities, cab booking india" />
      </Head>

      <div className="min-h-screen bg-[#0F1419] text-[#E8E8E8] font-sans selection:bg-[#FFD700] selection:text-[#0F1419]">
        <Header />

        <div className="bg-[#161B22] border-b border-[#2F3336]">
          <div className="container mx-auto px-4 py-16 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-white mb-6"
            >
              Explore Our <span className="text-[#FFD700]">Routes</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
            >
              We connect hundreds of cities across India. Select your pickup city to see available one-way routes.
            </motion.p>
            
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="max-w-xl mx-auto"
            >
               <CitySearchBox onSearch={handleSearch} placeholder="Search pickup city..." />
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <RouteBreadcrumb items={[{ label: 'Routes' }]} />

          {!searchTerm && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="w-6 h-6 text-[#FFD700]" />
                <h2 className="text-2xl font-bold text-white">Popular Cities</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {popularCities.map((city) => (
                  <CityCard key={city.name} cityName={city.name} count={city.count} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-3 mb-8">
              <Search className="w-6 h-6 text-[#FFD700]" />
              <h2 className="text-2xl font-bold text-white">
                {searchTerm ? 'Search Results' : 'All Cities'}
              </h2>
            </div>

            {loading ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                 {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 bg-[#161B22] rounded-xl animate-pulse" />
                 ))}
               </div>
            ) : filteredCities.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {paginatedCities.map((city) => (
                    <CityCard key={city.name} cityName={city.name} count={city.count} />
                  ))}
                </div>
                
                <RoutePagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isLoading={false}
                  totalItems={filteredCities.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </>
            ) : (
              <div className="text-center py-20 bg-[#161B22] rounded-2xl border border-[#2F3336]">
                <p className="text-gray-400">No cities found matching "{searchTerm}"</p>
              </div>
            )}
          </section>
        </div>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}