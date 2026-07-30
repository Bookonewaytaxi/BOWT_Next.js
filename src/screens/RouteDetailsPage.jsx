import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { MapPin, Phone, ArrowRight, Info, AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { getRouteBySlug, calculateStartingPrice, getRoutesByCity } from '@/services/RouteService';
import { slugify } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import Breadcrumb from '@/components/common/Breadcrumb';
import VehiclePriceTable from '@/components/routes/VehiclePriceTable';
import SEOContentDisplay from '@/components/routes/SEOContentDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { setBookingState } from '@/lib/bookingState';

export default function RouteDetailsPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  
  // State Management
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingPrice, setStartingPrice] = useState(0);
  const [relatedRoutes, setRelatedRoutes] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchRouteData = async () => {
      console.log(`[RouteDetailsPage] 🔄 Starting load for slug: ${slug}`);
      setLoading(true);
      setError(null);

      try {
        const data = await getRouteBySlug(slug);
        
        if (!isMounted) return;

        if (!data) {
          console.warn(`[RouteDetailsPage] ⚠️ Route not found (404) for: ${slug}`);
          setError({ type: 'NOT_FOUND', message: 'Route not found or unavailable.' });
          return;
        }

        console.log(`[RouteDetailsPage] ✅ Data loaded for: ${data.from_city} to ${data.to_city}`);
        setRoute(data);
        
        // Calculate price
        const price = calculateStartingPrice(data);
        setStartingPrice(price);

        // Fetch related routes (non-blocking)
        if (data.from_city) {
          getRoutesByCity(data.from_city)
            .then(related => {
              if (isMounted) {
                setRelatedRoutes(related.filter(r => r.id !== data.id).slice(0, 6));
              }
            })
            .catch(err => console.warn('[RouteDetailsPage] Failed to load related routes:', err));
        }

      } catch (err) {
        console.error('[RouteDetailsPage] 💥 Critical Error:', err);
        if (isMounted) {
          setError({ 
            type: 'ERROR', 
            message: err.message || 'An unexpected error occurred while loading the route.' 
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchRouteData();
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleBookNow = () => {
    if (!route) return;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

    setBookingState({
      from_city: route.from_city,
      to_city: route.to_city,
      distance: route.distance_km ? `${route.distance_km} km` : 'Standard',
      pickup_date: today,
      pickup_time: time,
      vehicle_fare: startingPrice,
      selected_vehicle: null // Let user select vehicle later or auto-select default
    });
    router.replace('/booking/customer-details');
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[500px]">
          <Loader2 className="w-12 h-12 text-[#667eea] animate-spin mb-4" />
          <p className="text-slate-600 font-medium animate-pulse">Loading route details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // --- Error State ---
  if (error || !route) {
    const isNotFound = error?.type === 'NOT_FOUND';
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[500px]">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isNotFound ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {isNotFound ? 'Route Not Found' : 'Unable to Load Route'}
            </h2>
            
            <p className="text-slate-600 mb-6">
              {error?.message || "We couldn't load the route information right now."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/routes">
                <Button variant="outline" className="w-full sm:w-auto">Browse All Routes</Button>
              </Link>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-[#667eea] hover:bg-[#5a67d8] w-full sm:w-auto"
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Derived Data
  const { from_city, to_city, distance_km } = route;
  
  // SEO Metadata
  const seoTitle = route.seo_title || `${from_city} to ${to_city} Taxi Service - Book Now`;
  const seoDesc = route.seo_description || `Book reliable one-way taxi from ${from_city} to ${to_city}. Distance: ${distance_km || 'Standard'} km. Fares start ₹${startingPrice}.`;
  const seoKeywords = route.seo_keywords && Array.isArray(route.seo_keywords) ? route.seo_keywords.join(', ') : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const breadcrumbItems = [
    { label: 'Routes', href: '/routes' },
    { label: from_city, href: `/routes/city/${slugify(from_city)}` },
    { label: `${from_city} to ${to_city}`, href: '#' } 
  ];

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-slate-50 font-sans route-page">
        <Header />

        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          {/* Route Header */}
          <div className="route-header mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {from_city} <span className="text-[#667eea]">→</span> {to_city}
            </h1>
            
            {/* Route Meta Tags */}
            <div className="route-meta flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
                <MapPin className="w-4 h-4 text-[#667eea]" />
                <span>{distance_km ? `${distance_km} km` : 'Standard Distance'}</span>
              </div>
              <Badge variant="outline" className="border-[#667eea] text-[#667eea] bg-[#667eea]/5 px-3 py-1">
                Fixed Pricing
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 px-3 py-1">
                Verified Route
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 min-w-0">
            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-8 min-w-0">
              
              {/* Price Highlight Card */}
              <div className="price-card-section transform hover:scale-[1.01] transition-transform duration-300">
                <div className="price-card flex flex-col items-center text-center">
                  <div className="price-label text-white/90 font-semibold tracking-wider text-sm uppercase mb-2">
                    One Way Starts From
                  </div>
                  <div className="price-amount text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-sm">
                    ₹{startingPrice.toLocaleString()}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center px-4">
                    <Button 
                      size="lg"
                      className="cta-button bg-white text-[#667eea] hover:bg-slate-50 text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex-1 sm:flex-none"
                      onClick={() => window.open(`https://wa.me/917567575578?text=Hi, I am interested in booking a taxi from ${from_city} to ${to_city}`, '_blank')}
                    >
                      <Phone className="w-5 h-5 mr-2" /> WhatsApp Booking
                    </Button>
                    <Button 
                      size="lg" 
                      onClick={handleBookNow}
                      className="bg-slate-900 text-white hover:bg-slate-800 text-lg h-14 px-8 rounded-full shadow-lg transition-all flex-1 sm:flex-none"
                    >
                      Book Online <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Vehicle Options Table */}
              <VehiclePriceTable route={route} />

              {/* SEO Content Section */}
              <SEOContentDisplay content={route.seo_content} route={route} />

            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-6 min-w-0">
              <div className="sticky top-24 space-y-6">
                
                {/* Booking Widget */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg mb-2 text-slate-900">Quick Support</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Need help planning your trip? Our team is available 24/7.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-12 shadow-sm" onClick={() => window.open('https://wa.me/917567575578', '_blank')}>
                      <Phone className="w-4 h-4 mr-2" /> WhatsApp Us
                    </Button>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-sm" onClick={() => window.open('tel:+917567575578')}>
                      <Phone className="w-4 h-4 mr-2" /> Call Now
                    </Button>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="font-semibold text-sm mb-4 text-slate-900 uppercase tracking-wide">Why Choose Us?</h4>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#667eea]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3 h-3 text-[#667eea]" />
                      </div>
                      <span><strong>Lowest Price Guarantee</strong> on all one-way and round trips.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#667eea]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3 h-3 text-[#667eea]" />
                      </div>
                      <span><strong>Verified Drivers</strong> for maximum safety and comfort.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#667eea]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3 h-3 text-[#667eea]" />
                      </div>
                      <span><strong>24/7 Support</strong> team available for assistance.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>

          {/* Related Routes Section */}
          {relatedRoutes.length > 0 && (
            <div className="mt-20 pt-10 border-t border-slate-200">
              <h2 className="text-2xl font-bold mb-8 text-slate-900">Popular Routes from {from_city}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedRoutes.map((related) => (
                  <Link 
                    key={related.id} 
                    href={`/routes/${related.slug}`}
                    className="group flex justify-between items-center p-5 bg-white rounded-xl border border-slate-200 hover:border-[#667eea] hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">To</span>
                      <span className="font-bold text-slate-900 text-lg group-hover:text-[#667eea] transition-colors">
                        {related.to_city}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#667eea] transition-colors">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}
