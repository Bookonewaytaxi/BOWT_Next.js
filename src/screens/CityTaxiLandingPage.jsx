import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import Breadcrumb from '@/components/common/Breadcrumb';

const SITE_URL = 'https://www.bookonewaytaxi.in';
const phone = '+91 75675 75578';
const money = (value) => Number(value) > 0 ? '₹' + Number(value).toLocaleString('en-IN') : 'On Request';

function RouteCard({ route }) {
  const prices = [
    ['Sedan (4+1)', route.sedan_price],
    ['SUV (6+1) Ertiga', route.suv_ertiga_price || route.ertiga_price],
    ['SUV (7+1) Carens', route.kia_carens_price || route.carens_price],
    ['Innova Crysta', route.innova_crysta_price || route.crysta_price],
  ].filter(([, price]) => Number(price) > 0);
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-lg font-bold text-slate-900">
      <Link className="hover:text-amber-600" href={`/routes/${route.slug}`}>{route.from_city} to {route.to_city} Taxi</Link>
    </h3>
    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
      {route.distance_km ? <span>Distance: {route.distance_km} km</span> : null}
      <span>One-way fixed route fare</span>
    </div>
    {prices.length > 0 && <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
      {prices.map(([label, price]) => <div key={label} className="rounded-lg bg-slate-50 p-3">
        <div className="text-xs text-slate-500">{label}</div><div className="mt-1 font-bold text-slate-900">{money(price)}</div>
      </div>)}
    </div>}
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-slate-500">Toll, permit, border tax and driver allowance included; parking extra.</span>
      <Link href={`/routes/${route.slug}`} className="font-semibold text-amber-700 hover:underline">View route details →</Link>
    </div>
  </article>;
}

export default function CityTaxiLandingPage({ cityName, citySlug, profile, outgoingRoutes, incomingRoutes }) {
  const canonical = `${SITE_URL}/routes/${citySlug}-taxi-service`;
  const title = `${cityName} Taxi Service | One Way Cab Booking | Book One Way Taxi`.slice(0, 60);
  const description = `Book a one way taxi from or to ${cityName}. Compare fixed route fares for Sedan, Ertiga, Carens and Innova Crysta. Toll, permit and driver allowance included; parking extra. Call ${phone}.`.slice(0, 160);
  const allRoutes = [...outgoingRoutes, ...incomingRoutes.filter((r) => !outgoingRoutes.some((o) => o.id === r.id))];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    about: { '@type': 'City', name: cityName, ...(profile?.state ? { containedInPlace: { '@type': 'State', name: profile.state } } : {}) },
    mainEntity: { '@type': 'ItemList', numberOfItems: allRoutes.length, itemListElement: allRoutes.slice(0, 100).map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `${r.from_city} to ${r.to_city} Taxi`, url: `${SITE_URL}/routes/${r.slug}` })) }
  };
  const faqs = [
    { q: `Can I book a one way taxi from ${cityName}?`, a: `Yes. Select an available route from ${cityName}, compare the vehicle fares shown on that route page and submit your booking request.` },
    { q: `Can I book a taxi to ${cityName}?`, a: `Yes. Browse the routes arriving in ${cityName}. Each route opens its own page with route-specific details and available fares.` },
    { q: 'What is included in the one-way taxi fare?', a: 'Toll, permit, border tax and driver allowance are included in the stated route fare. Parking charges are extra.' },
    { q: 'Which vehicles can I choose?', a: 'Available route fares may include Sedan (4+1), SUV (6+1) Ertiga, SUV (7+1) Carens and Innova Crysta. The route page shows the vehicles and prices recorded for that route.' },
    { q: 'How do I confirm the exact fare and availability?', a: 'Open the required route page and review its current vehicle fares before booking, or call +91 75675 75578 for assistance.' }
  ];
  return <>
    <Head>
      <title>{title}</title><meta name="description" content={description} /><meta name="robots" content={allRoutes.length ? 'index,follow' : 'noindex,follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" /><meta property="og:site_name" content="Book One Way Taxi" /><meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
    <div className="min-h-screen bg-slate-50 text-slate-800"><Header />
      <main className="container mx-auto px-4 pb-16 pt-28">
        <Breadcrumb items={[{ label: 'Routes', href: '/routes' }, { label: `${cityName} Taxi Service` }]} />
        <section className="mt-6 overflow-hidden rounded-2xl bg-slate-950 px-6 py-12 text-white md:px-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">Book One Way Taxi · City Service</p>
          <h1 className="max-w-4xl text-3xl font-black leading-tight md:text-5xl">{cityName} Taxi Service – One Way Cab Booking</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Find one-way taxi routes from {cityName} and taxis arriving in {cityName}. Compare route-specific fixed fares and open each route for complete vehicle, distance and booking details.</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="tel:+917567575578" className="rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950">Call {phone}</a><a href="https://wa.me/917567575578" className="rounded-lg border border-white/30 px-5 py-3 font-semibold text-white">WhatsApp Booking</a></div>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-lg bg-white/10 p-4"><b className="block text-2xl">{outgoingRoutes.length}</b><span className="text-sm text-slate-300">Routes from {cityName}</span></div><div className="rounded-lg bg-white/10 p-4"><b className="block text-2xl">{incomingRoutes.length}</b><span className="text-sm text-slate-300">Routes to {cityName}</span></div><div className="rounded-lg bg-white/10 p-4"><b className="block text-2xl">4</b><span className="text-sm text-slate-300">Vehicle categories</span></div><div className="rounded-lg bg-white/10 p-4"><b className="block text-2xl">One Way</b><span className="text-sm text-slate-300">Fixed route fares</span></div></div>
        </section>
        <section className="my-10 grid gap-6 md:grid-cols-[1fr_300px]">
          <article className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-slate-900">About {cityName}</h2>
            {profile?.image_url ? <img src={profile.image_url} alt={`${cityName} city`} className="mt-4 max-h-72 w-full rounded-xl object-cover" loading="lazy" /> : null}
            {profile?.description ? <div className="mt-4 whitespace-pre-line leading-7 text-slate-600">{profile.description}</div> : <p className="mt-4 leading-7 text-slate-600">Explore active one-way taxi connections where {cityName} is the pickup or destination city. Select a route below to see its recorded distance, vehicle-wise fixed fares and booking details. {profile?.state ? `${cityName} is in ${profile.state}.` : ''}</p>}
          </article>
          <aside className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold text-slate-900">Fare information</h2><p className="mt-3 text-sm leading-6 text-slate-600">Route fares are stored individually. The route detail page shows the exact fare for each available vehicle. Toll, permit, border tax and driver allowance are included; parking is extra.</p><p className="mt-4 text-sm font-semibold text-slate-800">Need help?</p><a className="mt-1 block font-bold text-amber-700" href="tel:+917567575578">{phone}</a></aside>
        </section>
        <section className="my-12"><div className="mb-6"><h2 className="text-2xl font-bold text-slate-900">One Way Taxi Routes from {cityName}</h2><p className="mt-2 text-slate-600">Compare available destinations and route-wise vehicle fares.</p></div>{outgoingRoutes.length ? <div className="grid gap-4">{outgoingRoutes.map((route) => <RouteCard key={route.id} route={route} />)}</div> : <p className="rounded-xl bg-white p-6 text-slate-600">No active outgoing routes are currently listed.</p>}</section>
        <section className="my-12"><div className="mb-6"><h2 className="text-2xl font-bold text-slate-900">One Way Taxi Routes to {cityName}</h2><p className="mt-2 text-slate-600">Find routes arriving in {cityName} from other cities.</p></div>{incomingRoutes.length ? <div className="grid gap-4">{incomingRoutes.map((route) => <RouteCard key={route.id} route={route} />)}</div> : <p className="rounded-xl bg-white p-6 text-slate-600">No active incoming routes are currently listed.</p>}</section>
        <section className="my-12 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8"><h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions about {cityName} Taxi Service</h2><div className="mt-5 divide-y divide-slate-200">{faqs.map((faq) => <details key={faq.q} className="py-4"><summary className="cursor-pointer font-semibold text-slate-900">{faq.q}</summary><p className="mt-3 leading-7 text-slate-600">{faq.a}</p></details>)}</div></section>
        <section className="rounded-2xl bg-slate-900 p-8 text-center text-white"><h2 className="text-2xl font-bold">Book Your One Way Taxi from or to {cityName}</h2><p className="mx-auto mt-3 max-w-2xl text-slate-300">Choose a route above to check its vehicle-wise fare and complete route information.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><a href="tel:+917567575578" className="rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950">Call Now</a><a href="https://wa.me/917567575578" className="rounded-lg border border-white/30 px-5 py-3 font-semibold">WhatsApp Us</a></div></section>
      </main><Footer /><WhatsAppButton /></div>
  </>;
}
