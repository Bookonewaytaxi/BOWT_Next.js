import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, MessageCircle, ArrowRightLeft, Clock, AlertTriangle, XCircle, 
  ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';
import InquiryDetailsModal from './InquiryDetailsModal';
import ConvertToBookingModal from './ConvertToBookingModal';
import InquiryCard from './InquiryCard';
import { format } from 'date-fns';

export default function InquiryTable({ inquiries, loading, onUpdate }) {
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [convertInquiry, setConvertInquiry] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) {
    return (
       <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse"></div>)}
       </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'New Inquiry': return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      case 'Follow-up Required': return <Badge className="bg-amber-500 hover:bg-amber-600">Follow-up</Badge>;
      case 'Converted to Booking': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Converted</Badge>;
      case 'Lost Inquiry': return <Badge className="bg-red-500 hover:bg-red-600">Lost</Badge>;
      default: return <Badge variant="outline" className="text-slate-400 border-slate-600">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(inquiries.length / itemsPerPage);
  const paginatedData = inquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openWhatsApp = (inquiry) => {
    const mobile = inquiry.mobile_number.replace(/\D/g, '');
    const url = `https://wa.me/${inquiry.country_code ? inquiry.country_code.replace('+','') : '91'}${mobile}`;
    window.open(url, '_blank');
  };

  return (
    <>
    {/* Desktop View */}
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider">
            <tr>
              <th className="p-4">ID & Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Route Info</th>
              <th className="p-4">Fare</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginatedData.length === 0 ? (
               <tr><td colSpan="6" className="p-12 text-center text-slate-500">No inquiries found matching criteria.</td></tr>
            ) : (
               paginatedData.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-700/20 transition-colors group">
                     <td className="p-4">
                        <div className="flex flex-col gap-1">
                           <span className="font-mono text-amber-500 font-bold text-xs">{inquiry.inquiry_id || '---'}</span>
                           <span className="text-xs text-slate-400">{format(new Date(inquiry.created_at), 'MMM dd, HH:mm')}</span>
                        </div>
                     </td>
                     <td className="p-4">
                        <div className="flex flex-col">
                           <span className="font-medium text-white">{inquiry.customer_name || 'Guest'}</span>
                           <span className="text-xs text-slate-400 font-mono">{inquiry.country_code} {inquiry.mobile_number}</span>
                        </div>
                     </td>
                     <td className="p-4">
                        <div className="flex flex-col gap-1">
                           <span className="font-medium text-white">{inquiry.pickup_city} <span className="text-slate-500">→</span> {inquiry.drop_city}</span>
                           <span className="text-xs text-slate-500">
                              {inquiry.pickup_date ? format(new Date(inquiry.pickup_date), 'dd MMM yyyy') : 'Date N/A'} • {inquiry.pickup_time || '--:--'}
                           </span>
                        </div>
                     </td>
                     <td className="p-4 font-bold text-emerald-400">{inquiry.fare_shown ? `₹${inquiry.fare_shown}` : '-'}</td>
                     <td className="p-4">{getStatusBadge(inquiry.status)}</td>
                     <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                           <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300" onClick={() => setSelectedInquiry(inquiry)} title="View Details">
                              <Eye className="h-4 w-4" />
                           </Button>
                           <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:text-green-400" onClick={() => openWhatsApp(inquiry)} title="WhatsApp">
                              <MessageCircle className="h-4 w-4" />
                           </Button>
                           {inquiry.status !== 'Converted to Booking' && (
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400" onClick={() => setConvertInquiry(inquiry)} title="Convert to Booking">
                                 <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                           )}
                        </div>
                     </td>
                  </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Desktop */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-700/50 flex justify-between items-center bg-slate-900/30">
           <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
           <div className="flex gap-2">
              <Button 
                 variant="outline" size="sm" 
                 disabled={currentPage === 1} 
                 onClick={() => setCurrentPage(p => p - 1)}
                 className="h-8 w-8 p-0 border-slate-700 bg-slate-800 hover:bg-slate-700"
              >
                 <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                 variant="outline" size="sm" 
                 disabled={currentPage === totalPages} 
                 onClick={() => setCurrentPage(p => p + 1)}
                 className="h-8 w-8 p-0 border-slate-700 bg-slate-800 hover:bg-slate-700"
              >
                 <ChevronRight className="h-4 w-4" />
              </Button>
           </div>
        </div>
      )}
    </div>

    {/* Mobile View - Cards */}
    <div className="md:hidden space-y-4">
      {paginatedData.length === 0 ? (
        <div className="p-8 text-center text-slate-500 border border-slate-700 border-dashed rounded-lg">No inquiries found.</div>
      ) : (
        paginatedData.map(inquiry => (
          <InquiryCard 
             key={inquiry.id} 
             inquiry={inquiry} 
             onView={(i) => setSelectedInquiry(i)}
             onWhatsApp={(i) => openWhatsApp(i)}
             onConvert={(i) => setConvertInquiry(i)}
          />
        ))
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
           <Button 
              variant="outline" size="sm" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
           >
              Previous
           </Button>
           <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
           <Button 
              variant="outline" size="sm" 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
           >
              Next
           </Button>
        </div>
      )}
    </div>

    <InquiryDetailsModal 
       isOpen={!!selectedInquiry} 
       onClose={() => setSelectedInquiry(null)} 
       inquiry={selectedInquiry}
       onUpdate={onUpdate}
    />

    <ConvertToBookingModal 
       isOpen={!!convertInquiry} 
       onClose={() => setConvertInquiry(null)} 
       inquiry={convertInquiry}
       onSuccess={onUpdate}
    />
    </>
  );
}