import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getRouteBySlug, calculateStartingPrice, getRoutesByCity } from '@/services/RouteService';
import { MapPin, Phone, ArrowRight, Info, AlertCircle, RefreshCcw } from 'lucide-react';
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

export default function RoutePage() {
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
      console.log('[RoutePage] Effect triggered for slug:', slug);
      setLoading(true);
      setError(null);

      try {
        const data = await getRouteBySlug(slug);
        
        if (!isMounted) return;

        if (!data) {
          console.error('[RoutePage] Route not found for slug:', slug);
          setError('Route not found. It may have been removed or the URL is incorrect.');
          return;
        }

        console.log('[RoutePage] Route data loaded successfully:', data.slug);
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
            .catch(err => console.warn('[RoutePage] Failed to load related routes:', err));
        }

      } catch (err) {
        console.error('[RoutePage] Critical error fetching route:', err);
        if (isMounted) {
          setError(err.message || 'An unexpected error occurred while loading the route.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRouteData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="loader w-12 h-12 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium animate-pulse">Loading route details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error || !route) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="error-container max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Route</h2>
            <p className="text-slate-600 mb-6">{error || "We couldn't find the requested route."}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/routes">
                <Button variant="outline">Browse All Routes</Button>
              </Link>
              <Button onClick={() => window.location.reload()} className="bg-[#667eea] hover:bg-[#5a67d8]">
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
    { label: from_city, href: `/routes/${slugify(from_city)}` },
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

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Price Highlight Card */}
              <div className="price-card-section transform hover:scale-[1.01] transition-transform duration-300">
                <div className="price-card flex flex-col items-center text-center">
                  <div className="price-label text-white/90 font-semibold tracking-wider text-sm uppercase mb-2">
                    One Way Starts From
                  </div>
                  <div className="price-amount text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-sm">
                    ₹{startingPrice.toLocaleString()}
                  </div>
                  <Button 
                    size="lg"
                    className="cta-button bg-white text-[#667eea] hover:bg-slate-50 text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                    onClick={() => window.open(`https://wa.me/917567575578?text=Hi, I am interested in booking a taxi from ${from_city} to ${to_city}`, '_blank')}
                  >
                    <Phone className="w-5 h-5 mr-2" /> Book Now on WhatsApp
                  </Button>
                </div>
              </div>

              {/* Vehicle Options Table */}
              <VehiclePriceTable route={route} />

              {/* SEO Content Section */}
              <SEOContentDisplay content={route.seo_content} route={route} />

            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                
                {/* Booking Widget */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg mb-2 text-slate-900">Quick Booking</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Our travel experts are ready to assist you instantly.
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