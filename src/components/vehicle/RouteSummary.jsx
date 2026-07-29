import React from 'react';
import { MapPin, Calendar, Clock, Navigation } from 'lucide-react';
import { format } from 'date-fns';

export default function RouteSummary({ routeData }) {
  if (!routeData) return null;

  const { fromCity, toCity, pickupDate, pickupTime, distance, duration } = routeData;

  const formattedDate = pickupDate ? format(new Date(pickupDate), 'EEE, MMM d, yyyy') : 'Date N/A';

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
          <Navigation className="w-3 h-3" /> Trip Route
        </div>
        <div className="flex items-center flex-wrap gap-2 text-lg md:text-xl font-bold text-slate-900">
          <span>{fromCity}</span>
          <span className="text-slate-400">→</span>
          <span>{toCity}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 md:gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
            <Calendar className="w-3.5 h-3.5" /> Pickup
          </div>
          <div className="font-semibold text-slate-800 text-sm whitespace-nowrap">
            {formattedDate} <span className="text-slate-400">|</span> {pickupTime}
          </div>
        </div>

        {(distance || duration) && (
          <div>
             <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
               <Clock className="w-3.5 h-3.5" /> Trip Info
             </div>
             <div className="font-semibold text-slate-800 text-sm whitespace-nowrap">
               {distance} <span className="text-slate-400">•</span> {duration}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}