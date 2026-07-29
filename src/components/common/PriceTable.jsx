import React from 'react';
import { Users, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { calculateFare, VEHICLE_TYPES_CONSTANTS } from '@/lib/constants';
import VehicleImage from '@/components/vehicle/VehicleImage';

// Accepts either 'distance' prop to calculate on the fly using constants, 
// OR 'vehicles' prop with pre-calculated data.
export default function PriceTable({ distance, vehicles }) {
  
  let displayVehicles = [];

  if (vehicles && vehicles.length > 0) {
    displayVehicles = vehicles;
  } else if (distance) {
    // Fallback to constants if no vehicle data passed but distance is present
    displayVehicles = VEHICLE_TYPES_CONSTANTS.map(v => ({
      ...v,
      price: calculateFare(distance, v.price_per_km),
      calculated: true
    }));
  }

  if (displayVehicles.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      {/* Table Header - Desktop */}
      <div className="hidden md:grid grid-cols-12 bg-slate-50 p-4 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
        <div className="col-span-2">Vehicle Image</div>
        <div className="col-span-3">Vehicle Type</div>
        <div className="col-span-2 text-center">Capacity</div>
        <div className="col-span-2 text-center">Rate/Km</div>
        <div className="col-span-3 text-right">Total Fare</div>
      </div>
      
      <div className="divide-y divide-slate-100">
        {displayVehicles.map((v, idx) => {
           // Normalize data properties
           const price = v.price || v.total_amount || 0;
           const marketPrice = Math.round(price * 1.35);
           const savings = marketPrice - price;
           const capacity = v.seating_capacity || v.capacity;
           const isPremium = v.type_key?.includes('premium') || v.type_key === 'innova_crysta';

           return (
            <div key={idx} className={`flex flex-col md:grid md:grid-cols-12 p-4 items-center transition-colors hover:bg-slate-50/50 group ${isPremium ? 'bg-amber-50/30' : ''}`}>
              
              {/* Vehicle Image - Desktop & Mobile */}
              <div className="col-span-2 w-full md:w-auto flex justify-center md:justify-start mb-4 md:mb-0">
                 <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                    <VehicleImage 
                       src={v.image_url} 
                       alt={v.name} 
                       containerClassName="w-full h-full"
                    />
                 </div>
              </div>

              {/* Vehicle Info */}
              <div className="col-span-3 w-full md:w-auto text-center md:text-left mb-2 md:mb-0">
                  <div className={`font-bold text-base md:text-lg text-slate-900 group-hover:text-blue-700 transition-colors`}>
                    {v.name}
                  </div>
                  <div className="text-xs text-slate-500">{v.description || 'Comfortable & Clean'}</div>
              </div>
              
              {/* Capacity - Desktop */}
              <div className="col-span-2 hidden md:flex justify-center">
                 <Badge variant="outline" className="bg-white gap-1 text-slate-600 font-normal">
                    <Users className="w-3 h-3" /> {capacity} Seats
                 </Badge>
              </div>

              {/* Rate - Desktop */}
              <div className="col-span-2 hidden md:flex flex-col items-center justify-center">
                 <span className="font-bold text-slate-700">₹{v.price_per_km}/km</span>
              </div>
              
              {/* Mobile Info Row */}
              <div className="flex md:hidden w-full justify-between items-center mb-4 text-sm text-slate-500 px-4">
                 <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {capacity} Seats</div>
                 <div className="flex items-center gap-1">₹{v.price_per_km}/km</div>
              </div>

              {/* Price */}
              <div className="col-span-3 text-right w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 flex md:block justify-between items-center px-2 md:px-0">
                <div className="md:hidden font-bold text-slate-700">Estimated Fare</div>
                <div>
                   <div className="flex items-center justify-end gap-2">
                     <span className="text-xs text-slate-400 line-through">₹{marketPrice}</span>
                     <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 text-[10px] px-1.5 py-0 h-5">
                       SAVE ₹{savings}
                     </Badge>
                   </div>
                   <div className="text-2xl font-black text-slate-900 flex items-center justify-end">
                     <IndianRupee className="w-5 h-5" />{price}
                   </div>
                   <div className="text-[10px] text-slate-400 font-medium">All Inclusive Price</div>
                </div>
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
}