import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoImage from '@/components/ui/LogoImage';

export default function Footer() {
  return (
    <footer className="bg-[#050914] text-white pt-20 pb-10 px-4 border-t border-slate-800">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex flex-col items-start gap-4 mb-6">
              <div className="flex items-center gap-3">
                <LogoImage 
                  size="large" 
                  className="rounded-md border border-amber-500/30"
                />
              </div>
              <div>
                 <h2 className="text-xl font-black text-amber-500 tracking-wide">ONE WAY TAXI</h2>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Excellence Defined</p>
              </div>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed text-sm mb-6">
              One Way Taxi redefines intercity travel with luxury, safety, and transparency. Excellence Defined in every mile.
            </p>
            <div className="flex gap-4">
              <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-500 hover:bg-slate-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-500 hover:bg-slate-800">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-slate-400 hover:text-amber-500 hover:bg-slate-800">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex gap-3 text-slate-400 group">
                <MapPin className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                <span className="font-medium text-sm">
                  Shop no 2, One Way Taxi,
                  <br />khodiyar nagar socity opp avsar party plote service road sardar nagar behind
                </span>
              </div>
              <a href="tel:+917567575578" className="flex items-center gap-3 text-slate-400 hover:text-amber-400 transition-colors">
                 <Phone className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-sm">+91 75675 75578</span>
              </a>
              <a href="tel:+917567575579" className="flex items-center gap-3 text-slate-400 hover:text-amber-400 transition-colors">
                 <Phone className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-sm">+91 75675 75579</span>
              </a>
              <a href="mailto:contact@bookonewaytaxi.com" className="flex items-center gap-3 text-slate-400 hover:text-amber-400 transition-colors">
                 <Mail className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-sm break-all">contact@bookonewaytaxi.com</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">Quick Links</h3>
            <div className="space-y-3">
              <a href="/" className="block text-slate-400 hover:text-amber-400 font-medium text-sm transition-colors hover:translate-x-2 transform duration-300">Home</a>
              <a href="/about" className="block text-slate-400 hover:text-amber-400 font-medium text-sm transition-colors hover:translate-x-2 transform duration-300">About Us</a>
              <a href="/services" className="block text-slate-400 hover:text-amber-400 font-medium text-sm transition-colors hover:translate-x-2 transform duration-300">Our Services</a>
              <a href="/routes" className="block text-slate-400 hover:text-amber-400 font-medium text-sm transition-colors hover:translate-x-2 transform duration-300">Popular Routes</a>
              <a href="/contact" className="block text-slate-400 hover:text-amber-400 font-medium text-sm transition-colors hover:translate-x-2 transform duration-300">Contact Us</a>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">Admin Access</h3>
             <p className="text-slate-400 text-sm mb-4">Staff members can login here.</p>
             <Button 
               variant="outline" 
               className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-navy w-full"
               onClick={() => window.location.href = '/admin'}
             >
               Admin Login
             </Button>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500 font-medium text-sm">&copy; {new Date().getFullYear()} One Way Taxi. All rights reserved. | <span className="text-amber-600">Excellence Defined</span></p>
          <a href="https://www.bookonewaytaxi.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 text-sm hover:underline">www.bookonewaytaxi.com</a>
        </div>
      </div>
    </footer>
  );
}