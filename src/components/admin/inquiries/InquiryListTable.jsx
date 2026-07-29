import React from 'react';
import { useRouter } from 'next/router';
import { Eye, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isValid, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

const StatusBadge = ({ status }) => {
  const styles = {
    new_inquiry: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    follow_up: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    converted: 'bg-green-500/10 text-green-500 border-green-500/20',
    lost: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const labels = {
    new_inquiry: 'New Inquiry',
    follow_up: 'Follow Up',
    converted: 'Converted',
    lost: 'Lost',
  };

  const normalizedStatus = status ? status.toLowerCase() : 'new_inquiry';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[normalizedStatus] || styles.new_inquiry}`}>
      {labels[normalizedStatus] || status || 'Unknown'}
    </span>
  );
};

const formatDateSafe = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm') : dateString;
  } catch (e) {
    return dateString;
  }
};

const LoadingSkeleton = () => (
  <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden">
    <div className="border-b border-slate-700 bg-[#0f172a] h-12"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border-b border-slate-700/50 flex gap-4">
        <Skeleton className="h-6 w-24 bg-slate-800" />
        <Skeleton className="h-6 w-32 bg-slate-800" />
        <Skeleton className="h-6 w-32 bg-slate-800" />
        <Skeleton className="h-6 w-full bg-slate-800" />
      </div>
    ))}
  </div>
);

export default function InquiryListTable({ inquiries = [], loading = false }) {
  const router = useRouter();

  const handleWhatsApp = (e, mobile, name, pickup, drop) => {
    e.stopPropagation();
    if (!mobile) return;
    const message = `Hi ${name || 'Customer'}, we received your inquiry for ${pickup || 'taxi'} to ${drop || 'destination'}. Please confirm your travel date and time.`;
    const url = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCall = (e, mobile) => {
    e.stopPropagation();
    if (mobile) {
      window.location.href = `tel:+91${mobile}`;
    }
  };

  if (loading) {
     return <LoadingSkeleton />;
  }

  if (!inquiries || inquiries.length === 0) {
     return (
        <div className="w-full py-16 flex flex-col items-center justify-center text-slate-500 bg-[#1e293b] rounded-xl border border-dashed border-slate-700">
           <div className="bg-slate-800/50 p-4 rounded-full mb-3">
             <MessageCircle className="w-8 h-8 text-slate-400" />
           </div>
           <p className="text-lg font-medium text-slate-300">No inquiries found</p>
           <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
     );
  }

  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden shadow-xl bg-[#1e293b]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0f172a] text-slate-400 uppercase font-medium text-xs border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Inquiry ID</th>
              <th className="px-6 py-4 whitespace-nowrap">Received On</th>
              <th className="px-6 py-4 whitespace-nowrap">Customer</th>
              <th className="px-6 py-4 whitespace-nowrap">Mobile</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4 whitespace-nowrap">Travel Date</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {inquiries.map((inquiry) => (
              <tr 
                key={inquiry.id} 
                className="hover:bg-[#2d3748] transition-colors cursor-pointer group"
                onClick={() => router.push(`/admin/inquiries/${inquiry.id}`)}
              >
                <td className="px-6 py-4 font-mono text-slate-300 group-hover:text-[#FFD700]">
                  #{inquiry.id ? inquiry.id.slice(0, 8).toUpperCase() : '---'}
                </td>
                <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                  {formatDateSafe(inquiry.created_at)}
                </td>
                <td className="px-6 py-4 font-medium text-white">
                  {inquiry.customer_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-slate-300 font-mono">
                  {inquiry.customer_mobile ? inquiry.customer_mobile.replace(/(\d{5})(\d{5})/, "$1 $2") : '---'}
                </td>
                <td className="px-6 py-4 text-slate-300">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{inquiry.pickup_city || '---'}</span>
                    <span className="text-xs text-slate-500">to {inquiry.drop_city || '---'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                  {inquiry.travel_date || '-'} <span className="text-slate-500 text-xs">{inquiry.travel_time ? `(${inquiry.travel_time})` : ''}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={inquiry.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 hover:text-green-500 hover:bg-green-500/10"
                             onClick={(e) => handleWhatsApp(e, inquiry.customer_mobile, inquiry.customer_name, inquiry.pickup_city, inquiry.drop_city)}
                             disabled={!inquiry.customer_mobile}
                          >
                             <MessageCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>WhatsApp</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 hover:text-blue-500 hover:bg-blue-500/10"
                             onClick={(e) => handleCall(e, inquiry.customer_mobile)}
                             disabled={!inquiry.customer_mobile}
                          >
                             <Phone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Call</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                             <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>View Details</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}