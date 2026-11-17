import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import Breadcrumb from '@/components/common/Breadcrumb';

const SITE_URL = 'https://www.bookonewaytaxi.in';
const PHONE = '+91 75675 75578';
const DEFAULT_FAQS = [
  { q: 'Can I book a one-way taxi from this city?', a: 'Yes. Choose a destination from the pickup routes listed on this page and open the route page to review its details and booking options.' },
  { q: 'Can I book a taxi to this city?', a: 'Yes. Use the incoming routes section to find services from other cities to this destination.' },
  { q: 'How can I check vehicle availability and fare?', a: 'Open the individual route page or contact our booking team. Route availability and fares are confirmed for the selected journey.' },
  { q: 'How do I book?', a: 'Call or WhatsApp our booking team with your pickup, destination, travel date and preferred vehicle.' }
];

function TextSection({ title, body, id }) {
  if (!body) return null;
  return <section id={id} className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    <div className="mt-4 whitespace-pre-line leading-8 text-slate-600">{body}</div>
  </section>;
}

function RouteLinks({ title, intro, routes, emptyText }) {
  return <section className="my-10" aria-label={title}>
    <div className="mb-5"><h2 className="text-2xl font-bold text-slate-900">{title}</h2>{intro ? <p className="mt-2 max-w-3xl leading-7 text-slate-600">{intro}</p> : null}</div>
    {routes.length ? <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {routes.slice(0, 60).map((route) => <li key={route.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-amber-400">
        <Link className="font-semibold text-slate-800 hover:text-amber-700" href={`/routes/${route.slug}`}>{route.from_city} to {route.to_city} Taxi <span aria-hidden="true">→</span></Link>
      </li>)}
    </ul> : <p className="rounded-xl bg-white p-5 text-sm text-slate-500">{emptyText}</p>}
  </section>;
}

export default function CityTaxiLandingPage({ cityName, citySlug, profile, seo, outgoingRoutes = [], incomingRoutes = [] }) {
  const content = profile?.page_content || {};
  const canonical = `${SITE_URL}/routes/${citySlug}-taxi-service`;
  const title = (seo?.meta_title || `${cityName} Taxi Service | One Way Cab Booking | Book One Way Taxi`).slice(0, 60);
  const description = (seo?.meta_description || `Book a one-way taxi from or to ${cityName}. Explore pickup and drop routes, travel information and booking support with Book One Way Taxi. Call ${PHONE}.`).slice(0, 160);
  const keywords = Array.isArray(seo?.keywords) ? seo.keywords.join(', ') : '';
  const allRoutes = [...outgoingRoutes, ...incomingRoutes.filter((r) => !outgoingRoutes.some((o) => o.id === r.id))];
  const popularSlugs = Array.isArray(content.popular_route_slugs) ? content.popular_route_slugs : [];
  const popularRoutes = popularSlugs.length
    ? popularSlugs.map((slug) => allRoutes.find((r) => r.slug === slug)).filter(Boolean).slice(0, 12)
    : [];
  const faqs = Array.isArray(content.faqs) && content.faqs.length
    ? content.faqs.filter((f) => f && typeof f.q === 'string' && typeof f.a === 'string')
    : DEFAULT_FAQS;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    about: { '@type': 'City', name: cityName, ...(profile?.state ? { containedInPlace: { '@type': 'State', name: profile.state } } : {}) },
    mainEntity: [
      { '@type': 'ItemList', name: content.pickup_heading || `Taxi routes from ${cityName}`, numberOfItems: outgoingRoutes.length, itemListElement: outgoingRoutes.slice(0, 100).map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `${r.from_city} to ${r.to_city} Taxi`, url: `${SITE_URL}/routes/${r.slug}` })) },
      { '@type': 'ItemList', name: content.drop_heading || `Taxi routes to ${cityName}`, numberOfItems: incomingRoutes.length, itemListElement: incomingRoutes.slice(0, 100).map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `${r.from_city} to ${r.to_city} Taxi`, url: `${SITE_URL}/routes/${r.slug}` })) },
      { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
    ]
  };
  return <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={allRoutes.length ? 'index,follow,max-image-preview:large' : 'noindex,follow'} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" /><meta property="og:site_name" content="Book One Way Taxi" /><meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={canonical} />
      {profile?.image_url ? <meta property="og:image" content={profile.image_url} /> : null}
      <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </Head>
    <div className="min-h-screen bg-slate-50 text-slate-800"><Header />
      <main className="container mx-auto px-4 pb-16 pt-28">
        <Breadcrumb items={[{ label: 'Routes', href: '/routes' }, { label: `${cityName} Taxi Service` }]} />
        <section className="mt-6 overflow-hidden rounded-2xl bg-slate-950 px-6 py-12 text-white md:px-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">{content.hero_eyebrow || 'Book One Way Taxi · City Travel'}</p>
          <h1 className="max-w-4xl text-3xl font-black leading-tight md:text-5xl">{content.hero_title || `${cityName} Taxi Service – One Way Cab Booking`}</h1>
          <p className="mt-5 max-w-3xl whitespace-pre-line text-lg leading-8 text-slate-300">{content.hero_intro || `Plan an outstation one-way journey from ${cityName} or arrange a taxi to ${cityName}. Explore route links, travel information and booking support from Book One Way Taxi.`}</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="tel:+917567575578" className="rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950">Call {PHONE}</a><a href="https://wa.me/917567575578" className="rounded-lg border border-white/30 px-5 py-3 font-semibold text-white">WhatsApp Booking</a></div>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3"><div className="rounded-lg bg-white/10 p-4"><b className="block text-2xl">{outgoingRoutes.length}</b><span className="text-sm text-slate-300">Pickup routes</span></div><div className="rounded-lg bg-white/10 p-4"><b className="block text-2xl">{incomingRoutes.length}</b><span className="text-sm text-slate-300">Drop routes</span></div><div className="rounded-lg bg-white/10 p-4"><b className="block text-2xl">One Way</b><span className="text-sm text-slate-300">Outstation taxi service</span></div></div>
        </section>
        {profile?.image_url ? <img src={profile.image_url} alt={content.image_alt || `${cityName} city and taxi travel`} className="mt-8 max-h-96 w-full rounded-2xl object-cover" loading="lazy" /> : null}
        <TextSection id="about" title={content.about_heading || `About taxi services in ${cityName}`} body={content.about_body || profile?.description || `Book One Way Taxi helps travellers explore one-way outstation taxi connections from and to ${cityName}. Select a route below to open its dedicated page for journey details and booking assistance.`} />
        <TextSection id="pickup-information" title={content.pickup_info_heading || `Planning a taxi pickup from ${cityName}`} body={content.pickup_info_body || `For a pickup from ${cityName}, choose your destination from the routes listed below. Share your travel date, pickup point, passenger count and preferred vehicle when enquiring so the booking team can confirm availability.`} />
        <RouteLinks title={content.pickup_heading || `One Way Taxi Routes from ${cityName}`} intro={content.pickup_intro || `Explore destinations served by active one-way routes starting in ${cityName}. Each link opens the individual route page; fares are not displayed on this city overview.`} routes={outgoingRoutes} emptyText={`No active pickup routes from ${cityName} are currently listed.`} />
        <TextSection id="drop-information" title={content.drop_info_heading || `Booking a taxi to ${cityName}`} body={content.drop_info_body || `Arriving in ${cityName}? Browse the incoming route links below and open your origin-to-${cityName} route page. Confirm the exact drop location and arrival time with the booking team.`} />
        <RouteLinks title={content.drop_heading || `One Way Taxi Routes to ${cityName}`} intro={content.drop_intro || `Find active routes from other cities with ${cityName} as the destination. Use these internal links to explore the relevant route details.`} routes={incomingRoutes} emptyText={`No active drop routes to ${cityName} are currently listed.`} />
        <section className="my-10"><div className="mb-5"><h2 className="text-2xl font-bold text-slate-900">{content.popular_heading || `Popular Taxi Routes from and to ${cityName}`}</h2>{content.popular_intro ? <p className="mt-2 max-w-3xl leading-7 text-slate-600">{content.popular_intro}</p> : <p className="mt-2 max-w-3xl leading-7 text-slate-600">Only routes selected and approved in the City SEO editor are shown here. These are curated internal links, not a booking-volume ranking.</p>}</div>
          {popularRoutes.length ? <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{popularRoutes.map((r) => <li key={r.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4"><Link href={`/routes/${r.slug}`} className="font-semibold text-slate-800 hover:text-amber-800">{r.from_city} to {r.to_city} Taxi →</Link></li>)}</ul> : <p className="rounded-xl bg-white p-5 text-slate-500">No popular routes have been selected for this city yet. Add verified route slugs in the City SEO editor to publish this section.</p>}
        </section>
        <TextSection id="booking-guidance" title={content.booking_heading || `How to book a one-way taxi in ${cityName}`} body={content.booking_body || `Contact Book One Way Taxi by call or WhatsApp. Share your pickup city, destination, exact pickup address, travel date, time and preferred vehicle. The booking team can then confirm route availability and the applicable fare before you proceed.`} />
        <section className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8"><h2 className="text-2xl font-bold text-slate-900">{content.faq_heading || `Frequently Asked Questions – ${cityName} Taxi`}</h2><div className="mt-5 divide-y divide-slate-200">{faqs.map((faq, i) => <details key={i} className="py-4"><summary className="cursor-pointer font-semibold text-slate-900">{faq.q}</summary><p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{faq.a}</p></details>)}</div></section>
        <section className="rounded-2xl bg-slate-900 p-8 text-center text-white"><h2 className="text-2xl font-bold">{content.cta_heading || `Need a One Way Taxi from or to ${cityName}?`}</h2><p className="mx-auto mt-3 max-w-2xl whitespace-pre-line text-slate-300">{content.cta_body || 'Contact our team with your journey details to check availability and get booking assistance.'}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><a href="tel:+917567575578" className="rounded-lg bg-amber-400 px-5 py-3 font-bold text-slate-950">Call Now</a><a href="https://wa.me/917567575578" className="rounded-lg border border-white/30 px-5 py-3 font-semibold">WhatsApp Us</a></div></section>
      </main><Footer /><WhatsAppButton /></div>
  </>;
}
