import React from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import ContactHero from '@/components/contact/ContactHero';
import TrustBenefitsSection from '@/components/contact/TrustBenefitsSection';
import ContactForm from '@/components/contact/ContactForm';
import MapSection from '@/components/contact/MapSection';
import OtherContactMethods from '@/components/contact/OtherContactMethods';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact One-Way Taxi | Get Instant Quote on WhatsApp</title>
        <meta name="description" content="Contact One-Way Taxi for instant one-way taxi quotes. Share your route details and get fare on WhatsApp. 24/7 support. Safe, reliable, and affordable." />
        <meta name="keywords" content="one-way taxi quote, taxi booking contact, WhatsApp taxi booking, instant taxi quote, 24/7 taxi support, intercity cab contact" />
      </Head>

      <div className="min-h-screen bg-[#0F1419] text-[#E8E8E8] font-sans selection:bg-[#FFD700] selection:text-[#0F1419]">
        <Header />
        
        <main>
          <ContactHero />
          
          <section className="py-16 md:py-24 bg-[#0F1419]">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                <TrustBenefitsSection />
                <ContactForm />
              </div>
            </div>
          </section>

          <MapSection />
          <OtherContactMethods />
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}