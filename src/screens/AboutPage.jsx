import React from 'react';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';

import AboutHero from '@/components/about/AboutHero';
import WhoWeAre from '@/components/about/WhoWeAre';
import CoreValues from '@/components/about/CoreValues';
import StatsSection from '@/components/about/StatsSection';
import WhyChooseSection from '@/components/about/WhyChooseSection';
import MissionVision from '@/components/about/MissionVision';
import SoftCTA from '@/components/about/SoftCTA';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About One-Way Taxi | Trusted Taxi Service in India</title>
        <meta name="description" content="Learn about One-Way Taxi - India's trusted one-way taxi service provider. Safe, affordable, reliable. 50,000+ happy customers. Save up to 40% on intercity travel." />
        <meta name="keywords" content="about one way taxi, taxi company india, trusted taxi service, intercity cab service, reliable taxi provider" />
      </Head>

      <div className="min-h-screen bg-[#0F1419] text-[#E8E8E8] font-sans selection:bg-[#FFD700] selection:text-[#0F1419]">
        <Header />
        
        <main>
          <AboutHero />
          <WhoWeAre />
          <CoreValues />
          <StatsSection />
          <WhyChooseSection />
          <MissionVision />
          <SoftCTA />
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}