import React from 'react';
import { User, MapPin, Calendar, Car, Hash } from 'lucide-react';
import { formatDate, formatDateTime } from '@/utils/billingUtils';

export default function BookingSummarySection({ booking }) {
  if (!booking) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-500" /> Booking Summary
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Booking ID & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Booking ID</p>
            <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
              {booking.booking_ref_id || booking.id.slice(0, 8)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Booked On</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">
              {formatDateTime(booking.created_at)}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 my-2" />

        {/* Customer Info */}
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-blue-50 p-1.5 rounded-full text-blue-600">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Customer</p>
            <p className="text-sm font-bold text-slate-900">{booking.name}</p>
            <p className="text-xs text-slate-600">{booking.mobile_number}</p>
            {booking.email && <p className="text-xs text-slate-500">{booking.email}</p>}
          </div>
        </div>

        <div className="border-t border-slate-100 my-2" />

        {/* Route Info */}
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-green-50 p-1.5 rounded-full text-green-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="w-full">
            <p className="text-xs text-slate-500 uppercase font-medium">Route</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-medium text-slate-900">{booking.from_city}</span>
              <span className="text-slate-400">→</span>
              <span className="text-sm font-medium text-slate-900">{booking.to_city}</span>
            </div>
          </div>
        </div>

        {/* Travel Info */}
        <div className="flex items-start gap-3">
           <div className="mt-1 bg-amber-50 p-1.5 rounded-full text-amber-600">
              <Calendar className="w-4 h-4" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Travel Date</p>
              <p className="text-sm font-medium text-slate-900">
                 {formatDate(booking.pickup_date)} at {booking.pickup_time}
              </p>
           </div>
        </div>

        {/* Vehicle Info */}
        <div className="flex items-start gap-3">
           <div className="mt-1 bg-purple-50 p-1.5 rounded-full text-purple-600">
              <Car className="w-4 h-4" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Vehicle</p>
              <p className="text-sm font-medium text-slate-900 capitalize">
                 {booking.car_type || 'Taxi'} 
                 <span className="text-slate-400 font-normal ml-1">
                   ({booking.passengers || '4'} Passengers)
                 </span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}