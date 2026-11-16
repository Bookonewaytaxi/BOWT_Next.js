import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { slugify } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CitySearchBox from '@/components/routes/CitySearchBox';
import RoutePagination from '@/components/routes/RoutePagination';
import Breadcrumb from '@/components/common/Breadcrumb';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import { Button } from '@/components/ui/button';

const SITE_URL = 'https://www.bookonewaytaxi.in';
const PAGE_SIZE = 20;

export default function CityRoutesPage({ cityName = '', citySlug = '', outgoingRoutes = [], incomingRoutes = [], cityProfile = null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const city = cityName || 'City';
  const canonicalUrl = `${SITE_URL}/routes/city/${citySlug || slugify(city)}`;
  const title = `${city} One Way Taxi Routes | Book One Way Taxi`.slice(0, 60);
  const description = `Book one way taxi from and to ${city}. View active routes, compare fixed fares and book with Book One Way Taxi. Call +91 75675 75578.`.slice(0, 160);
  const cityIntroduction = String(cityProfile?.description || '').trim();
  const filteredOutgoing = useMemo(() => outgoingRoutes.filter((route) => (route.to_city || '').toLowerCase().includes(searchTerm.toLowerCase())), [outgoingRoutes, searchTerm]);
  const filteredIncoming = useMemo(() => incomingRoutes.filter((route) => (route.from_city || '').toLowerCase().includes(searchTerm.toLowerCase())), [incomingRoutes, searchTerm]);
  const combined = useMemo(() => [
    ...filteredOutgoing.map((route) => ({ ...route, direction: 'outgoing' })),
    ...filteredIncoming.filter((route) => !filteredOutgoing.some((out) => out.id === route.id)).map((route) => ({ ...route, direction: 'incoming' }))
  ], [filteredOutgoing, filteredIncoming]);
  const totalPages = Math.ceil(combined.length / PAGE_SIZE);
  const visibleRoutes = combined.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const breadcrumbs = [{ label: 'Routes', href: '/routes' }, { label: city, href: `/routes/city/${citySlug || slugify(city)}` }];
  const citySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonicalUrl,
    about: { '@type': 'City', name: city },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: combined.length,
      itemListElement: combined.slice(0, 100).map((route, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/routes/${route.slug}`,
        name: `${route.from_city} to ${route.to_city} Taxi`
      }))
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={combined.length ? 'index,follow' : 'noindex,follow'} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Book One Way Taxi" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(citySchema) }} />
      </Head>
      <div className="min-h-screen bg-slate-50 font-sans">
        <Header />
        <div className="bg-slate-900 border-b border-slate-800 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="mb-6"><Link href="/routes"><Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800 pl-0 gap-2"><ArrowLeft className="w-4 h-4" /> Back to All Cities</Button></Link></div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div><h1 className="text-3xl md:text-5xl font-black text-white mb-2">One Way Taxi Routes for <span className="text-amber-500">{city}</span></h1><p className="text-slate-400 text-lg">{combined.length} active route connections</p>{cityIntroduction && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{cityIntroduction}</p>}</div>
              <div className="w-full md:w-96"><CitySearchBox onSearch={(term) => { setSearchTerm(term); setCurrentPage(1); }} placeholder="Search connected city..." /></div>
            </div>
          </div>
        </div>
        <main className="container mx-auto px-4 py-6">
          <Breadcrumb items={breadcrumbs} />
          <section className="my-8 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Taxi routes to and from {city}</h2>
            {cityProfile?.image_url && <img src={cityProfile.image_url} alt={`${city} city travel`} className="w-full max-h-64 object-cover rounded-lg mb-4" loading="lazy" />}
            {cityProfile?.description ? <div className="text-slate-600 whitespace-pre-line">{cityProfile.description}</div> : <p className="text-slate-600">Explore the available one-way taxi connections where {city} is the pickup or destination city. Each route opens its own route and fare details. The fare shown on the route page is the current fare recorded for that route; parking is extra.</p>}
          </section>
          {visibleRoutes.length ? (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
              {visibleRoutes.map((route) => <Link key={route.id} href={route.slug ? `/routes/${route.slug}` : '/routes'} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group"><span className="text-slate-800 font-medium">{route.from_city} <span className="text-slate-400">→</span> {route.to_city}<small className="block text-slate-400">{route.direction === 'outgoing' ? `Pickup in ${city}` : `Destination is ${city}`}</small></span><ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" /></Link>)}
            </div>
          ) : <div className="text-center py-16 bg-white rounded-xl border border-slate-100"><h2 className="text-xl font-bold text-slate-700">No matching routes found</h2><p className="text-slate-500 mt-2">Try another city name or contact us for assistance.</p></div>}
          <RoutePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} isLoading={false} totalItems={combined.length} itemsPerPage={PAGE_SIZE} />
        </main>
        <Footer /><WhatsAppButton />
      </div>
    </>
  );
}
