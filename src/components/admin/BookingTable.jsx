import React, { useState } from 'react';
import { 
  Eye, 
  UserPlus, 
  MessageCircle, 
  Trash2, 
  MoreVertical, 
  Calendar, 
  Car, 
  Phone,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useBills } from '@/hooks/useBills';

export default function BookingTable({ 
  bookings, 
  onView, 
  onAssignDriver, 
  onDelete 
}) {
  const [sortConfig, setSortConfig] = useState({ key: 'pickup_date', direction: 'asc' }); // Default sort urgency
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { sendBillEmail } = useBills(); // Assuming we use this for WhatsApp later or similar logic

  // Sorting
  const sortedBookings = [...bookings].sort((a, b) => {
    // Special handling for date sorting combined with time
    if (sortConfig.key === 'pickup_date') {
       const dateA = new Date(`${a.pickup_date}T${a.pickup_time || '00:00'}`);
       const dateB = new Date(`${b.pickup_date}T${b.pickup_time || '00:00'}`);
       if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
       if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
       return 0;
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase().replace(/ /g, '_'); // normalize spaces to underscores for check
    
    if (s.includes('cancel')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (s.includes('driver_assigned')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (s.includes('trip_started')) return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    if (s.includes('trip_completed')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s.includes('pre_scheduled')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (s.includes('confirm')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (s.includes('pending')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  const getPaymentStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'full paid' || s === 'full_paid') return 'text-green-500';
    if (s === 'advance received' || s === 'advance_received') return 'text-yellow-500';
    return 'text-red-500'; // Pending
  };
  
  const getBillStatusBadge = (status) => {
     const s = (status || '').toLowerCase();
     if (s === 'sent') return <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Sent</span>;
     if (s === 'generated') return <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Gen</span>;
     return <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">No</span>;
  };

  const isUrgentPickup = (booking) => {
     if (['Cancelled', 'Trip Completed', 'Trip Started'].includes(booking.status)) return false;
     const now = new Date();
     const pickup = new Date(`${booking.pickup_date}T${booking.pickup_time || '00:00'}`);
     const diffMs = pickup - now;
     const diffHrs = diffMs / (1000 * 60 * 60);
     return diffHrs > 0 && diffHrs <= 12;
  };

  const formatPhoneNumber = (phone) => {
     if (!phone) return '';
     const clean = phone.replace(/\D/g, '');
     if (clean.length === 10) return `+91 ${clean}`; // Default India
     return `+${clean}`;
  };

  const openWhatsApp = (number, message) => {
    if (!number) return;
    const cleanNumber = number.replace(/\D/g, ''); 
    const formattedNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full hidden md:block">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-[1200px]">
          <thead>
            <tr className="bg-[#0f172a] border-b border-slate-700 text-[10px] uppercase tracking-wider text-slate-400">
              <th className="p-4 font-bold cursor-pointer hover:text-white" onClick={() => requestSort('booking_ref_id')}>ID</th>
              <th className="p-4 font-bold cursor-pointer hover:text-white" onClick={() => requestSort('pickup_date')}>
                <div className="flex items-center gap-1">Pickup <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="p-4 font-bold">Customer</th>
              <th className="p-4 font-bold">Route & Car</th>
              <th className="p-4 font-bold hidden xl:table-cell">Driver</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold hidden xl:table-cell">Payment</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginatedBookings.length === 0 ? (
               <tr>
                 <td colSpan="8" className="p-8 text-center text-slate-500 italic">No bookings found for the selected filter.</td>
               </tr>
            ) : (
              paginatedBookings.map((booking) => {
                const urgent = isUrgentPickup(booking);
                
                return (
                <tr 
                  key={booking.id} 
                  className={cn(
                    "transition-colors group",
                    urgent ? "bg-amber-900/10 hover:bg-amber-900/20 border-l-2 border-l-amber-500" : "hover:bg-[#162032] border-l-2 border-l-transparent"
                  )}
                >
                  <td className="p-4 align-top">
                    <span className="font-mono text-amber-500 font-bold text-xs block">
                      {booking.booking_ref_id || booking.id.slice(0, 8)}
                    </span>
                    {urgent && (
                       <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 rounded animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> Urgent
                       </span>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col text-sm text-slate-300">
                      <span className="flex items-center gap-1 font-bold text-white">
                        <Calendar className="h-3 w-3 text-slate-500" /> 
                        {booking.pickup_date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Clock className="h-3 w-3" />
                        {booking.pickup_time}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="text-sm">
                      <p className="font-bold text-white">{booking.name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 font-mono">
                        <Phone className="h-3 w-3" /> {formatPhoneNumber(booking.mobile_number)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1 text-slate-300">
                         <span className="text-green-500 font-bold">F:</span> {booking.from_city}
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                         <span className="text-red-500 font-bold">T:</span> {booking.to_city}
                      </div>
                      <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-700/50 text-slate-400">
                        <Car className="h-3 w-3" /> {booking.car_type || 'Any'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top hidden xl:table-cell">
                    {booking.driver_name ? (
                      <div className="text-xs">
                         <p className="text-white font-bold flex items-center gap-1.5">
                           <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                           {booking.driver_name}
                         </p>
                         <p className="text-slate-500 pl-3.5 mt-0.5">{booking.driver_car_no}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-red-400 italic flex items-center gap-1">
                         <span className="h-2 w-2 rounded-full bg-red-500/50"></span> Unassigned
                      </span>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border whitespace-nowrap ${getStatusColor(booking.status)}`}>
                      {booking.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 align-top hidden xl:table-cell">
                     <span className={`text-xs font-bold ${getPaymentStatusColor(booking.payment_status)}`}>
                        {booking.payment_status || 'Pending'}
                     </span>
                     <div className="text-[10px] text-slate-500 mt-0.5">₹{booking.total_amount?.toLocaleString()}</div>
                  </td>
                  <td className="p-4 align-top text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1e293b] border-slate-700 text-slate-200 w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem onClick={() => onView(booking)} className="hover:bg-slate-800 cursor-pointer">
                          <Eye className="mr-2 h-4 w-4 text-blue-400" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAssignDriver(booking)} className="hover:bg-slate-800 cursor-pointer">
                          <UserPlus className="mr-2 h-4 w-4 text-green-400" /> Assign Driver
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        
                        <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Communication</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => openWhatsApp(booking.mobile_number, `Hi ${booking.name}, regarding your booking #${booking.booking_ref_id}...`)}
                          className="hover:bg-slate-800 cursor-pointer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4 text-green-500" /> WA Customer
                        </DropdownMenuItem>
                        
                        {booking.driver_phone && (
                          <DropdownMenuItem 
                            onClick={() => openWhatsApp(booking.driver_phone, `New Trip: ${booking.from_city} to ${booking.to_city}...`)}
                            className="hover:bg-slate-800 cursor-pointer"
                          >
                            <MessageCircle className="mr-2 h-4 w-4 text-green-500" /> WA Driver
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator className="bg-slate-700" />
                         <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Billing</DropdownMenuLabel>
                         <DropdownMenuItem onClick={() => onView(booking)} className="hover:bg-slate-800 cursor-pointer">
                            <FileText className="mr-2 h-4 w-4 text-amber-500" /> Manage Bill
                         </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem onClick={() => onDelete(booking)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-[#0f172a] border-t border-slate-700 p-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedBookings.length)} of {sortedBookings.length}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}