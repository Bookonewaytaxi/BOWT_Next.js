import React from 'react';
import { 
  Eye, UserPlus, Trash2, MapPin, Calendar, Clock, Phone, Car, MoreHorizontal, FileText, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BookingCard({ booking, onView, onAssignDriver, onDelete }) {
  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (s.includes('confirmed') || s.includes('assigned')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (s.includes('pending')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const openWhatsApp = (number, message) => {
    if (!number) return;
    const cleanNumber = number.replace(/\D/g, ''); 
    const formattedNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700/50 shadow-lg flex flex-col gap-4 relative">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-xs font-mono text-amber-500 font-bold">#{booking.booking_ref_id || booking.id.slice(0,8)}</span>
          <h3 className="font-bold text-white text-base mt-1">{booking.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono mt-0.5">
             <Phone className="h-3 w-3" /> {booking.mobile_number}
          </div>
        </div>
        <Badge className={`border ${getStatusColor(booking.status)}`}>
           {booking.status || 'Pending'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800">
         <div className="space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold">From</span>
            <p className="font-medium text-slate-200 truncate">{booking.from_city}</p>
         </div>
         <div className="space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold">To</span>
            <p className="font-medium text-slate-200 truncate">{booking.to_city}</p>
         </div>
         <div className="space-y-1 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
               <Calendar className="h-3.5 w-3.5 text-amber-500" /> {booking.pickup_date}
            </div>
         </div>
         <div className="space-y-1 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
               <Clock className="h-3.5 w-3.5 text-amber-500" /> {booking.pickup_time}
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
         <div className="flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5" />
            <span>{booking.car_type || 'Any Car'}</span>
         </div>
         <span className="font-bold text-emerald-400 text-sm">₹{booking.total_amount?.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50 mt-auto">
         <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 h-9"
            onClick={() => onView(booking)}
         >
            <Eye className="h-4 w-4 mr-2" /> View
         </Button>
         
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-800 hover:bg-slate-700 text-slate-300">
                  <MoreHorizontal className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1e293b] border-slate-700 text-slate-200 w-48">
               <DropdownMenuItem onClick={() => onView(booking)}>
                  <Eye className="mr-2 h-4 w-4 text-blue-400" /> View Details
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => onAssignDriver(booking)}>
                  <UserPlus className="mr-2 h-4 w-4 text-green-400" /> Assign Driver
               </DropdownMenuItem>
               <DropdownMenuSeparator className="bg-slate-700" />
               <DropdownMenuItem onClick={() => openWhatsApp(booking.mobile_number, `Hi ${booking.name}, regarding your booking...`)}>
                  <MessageCircle className="mr-2 h-4 w-4 text-green-500" /> WhatsApp
               </DropdownMenuItem>
               <DropdownMenuSeparator className="bg-slate-700" />
               <DropdownMenuItem onClick={() => onDelete(booking)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
    </div>
  );
}