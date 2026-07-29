import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingForm from '@/components/home/BookingForm';
import TrustBadges from '@/components/home/TrustBadges';
import TrustBenefits from '@/components/home/TrustBenefits';
import TrustNumbers from '@/components/home/TrustNumbers';
import PopularRoutesSection from '@/components/home/PopularRoutesSection';
import FareTableSection from '@/components/home/FareTableSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CorporateSection from '@/components/home/CorporateSection';
import FAQSection from '@/components/home/FAQSection';
import FloatingWhatsAppButton from '@/components/home/FloatingWhatsAppButton';

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "TaxiService",
  "name": "One Way Taxi",
  "image": "https://bookonewaytaxi.in/logo.jpg",
  "url": "https://bookonewaytaxi.in",
  "telephone": "+91-7567575578",
  "priceRange": "₹₹",
  "foundingDate": "2016",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Shop No 2, Book One Way Taxi, Opp Avsar Party Plot, Service Road, Behind Hansol Gam, Hansol",
    "addressLocality": "Sardarnagar, Ahmedabad",
    "addressRegion": "Gujarat",
    "addressCountry": "IN"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  }
};

export default function HomePage() {
  return (
    <>
      <Head>
        <title>One Way Taxi - Premium City-to-City Cab Service | Ahmedabad</title>
        <meta name="description" content="Book verified premium one-way taxis for intercity travel across Gujarat. No return fare, fixed transparent pricing, instant WhatsApp confirmation. Trusted since 2016." />
        <meta property="og:title" content="One Way Taxi - Premium City-to-City Cab Service" />
        <meta property="og:description" content="No return fare. Fixed transparent pricing. Verified drivers. Instant WhatsApp confirmation. 800+ routes across Gujarat." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bookonewaytaxi.in" />
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Head>

      <div className="min-h-screen bg-slate-950 font-sans flex flex-col text-slate-100 overflow-x-hidden">
        <Header />

        {/* Hero Section */}
        <section className="relative min-h-screen pt-24 pb-16 px-4 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-950/90 to-transparent z-10"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
             <img 
               src="https://images.unsplash.com/photo-1647871609818-ca43ac657e1d?q=80&w=2070&auto=format&fit=crop" 
               alt="Luxury Taxi Background" 
               className="w-full h-full object-cover opacity-60 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
             />
          </div>
          
          <div className="container mx-auto relative z-20">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Content - Booking Form (shows first on mobile) */}
              <motion.div 
                 initial={{ opacity: 0, x: -50 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ duration: 0.8, delay: 0.2 }}
                 className="lg:col-span-5 relative order-1 lg:order-1"
              >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                
                <BookingForm />
              </motion.div>

              {/* Right Content */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, ease: "easeOut" }} 
                className="lg:col-span-7 text-center lg:text-left space-y-8 order-2 lg:order-2"
              >
                <div className="inline-flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Premium Intercity Travel</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-white font-bold text-xs">4.8★ Google Rating</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-xl">
                    Premium One-Way <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-600">Taxi Booking</span>
                  </h1>
                  <p className="text-lg md:text-2xl text-slate-200 font-light tracking-wide">
                    Instant Quote & Verified Drivers
                  </p>
                  <p className="text-slate-400 max-w-xl mx-auto lg:mx-0 text-sm md:text-base">
                    Serving Gujarat since 2016. Fixed, all-inclusive one-way fares across 800+ routes — no return charges, no hidden tolls, no surprises at drop-off.
                  </p>
                </div>
                
                <TrustBadges />

                <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                   <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />)}
                   </div>
                   <p className="text-sm font-medium text-slate-300 border-l border-slate-700 pl-4">
                      4.8/5 Rating • <span className="text-white font-bold">15,000+ Happy Customers</span>
                   </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <TrustNumbers />

        <TrustBenefits />

        <FareTableSection />

        <PopularRoutesSection />

        {/* How It Works Section */}
        <section className="py-24 bg-black relative border-t border-slate-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">
               Simple 3-Step Process
            </h2>
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
               {[
                  { title: "Book Your Cab", desc: "Enter route details and choose your premium vehicle.", icon: CheckCircle },
                  { title: "Instant Confirmation", desc: "Get booking details & driver info via WhatsApp immediately.", icon: Clock },
                  { title: "Enjoy The Ride", desc: "Professional chauffeur, clean car, safe journey.", icon: ShieldCheck }
               ].map((step, idx) => (
                  <div key={idx} className="relative group">
                     <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 text-3xl font-bold text-amber-500 border border-slate-800 shadow-2xl shadow-amber-900/10 group-hover:scale-110 transition-transform duration-300">
                        <step.icon className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                     <p className="text-slate-400 leading-relaxed px-4">{step.desc}</p>
                     
                     {idx < 2 && (
                        <div className="hidden md:block absolute top-10 left-2/3 w-full h-[2px] bg-gradient-to-r from-slate-800 to-slate-900 -z-10"></div>
                     )}
                  </div>
               ))}
            </div>
          </div>
        </section>

        <TestimonialsSection />

        <CorporateSection />

        <FAQSection />

        <Footer />
        <FloatingWhatsAppButton />
      </div>
    </>
  );
}
