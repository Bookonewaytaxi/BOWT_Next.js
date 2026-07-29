import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageCircle, ArrowRightLeft, Calendar, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function InquiryCard({ inquiry, onView, onConvert, onWhatsApp }) {
  const getStatusBadge = (status) => {
    switch(status) {
      case 'New Inquiry': return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case 'Follow-up Required': return <Badge className="bg-amber-500 hover:bg-amber-600">Follow-up</Badge>;
      case 'Converted to Booking': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Converted</Badge>;
      case 'Lost Inquiry': return <Badge className="bg-red-500 hover:bg-red-600">Lost</Badge>;
      default: return <Badge variant="outline" className="text-slate-400 border-slate-600">{status}</Badge>;
    }
  };

  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
         <div>
            <span className="font-mono text-amber-500 font-bold text-xs">#{inquiry.inquiry_id || '---'}</span>
            <h4 className="font-bold text-white mt-1">{inquiry.customer_name || 'Guest'}</h4>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
               <Phone className="h-3 w-3" /> {inquiry.mobile_number}
            </div>
         </div>
         {getStatusBadge(inquiry.status)}
      </div>

      <div className="bg-slate-900/40 rounded p-3 text-sm space-y-2 border border-slate-800">
         <div className="flex items-center gap-2">
             <MapPin className="h-4 w-4 text-slate-500" />
             <div className="flex gap-1 items-center truncate text-slate-300">
                <span className="font-medium">{inquiry.pickup_city}</span>
                <span className="text-slate-600">→</span>
                <span className="font-medium">{inquiry.drop_city}</span>
             </div>
         </div>
         <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{inquiry.pickup_date ? format(new Date(inquiry.pickup_date), 'dd MMM') : 'N/A'}</span>
            <span className="text-slate-600">|</span>
            <span>{inquiry.pickup_time}</span>
         </div>
      </div>

      <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-800">
         <span className="text-emerald-400 font-bold text-sm">
           {inquiry.fare_shown ? `₹${inquiry.fare_shown}` : 'Fare: -'}
         </span>
         
         <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400" onClick={() => onView(inquiry)}>
               <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => onWhatsApp(inquiry)}>
               <MessageCircle className="h-4 w-4" />
            </Button>
            {inquiry.status !== 'Converted to Booking' && (
               <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-500" onClick={() => onConvert(inquiry)}>
                  <ArrowRightLeft className="h-4 w-4" />
               </Button>
            )}
         </div>
      </div>
    </div>
  );
}