import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInquiries } from '@/hooks/useInquiries';
import CustomerInfoSection from '@/components/admin/inquiries/CustomerInfoSection';
import TripDetailsSection from '@/components/admin/inquiries/TripDetailsSection';
import AdminNotesSection from '@/components/admin/inquiries/AdminNotesSection';
import StatusActionsSection from '@/components/admin/inquiries/StatusActionsSection';
import ConvertToBookingModal from '@/components/admin/ConvertToBookingModal';
import { format } from 'date-fns';
import BackButton from '@/components/admin/BackButton'; // Import BackButton

export default function InquiryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { fetchInquiryDetail, updateInquiryStatus, updateInquiryNotes, loading } = useInquiries();
  const [inquiry, setInquiry] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);

  useEffect(() => {
    loadInquiry();
  }, [id]);

  const loadInquiry = async () => {
    const data = await fetchInquiryDetail(id);
    setInquiry(data);
  };

  const handleStatusUpdate = async (status) => {
    const success = await updateInquiryStatus(id, status);
    if (success) loadInquiry();
  };

  const handleNotesUpdate = async (notes) => {
    const success = await updateInquiryNotes(id, notes);
    if (success) loadInquiry();
  };

  if (loading && !inquiry) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  if (!inquiry) return <div className="p-8 text-white">Inquiry not found</div>;

  return (
    <>
      <Head>
        <title>Inquiry #{id.slice(0, 8)} | Admin</title>
      </Head>
      
      <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 pb-20">
        <div className="max-w-6xl mx-auto">
          
          {/* BackButton added here */}
          <BackButton to="/admin/inquiries" label="Back to Inquiries" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl font-bold text-white tracking-tight">
                   Inquiry <span className="text-slate-500 text-xl font-mono">#{inquiry.id.slice(0, 8).toUpperCase()}</span>
                 </h1>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                    ${inquiry.status === 'new_inquiry' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      inquiry.status === 'converted' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      inquiry.status === 'lost' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                    {inquiry.status.replace('_', ' ')}
                 </span>
              </div>
              <p className="text-slate-400 text-sm">
                Received on {format(new Date(inquiry.created_at), 'PPP p')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
               <CustomerInfoSection 
                 name={inquiry.customer_name} 
                 mobile={inquiry.customer_mobile}
                 pickupCity={inquiry.pickup_city}
                 dropCity={inquiry.drop_city}
               />
               
               <TripDetailsSection 
                 pickupCity={inquiry.pickup_city}
                 dropCity={inquiry.drop_city}
                 travelDate={inquiry.travel_date}
                 travelTime={inquiry.travel_time}
               />
            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
               <AdminNotesSection 
                  notes={inquiry.admin_notes} 
                  onSave={handleNotesUpdate} 
               />
               
               <StatusActionsSection 
                  currentStatus={inquiry.status} 
                  onUpdateStatus={handleStatusUpdate}
                  onConvertClick={() => setShowConvertModal(true)}
               />
            </div>
          </div>

        </div>
      </div>

      <ConvertToBookingModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        inquiry={inquiry}
        onSuccess={loadInquiry}
      />
    </>
  );
}
