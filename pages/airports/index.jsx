import Head from 'next/head';
import Link from 'next/link';
import { AIRPORT_PAGES } from '@/lib/airportConfig';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';

export default function AirportsIndexPage() {
  const title = 'Airport Taxi Services | One Way Airport Pickup & Drop';
  const description = 'Explore airport taxi pickup and drop services across Gujarat and major Indian cities. Request airport-specific fares and availability on WhatsApp.';
  return <>
    <Head><title>{title}</title><meta name="description" content={description} /><link rel="canonical" href="https://www.bookonewaytaxi.in/airports" /><meta name="robots" content="index,follow" /></Head>
    <div className="min-h-screen bg-slate-50"><Header /><main className="container mx-auto px-4 pt-28 pb-16">
      <section className="rounded-2xl bg-slate-950 p-8 text-white"><h1 className="text-3xl font-black md:text-5xl">Airport Taxi Services</h1><p className="mt-4 max-w-3xl text-slate-300">Choose an airport to request a one-way pickup or drop quotation. Airport-specific fares and vehicle availability are confirmed separately against your travel details.</p></section>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{AIRPORT_PAGES.map((airport)=><Link key={airport.slug} href={`/airports/${airport.slug}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400"><h2 className="text-lg font-bold text-slate-900">{airport.name} Taxi Service</h2><p className="mt-2 text-sm text-slate-600">{airport.airportName}</p><p className="mt-3 text-sm font-semibold text-amber-700">View airport service →</p></Link>)}</div>
    </main><Footer /><WhatsAppButton /></div>
  </>;
}
