import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function BillHeaderSection({ booking }) {
  const status = booking.bill_status || 'Draft';
  const isFinal = status === 'Final';

  return (
    <div className="mb-5 p-4 border border-slate-200 rounded-md bg-white flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          Invoice #{booking.booking_ref_id || booking.id.slice(0, 8)}
          <Badge variant={isFinal ? "default" : "secondary"} className={isFinal ? "bg-green-600" : "bg-amber-500"}>
            {status.toUpperCase()}
          </Badge>
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Booking ID: <span className="font-mono text-slate-700">{booking.booking_ref_id || booking.id.slice(0, 8)}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium">
          {booking.created_at ? format(new Date(booking.created_at), 'PPP') : 'N/A'}
        </span>
      </div>
    </div>
  );
}