import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-[#0A0D11] relative overflow-hidden">
       {/* Background Accent */}
       <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 to-transparent pointer-events-none" />
       
       <div className="container mx-auto px-4 relative z-10 text-center">
         <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
           Ready to Book Your <span className="text-[#FFD700]">One-Way Taxi?</span>
         </h2>
         <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
           Experience affordable, reliable, and safe taxi service. Book now and save up to 40%!
         </p>
         
         <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => window.location.href='/'}
              className="bg-[#FFD700] text-[#0F1419] hover:bg-[#E5C100] font-bold text-xl h-16 px-12 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Book Now
            </Button>
            <Button 
              onClick={() => window.open('https://wa.me/917567575578', '_blank')}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#0F1419] font-bold text-xl h-16 px-12 rounded-full gap-2 transition-all"
            >
              <MessageCircle className="w-6 h-6" /> WhatsApp Us
            </Button>
         </div>
       </div>
    </section>
  );
}
