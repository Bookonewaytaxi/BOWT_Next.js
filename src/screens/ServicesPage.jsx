import React from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServicesHero from '@/components/services/ServicesHero';
import ServicesSection from '@/components/services/ServicesSection';
import FleetSection from '@/components/services/FleetSection';
import PricingBenefits from '@/components/services/PricingBenefits';
import HowItWorks from '@/components/services/HowItWorks';
import FAQSection from '@/components/services/FAQSection';
import FinalCTA from '@/components/services/FinalCTA';
import WhatsAppButton from '@/components/common/WhatsAppButton';

export default function ServicesPage() {
  return (
    <>
      <Head>
        <title>One-Way Taxi Service | Affordable Rates | Book Now</title>
        <meta name="description" content="Book affordable one-way taxi service. Save up to 40% vs round-trip. Fixed pricing, 24/7 support, sanitized vehicles. Reliable outstation cabs." />
        <meta name="keywords" content="one-way taxi service, affordable taxi booking, airport taxi service, outstation taxi, corporate taxi service, wedding taxi service" />
      </Head>

      <div className="min-h-screen bg-[#0F1419] text-[#E8E8E8] font-sans selection:bg-[#FFD700] selection:text-[#0F1419]">
        <Header />
        
        <main>
          <ServicesHero />
          <ServicesSection />
          <FleetSection />
          <PricingBenefits />
          <HowItWorks />
          <FAQSection />
          <FinalCTA />
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}