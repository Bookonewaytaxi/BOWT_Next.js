import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { unslugify, slugify } from '@/lib/utils';
import { getRoutesByCity } from '@/services/RouteService';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CitySearchBox from '@/components/routes/CitySearchBox';
import RoutePagination from '@/components/routes/RoutePagination';
import Breadcrumb from '@/components/common/Breadcrumb';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import { Button } from '@/components/ui/button';

export default function CityRoutesPage() {
  const router = useRouter();
  const { citySlug } = router.query;
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const cityName = unslugify(citySlug);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchRoutes();
  }, [citySlug]);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoutesByCity(cityName);
      setRoutes(data || []);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const filteredRoutes = routes.filter(route => route.to_city.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredRoutes.length / ITEMS_PER_PAGE);
  const paginatedRoutes = filteredRoutes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const breadcrumbItems = [
    { label: 'Routes', href: '/routes' },
    { label: cityName, href: `/routes/${citySlug}` }
  ];
  const canonicalUrl = citySlug ? `https://bookonewaytaxi.in/routes/${slugify(cityName)}` : 'https://bookonewaytaxi.in/routes';
  const seoTitle = `Routes from ${cityName} | One-Way Taxi Service`;
  const seoDescription = `Explore all active one-way taxi routes from ${cityName}. Best fares guaranteed for verified cabs to popular destinations.`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="robots" content={citySlug ? 'index,follow' : 'noindex,follow'} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Book One Way Taxi" />
      </Head>

      <div className="min-h-screen bg-slate-50 font-sans">
        <Header />
        <div className="bg-slate-900 border-b border-slate-800 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Link href="/routes">
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 pl-0 gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to All Cities
                </Button>
              </Link>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-2">Routes From <span className="text-amber-500">{cityName}</span></h1>
                <p className="text-slate-400 text-lg">{routes.length} active destinations available</p>
              </div>
              <div className="w-full md:w-96"><CitySearchBox onSearch={handleSearch} placeholder="Search destination..." /></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Breadcrumb items={breadcrumbItems} />
          <div className="mb-12">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-700">No routes found</h3>
                <p className="text-slate-500 mt-2">Try searching for a different destination or contact us for a custom quote.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
                {paginatedRoutes.map((route) => (
                  <Link key={route.id} href={`/routes/${route.slug || '#'}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                    <span className="text-slate-800 font-medium">{route.from_city || 'City'} <span className="text-slate-400">→</span> {route.to_city || 'City'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <RoutePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} isLoading={loading} totalItems={filteredRoutes.length} itemsPerPage={ITEMS_PER_PAGE} />
        </div>
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}
