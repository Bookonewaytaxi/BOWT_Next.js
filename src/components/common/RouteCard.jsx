import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VehicleImage from '@/components/vehicle/VehicleImage';
import { calculateStartingPrice } from '@/services/RouteService';
import { VEHICLE_TYPES_CONSTANTS } from '@/lib/constants';

export default function RouteCard({ route }) { 
  const fromCity = route.from_city || 'City';
  const toCity = route.to_city || 'City';
  const distance = route.distance_km ? `${route.distance_km} km` : 'Standard Route'; 
  const slug = route.slug || '#';

  const startingPrice = calculateStartingPrice(route);

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const text = `Hi, I'm interested in the ${fromCity} to ${toCity} taxi route. Please provide more details.`;
    window.open(`https://wa.me/917567575578?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Map route prices to vehicle constants for display
  const vehiclesForDisplay = [
    { ...VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === 'sedan'), price: route.sedan_price },
    { ...VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === 'suv6'), price: route.ertiga_price || route.suv_ertiga_price },
    { ...VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === 'suv7'), price: route.carens_price || route.kia_carens_price },
    { ...VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === 'crysta'), price: route.innova_crysta_price || route.crysta_price },
  ].filter(v => v.price && Number(v.price) > 0); 

  const hasVehicles = vehiclesForDisplay.length > 0;

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col h-full p-0">
      {/* Route Header */}
      <div className="bg-slate-50 p-5 border-b border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
           <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
             <span className="truncate max-w-[120px]" title={fromCity}>{fromCity}</span>
             <ArrowRight className="w-4 h-4 text-slate-400" />
             <span className="truncate max-w-[120px]" title={toCity}>{toCity}</span>
           </h3>
        </div>
        <div className="flex items-center justify-between text-sm">
           <span className="text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-medium">
             {distance}
           </span>
           {startingPrice > 0 && (
             <span className="text-blue-700 font-bold text-base">
               From ₹{startingPrice.toLocaleString()}
             </span>
           )}
        </div>
      </div>

      {/* Vehicle Grid Preview */}
      <div className="p-4 flex-1">
         <div className="grid grid-cols-4 gap-2 mb-4">
            {hasVehicles ? (
              vehiclesForDisplay.slice(0, 4).map((v, idx) => (
                 <div key={v.id || idx} className="flex flex-col items-center text-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="w-full h-8 mb-1 overflow-hidden relative">
                       <VehicleImage 
                         src={v.image_url} 
                         alt={v.name} 
                         containerClassName="h-full w-full object-contain"
                         className="object-contain"
                       />
                    </div>
                 </div>
              ))
            ) : (
              <div className="col-span-4 text-center text-xs text-slate-400 py-2">
                Multiple vehicle options available
              </div>
            )}
         </div>

         <div className="flex gap-2 justify-center mb-4">
            <Badge variant="secondary" className="text-[10px] font-normal text-slate-600 bg-slate-100"><Check className="w-3 h-3 mr-1 text-green-500"/> Verified Drivers</Badge>
            <Badge variant="secondary" className="text-[10px] font-normal text-slate-600 bg-slate-100"><Check className="w-3 h-3 mr-1 text-green-500"/> No Hidden Fees</Badge>
         </div>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 mt-auto grid grid-cols-2 gap-3">
        <Link href={`/routes/${slug}`} className="w-full">
          <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 text-xs">
            VIEW DETAILS
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={handleWhatsApp}
          className="w-full border-green-500 text-green-600 hover:bg-green-50 h-10 text-xs gap-1 px-1"
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}