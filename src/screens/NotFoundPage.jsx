import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Home, Map, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page Not Found | One Way Taxi</title>
        <meta name="description" content="The page you are looking for does not exist on One Way Taxi." />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-9xl font-black text-slate-200">404</h1>
            <div className="relative -mt-16 mb-8">
              <h2 className="text-2xl font-bold text-navy">Page Not Found</h2>
              <p className="text-slate-500 mt-2">
                The route or page you are looking for might have been moved or doesn't exist.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="w-full sm:w-auto gap-2 bg-amber-500 hover:bg-amber-600 text-navy font-bold">
                  <Home className="h-4 w-4" /> Go Home
                </Button>
              </Link>
              <Link href="/routes">
                <Button variant="outline" className="w-full sm:w-auto gap-2 border-slate-300">
                  <Map className="h-4 w-4" /> View All Routes
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}