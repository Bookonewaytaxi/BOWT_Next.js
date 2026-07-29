import React from 'react';
import { Calendar, Clock, MapPin, Users, Info } from 'lucide-react';
import VehicleImage from '@/components/vehicle/VehicleImage';
import { cn } from '@/lib/utils';

export default function BookingSummary({ 
  vehicle, 
  routeData, 
  fare,
  couponDiscount = 0,
  className
}) {
  const finalFare = fare - couponDiscount;

  return (
    <div className={cn("rounded-xl overflow-hidden shadow-lg border border-white/5", className)}>
      {/* Header */}
      <div className="bg-[#0F1419] px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-sm">Booking Summary</h3>
        </div>
        <div className="px-2 py-0.5 bg-[#FFD700] text-[#0F1419] text-[10px] font-bold rounded-full">
          {routeData.distance}
        </div>
      </div>

      <div className="bg-[#151b23] p-4 space-y-4">
        {/* Route Details */}
        <div className="space-y-4 relative">
          {/* Connecting Line */}
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#FFD700] to-[#0F1419] opacity-30"></div>
          
          {/* Pickup */}
          <div className="relative z-10 flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#FFD700]/10 border border-[#FFD700] flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#FFD700] tracking-wider uppercase block">Pickup</span>
              <h4 className="text-white font-semibold text-sm mt-0.5 leading-tight truncate">{routeData.from_city}</h4>
              <div className="flex items-center gap-2 mt-1 text-slate-400 text-[10px] font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 text-[#FFD700]" /> {routeData.pickup_date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-[#FFD700]" /> {routeData.pickup_time}
                </span>
              </div>
            </div>
          </div>

          {/* Drop */}
          <div className="relative z-10 flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#1e293b] border border-slate-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Drop</span>
              <h4 className="text-white font-semibold text-sm mt-0.5 leading-tight truncate">{routeData.to_city}</h4>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/5"></div>

        {/* Vehicle Info */}
        <div className="bg-[#0F1419] rounded-lg p-2.5 border border-white/5 flex gap-3 items-center">
          <div className="w-12 h-9 bg-white/5 rounded-md overflow-hidden shrink-0">
            <VehicleImage src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-xs truncate">{vehicle.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-white/5 px-1 py-0.5 rounded">
                <Users className="w-2.5 h-2.5" /> {vehicle.capacity}
              </span>
              <span className="text-[10px] text-[#FFD700] font-medium border border-[#FFD700]/20 px-1 py-0.5 rounded">
                {vehicle.type_key}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Market Price</span>
            <span className="line-through decoration-red-500 decoration-2">₹{Math.round(fare * 1.2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs text-white">
            <span>Our Price</span>
            <span className="font-bold">₹{fare}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-xs text-green-400">
              <span>Coupon Discount</span>
              <span>- ₹{couponDiscount}</span>
            </div>
          )}

          <div className="h-px w-full bg-white/10 my-1"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-sm">Total Payable</span>
            <span className="text-xl font-black text-[#FFD700]">₹{finalFare}</span>
          </div>
        </div>

        {/* Info Note about extra charges */}
        <div className="bg-[#FFD700]/5 border border-[#FFD700]/10 rounded-md p-2 flex gap-2 items-start">
          <Info className="w-3 h-3 text-[#FFD700] shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Parking charges are extra and paid directly to the driver if applicable.
          </p>
        </div>
      </div>
    </div>
  );
}