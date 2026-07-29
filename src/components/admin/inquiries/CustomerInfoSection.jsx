import React from 'react';
import { User, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerInfoSection({ name, mobile, pickupCity, dropCity }) {
  const handleWhatsApp = () => {
    const message = `Hi ${name}, we received your inquiry for ${pickupCity} to ${dropCity}. Please confirm your travel date and time.`;
    const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-6 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-[#FFD700]" /> Customer Details
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Full Name</label>
          <p className="text-xl font-medium text-white">{name}</p>
        </div>
        
        <div>
          <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Mobile Number</label>
          <p className="text-xl font-mono text-white tracking-wide">
            {mobile?.replace(/(\d{5})(\d{5})/, "$1 $2")}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
             className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
             onClick={handleWhatsApp}
          >
             <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
          
          <Button 
             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
             onClick={() => window.location.href = `tel:+91${mobile}`}
          >
             <Phone className="w-4 h-4 mr-2" /> Call
          </Button>
        </div>
      </div>
    </div>
  );
}