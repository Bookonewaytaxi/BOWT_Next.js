import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapSection() {
  return (
    <section className="py-20 bg-[#0F1419] relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Proudly Serving <span className="text-[#FFD700]">All Major Cities</span> Across India
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <MapPin className="w-4 h-4 text-[#FFD700]" />
            <p>From North to South, East to West - We cover it all</p>
          </div>
        </div>

        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-[#FFD700]/30 shadow-2xl">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30703867.071679905!2d64.40183608457193!3d20.04915305085991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30635ff06b92b791%3A0xd78c4fa1854213a6!2sIndia!5e0!3m2!1sen!2sin!4v1703666000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(1) contrast(1.2) invert(0.9)' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Service Area Map"
          ></iframe>
          
          {/* Overlay to ensure dark mode feel on map load */}
          <div className="absolute inset-0 bg-[#0F1419]/20 pointer-events-none mix-blend-overlay" />
        </div>
      </div>
    </section>
  );
}