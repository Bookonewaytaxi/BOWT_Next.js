import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/customSupabaseClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import Breadcrumb from '@/components/common/Breadcrumb';
import { getAirportPage, AIRPORT_PAGES } from '@/lib/airportConfig';

const SITE_URL = 'https://www.bookonewaytaxi.in';
const PHONE = '+91 75675 75578';
const PAGE_SIZE = 1000;

export default function AirportTaxiPage({ airport, cityProfile, outgoingRoutes, incomingRoutes, seo }) {
  const canonical = `${SITE_URL}/airports/${airport.slug}`;
  const title = (seo?.meta_title || `${airport.name} Taxi Service | Airport Pickup & Drop | Book One Way Taxi`).slice(0, 60);
  const description = (seo?.meta_description || `Book a one-way taxi for ${airport.name}. Explore routes from ${airport.cityName}, request airport pickup or drop availability and confirm your fare on WhatsApp. Call ${PHONE}.`).slice(0, 160);
  const routes = [...outgoingRoutes, ...incomingRoutes.filter((r) => !outgoingRoutes.some((o) => o.id === r.id))];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${airport.name} Taxi Service`,
    serviceType: 'Airport taxi pickup and drop enquiry',
    provider: { '@type': 'LocalBusiness', name: 'Book One Way Taxi', telephone: '+917567575578', url: SITE_URL },
    areaServed: { '@type': 'City', name: airport.cityName },
    url: canonical,
    description
  };
  const faqs = [
    { q: `Can I request a taxi to ${airport.name}?`, a: `Yes. Share your pickup city, travel date, flight timing and passenger details on WhatsApp. The team will confirm the applicable airport transfer fare and availability before booking.` },
    { q: `Can I book a pickup from ${airport.name}?`, a: `You can request an airport pickup by sharing your flight arrival details, destination city and passenger count. Pickup availability and the applicable fare are confirmed separately.` },
    { q: 'Are the regular city-to-city fares the same as airport fares?', a: 'Not necessarily. Airport pickup points, access arrangements and parking may affect the quotation. Confirm the exact airport transfer fare before booking.' },
    { q: 'Which vehicles are available?', a: 'Vehicle options depend on the journey, passenger count, luggage and availability. Confirm the suitable vehicle and fare with the booking team.' }
  ];
  return <>
    <Head>
      <title>{title}</title><meta name="description" content={description} />
      <meta name="robots" content={routes.length ? 'index,follow' : 'noindex,follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" /><meta property="og:site_name" content="Book One Way Taxi" />
      <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
    <div className="min-h-screen bg-slate-50 text-slate-800"><Header />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <Breadcrumb items={[{ label: 'Airports', href: '/airports' }, { label: `${airport.name} Taxi Service` }]} />
        <section className="mt-6 rounded-2xl bg-slate-950 px-6 py-12 text-white md:px-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Airport Transfer · Book One Way Taxi</p>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">${airport.name} Taxi Service</h1>
          <h2 className="mt-3 text-lg font-semibold text-slate-200">${airport.airportName}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Request one-way airport pickup or drop service for ${airport.name}. Share your flight timing, pickup or destination city, passenger count and luggage details to confirm vehicle availability and the exact airport transfer fare.</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="https://wa.me/917567575578?text=I%20need%20an%20airport%20taxi%20quotation" className="rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950">WhatsApp for Airport Fare</a><a href="tel:+917567575578" className="rounded-lg border border-white/30 px-5 py-3 font-semibold text-white">Call {PHONE}</a></div>
        </section>
        <section className="my-10 grid gap-6 md:grid-cols-[1fr_320px]">
          <article className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-slate-900">Airport Taxi Pickup & Drop – ${airport.cityName}</h2>
            <p className="mt-4 leading-7 text-slate-600">${cityProfile?.description || `Book a one-way airport taxi enquiry for ${airport.name}, serving ${airport.cityName} and its connected destinations. Airport-specific pickup and drop quotations are confirmed against your exact terminal, timing and destination.`}</p>
            <p className="mt-3 text-sm text-slate-500">Regular city-to-city route fares shown on linked route pages are not represented as airport-specific fares. Please request a separate airport quotation before confirming.</p>
          </article>
          <aside className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold text-slate-900">Get an exact quotation</h2><p className="mt-3 text-sm leading-6 text-slate-600">Send airport, flight number, date, reporting time, destination, passenger count and luggage details.</p><a href="https://wa.me/917567575578?text=Please%20share%20airport%20taxi%20availability%20and%20fare" className="mt-5 block rounded-lg bg-emerald-600 px-4 py-3 text-center font-bold text-white">Request on WhatsApp</a></aside>
        </section>
        <section className="my-12">
          <h2 className="text-2xl font-bold text-slate-900">City-to-City Routes Connected with ${airport.cityName}</h2>
          <p className="mt-2 mb-5 text-slate-600">These are regular route pages connected with the airport's city. Confirm airport-specific pickup or drop pricing separately.</p>
          {routes.length ? <div className="grid gap-3 md:grid-cols-2">{routes.slice(0,100).map((route) => <Link key={route.id} href={`/routes/${route.slug}`} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-amber-400"><span className="font-semibold text-slate-900">${route.from_city} → ${route.to_city}</span><span className="mt-1 block text-sm text-amber-700">View regular route details →</span></Link>)}</div> : <p className="rounded-xl bg-white p-5 text-slate-600">No linked city routes are currently available. Contact the team for an airport transfer enquiry.</p>}
        </section>
        <section className="my-12 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8"><h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2><div className="mt-5 divide-y divide-slate-200">{faqs.map((faq) => <details key={faq.q} className="py-4"><summary className="cursor-pointer font-semibold text-slate-900">{faq.q}</summary><p className="mt-3 leading-7 text-slate-600">{faq.a}</p></details>)}</div></section>
      </main><Footer /><WhatsAppButton /></div>
  </>;
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const airport = getAirportPage(String(params?.slug || ''));
  if (!airport) return { notFound: true, revalidate: 3600 };
  try {
    const [{ data: cityProfile, error: profileError }, { data: seo, error: seoError }] = await Promise.all([
      supabase.from('city_profiles').select('city_name,description').eq('city_name', airport.cityName).eq('is_active', true).maybeSingle(),
      supabase.from('seo_metadata').select('meta_title,meta_description,keywords,og_image_url').eq('page_type', 'airport').eq('slug', airport.slug).maybeSingle()
    ]);
    if (profileError) throw profileError;
    if (seoError) throw seoError;
    const fetchRoutes = async (column) => {
      const rows = [];
      for (let offset = 0; offset < 20000; offset += PAGE_SIZE) {
        const { data, error } = await supabase.from('routes')
          .select('id,from_city,to_city,slug')
          .eq(column, airport.cityName)
          .eq('is_active', true)
          .not('slug', 'is', null)
          .order(column === 'from_city' ? 'to_city' : 'from_city', { ascending: true })
          .range(offset, offset + PAGE_SIZE - 1);
        if (error) throw error;
        rows.push(...(data || []));
        if (!data || data.length < PAGE_SIZE) break;
      }
      return rows;
    };
    const [outgoingRoutes, incomingRoutes] = await Promise.all([fetchRoutes('from_city'), fetchRoutes('to_city')]);
    return { props: { airport, cityProfile: cityProfile || null, outgoingRoutes, incomingRoutes, seo: seo || null }, revalidate: 3600 };
  } catch (error) {
    console.error('[AirportTaxiPage] Failed to load airport page:', error);
    return { notFound: true, revalidate: 300 };
  }
}
