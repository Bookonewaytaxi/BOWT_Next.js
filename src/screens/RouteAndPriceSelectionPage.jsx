import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, ArrowLeft, Loader2, Navigation, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Head from 'next/head';
import LogoImage from '@/components/ui/LogoImage';
import ProgressIndicator from '@/components/vehicle/ProgressIndicator';
import useInquiryCapture from '@/hooks/useInquiryCapture';

export default function RouteAndPriceSelectionPage() {
  const location = useLocation();
  const router = useRouter();
  const { toast } = useToast();
  
  // State from Home page
  const { 
    fromCity, 
    toCity, 
    pickupDate,
    pickupTime,
    name, 
    mobileNumber, 
    email 
  } = location.state || {};

  // Inquiry Capture Hook
  useInquiryCapture({
    pickup_city: fromCity,
    drop_city: toCity,
    travel_date: pickupDate,
    travel_time: pickupTime,
    customer_name: name,
    customer_mobile: mobileNumber,
    email: email
  });

  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (!fromCity || !toCity) {
      router.push('/');
      return;
    }
    fetchMatchingRoutes();
  }, [fromCity, toCity, navigate]);

  const fetchMatchingRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('routes').select('*');
      
      if (error) throw error;

      // Filter for matches
      const matching = data.filter(route => 
        route.from_city.toLowerCase().includes(fromCity.toLowerCase()) && 
        route.to_city.toLowerCase().includes(toCity.toLowerCase())
      );

      setRoutes(matching);
      
      // If only one match, we can optionally auto-proceed or just show it prominently
      // For better UX, we'll display it and let user confirm "Select Route"
      // to avoid confusion about what happened.
      
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load routes. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (route) => {
    navigate('/vehicle-selection', {
      state: {
        selected_route: route,
        name,
        email,
        mobileNumber,
        pickupDate,
        pickupTime
      }
    });
  };

  return (
    <>
      <Head>
        <title>Select Route | One Way Taxi</title>
        <meta name="description" content="Confirm your route for the journey." />
      </Head>
      
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <ProgressIndicator currentStep={1} />
        
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <div className="mb-8 flex items-center gap-4">
             <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="h-5 w-5 mr-1" /> Back
              </Button>
              <h1 className="text-2xl font-black text-slate-900">Confirm Your Route</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-[#d4af37] animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Searching for best routes...</p>
            </div>
          ) : routes.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MapPin className="h-10 w-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">No Direct Routes Found</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                We couldn't find a standard route between <span className="font-bold">{fromCity}</span> and <span className="font-bold">{toCity}</span>.
              </p>
              <Button onClick={() => router.push('/')} className="bg-slate-900 text-white">
                Modify Search
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {routes.map((route) => (
                <motion.div 
                  key={route.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">ONE WAY</span>
                           {route.distance && <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded">{route.distance}</span>}
                        </div>
                        <div className="flex items-center gap-4 text-2xl font-bold text-slate-900 mb-2">
                          <span>{route.from_city}</span>
                          <ArrowRight className="h-6 w-6 text-slate-300" />
                          <span>{route.to_city}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                           {route.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {route.duration}</span>}
                           <span className="flex items-center gap-1"><Navigation className="w-4 h-4" /> Direct Route</span>
                        </div>
                      </div>

                      <div>
                        <Button 
                          onClick={() => handleRouteSelect(route)}
                          className="h-12 px-8 bg-gold-gradient text-white font-bold uppercase tracking-wide shadow-md hover:shadow-lg hover:opacity-90"
                        >
                          Select Route
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}