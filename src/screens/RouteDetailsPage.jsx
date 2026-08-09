import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import Breadcrumb from '@/components/common/Breadcrumb';
import VehiclePriceTable from '@/components/routes/VehiclePriceTable';
import SEOContentDisplay from '@/components/routes/SEOContentDisplay';
import { composeRoutePageSchema } from '@/lib/schema/schemaComposer';
import { SITE_URL } from '@/lib/schema/organizationSchema';
import { getRouteSectionAvailability } from '@/lib/routeSectionAvailability';
import { slugify } from '@/lib/utils';
import TableOfContents from '@/components/routes/sections/TableOfContents';
import RouteHero from '@/components/routes/sections/RouteHero';
import CityInfoSection from '@/components/routes/sections/CityInfoSection';
import RouteInfoSection from '@/components/routes/sections/RouteInfoSection';
import WhyChooseUsSection from '@/components/routes/sections/WhyChooseUsSection';
import RelatedRoutesSection from '@/components/routes/sections/RelatedRoutesSection';
import InternalLinkHub from '@/components/routes/sections/InternalLinkHub';
import FinalCTASection from '@/components/routes/sections/FinalCTASection';
import { setBookingState } from '@/lib/bookingState';

/**
 * All route/related/city-profile data now arrives as props from
 * getStaticProps (pages/routes/[slug].jsx) — generated server-side and
 * cached (ISR, revalidate: 3600s). This component no longer fetches
 * anything on the client for its initial render; it only reads props.
 *
 * The booking flow (handleBookNow → setBookingState → router.push) is
 * completely unchanged from before this conversion.
 */
export default function RouteDetailsPage({
  route,
  startingPrice = 0,
  relatedRoutes = [],
  toCityRoutes = [],
  popularRoutes = [],
  cityProfiles = { fromProfile: null, toProfile: null },
}) {
  const router = useRouter();

  const handleBookNow = () => {
    if (!route) return;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setBookingState({
      from_city: route.from_city,
      to_city: route.to_city,
      distance: route.distance_km ? `${route.distance_km} km` : 'Standard',
      pickup_date: today,
      pickup_time: time,
      vehicle_fare: startingPrice,
      selected_vehicle: null
    });
    router.push('/booking/customer-details');
  };

  // Next.js renders this component only once getStaticProps has resolved
  // (fallback: 'blocking' never shows a client-side placeholder for this
  // page) — but this guard stays as a safe fallback in case the component
  // is ever rendered without props (e.g. a future preview/test harness).
  if (!route) {
    return null;
  }

  // Derived Data
  const { from_city, to_city, distance_km } = route;

  // Canonical URL — computed from real route data, works identically at
  // build-time (getStaticProps) and runtime; no window/browser dependency.
  const pageUrl = route.slug ? `${SITE_URL}/routes/${route.slug}` : SITE_URL;

  // SEO Metadata
  const seoTitle = route.seo_title || `${from_city} to ${to_city} Taxi Service - Book Now`;
  const seoDesc = route.seo_description || `Book reliable one-way taxi from ${from_city} to ${to_city}. Distance: ${distance_km || 'Standard'} km. Fares start ₹${startingPrice}.`;
  const seoKeywords = route.seo_keywords && Array.isArray(route.seo_keywords) ? route.seo_keywords.join(', ') : '';

  // NOTE: <Breadcrumb /> (src/components/common/Breadcrumb.jsx) already
  // renders its own hardcoded "Home" link before these items — so this
  // array must NOT include Home, or the visible UI would show "Home > Home > ...".
  const breadcrumbItems = [
    { label: 'Routes', href: '/routes' },
    { label: from_city, href: `/routes/city/${slugify(from_city)}` },
    { label: `${from_city} to ${to_city}`, href: '#' }
  ];

  // Schema must describe exactly what is visually rendered — which IS
  // "Home > Routes > City > Route" (Home comes from Breadcrumb.jsx itself).
  const schemaBreadcrumbItems = [{ label: 'Home', href: '/' }, ...breadcrumbItems];

  const routeSchemaGraph = composeRoutePageSchema({ route, breadcrumbItems: schemaBreadcrumbItems, pageUrl });

  // Module 2: single source of truth for which sections have real data —
  // drives BOTH the Table of Contents and the actual section rendering below,
  // so they can never drift out of sync.
  const sections = getRouteSectionAvailability({
    route,
    fromCityProfile: cityProfiles.fromProfile,
    toCityProfile: cityProfiles.toProfile,
    relatedRoutes,
    faqs: route.custom_faqs, // does not exist as a DB column yet — always undefined today
    approvedReviews: null, // Module F not built yet — always null today
  });
  const isAvailable = (id) => sections.find((s) => s.id === id)?.available;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        {routeSchemaGraph && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(routeSchemaGraph) }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-slate-50 font-sans route-page">
        <Header />

        <main className="container mx-auto px-4 pt-24 pb-12">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <RouteHero
            fromCity={from_city}
            toCity={to_city}
            distanceKm={distance_km}
            startingPrice={startingPrice}
            onBookNow={handleBookNow}
          />

          <TableOfContents sections={sections} />

          <article className="space-y-16">
            {isAvailable('vehicle-pricing') && <VehiclePriceTable route={route} />}

            {isAvailable('city-info') && (
              <CityInfoSection
                fromCity={from_city}
                toCity={to_city}
                fromCityProfile={cityProfiles.fromProfile}
                toCityProfile={cityProfiles.toProfile}
              />
            )}

            {isAvailable('route-info') && <RouteInfoSection route={route} />}

            {isAvailable('why-choose-us') && <WhyChooseUsSection />}

            {isAvailable('related-routes') && (
              <RelatedRoutesSection fromCity={from_city} relatedRoutes={relatedRoutes} />
            )}

            {isAvailable('travel-guide') && (
              <SEOContentDisplay content={route.seo_content} route={route} startingPrice={startingPrice} />
            )}

            <InternalLinkHub
              fromCity={from_city}
              toCity={to_city}
              fromCityRoutes={relatedRoutes}
              toCityRoutes={toCityRoutes}
              popularRoutes={popularRoutes}
              route={route}
            />

            <FinalCTASection
              fromCity={from_city}
              toCity={to_city}
              startingPrice={startingPrice}
              onBookNow={handleBookNow}
            />
          </article>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}
