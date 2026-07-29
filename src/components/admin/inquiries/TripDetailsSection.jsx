import React from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';

export default function TripDetailsSection({ pickupCity, dropCity, travelDate, travelTime }) {
  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-6 shadow-lg mt-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#FFD700]" /> Trip Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
           <label className="text-xs uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1 mb-1">
             <div className="w-2 h-2 rounded-full bg-green-500"></div> Pickup
           </label>
           <p className="text-lg font-bold text-white">{pickupCity}</p>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
           <label className="text-xs uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1 mb-1">
             <div className="w-2 h-2 rounded-full bg-red-500"></div> Drop
           </label>
           <p className="text-lg font-bold text-white">{dropCity}</p>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
           <label className="text-xs uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1 mb-1">
             <Calendar className="w-3 h-3" /> Date
           </label>
           <p className="text-lg font-bold text-white">{travelDate}</p>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
           <label className="text-xs uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1 mb-1">
             <Clock className="w-3 h-3" /> Time
           </label>
           <p className="text-lg font-bold text-white">{travelTime}</p>
        </div>
      </div>
    </div>
  );
}