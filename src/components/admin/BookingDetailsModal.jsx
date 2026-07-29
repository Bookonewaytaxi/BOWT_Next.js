import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, Calendar, Car, PenSquare, Plus, X, Phone } from 'lucide-react';
import AssignDriverModal from './AssignDriverModal';
import BackButton from './BackButton';
import AdvancedBillingCard from './billing/advanced/AdvancedBillingCard';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/components/ui/use-toast';

export default function BookingDetailsModal({ isOpen, onClose, booking: initialBooking }) {
  const { toast } = useToast();
  const [booking, setBooking] = useState(initialBooking); 
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);

  useEffect(() => {
    setBooking(initialBooking); 
  }, [initialBooking]);

  const handleBookingUpdate = () => {
    // In a real app, you might re-fetch the booking here
    // For now, we assume local state in AdvancedBillingCard handles immediate UI updates
    // and we might want to close or refresh the parent list
    toast({ title: "Refreshed", description: "Booking details updated." });
  };

  if (!booking) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[100vw] sm:w-full sm:max-w-5xl bg-slate-50 text-slate-900 flex flex-col p-0 rounded-none sm:rounded-lg overflow-hidden" style={{ maxHeight: '95vh', height: 'auto' }}>
          <div className="px-4 md:px-6 py-4 border-b border-slate-200 shrink-0 flex justify-between items-center relative bg-white">
             <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2">
                <BackButton to="/admin" label="Back" />
             </div>
             
             <div className="flex-1 text-center pr-12"> 
               <DialogTitle className="text-lg md:text-xl flex items-center justify-center gap-2">
                  Booking <span className="text-amber-500 font-mono">#{booking.booking_ref_id?.slice(0,8)}</span>
               </DialogTitle>
             </div>
             <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full md:relative -mr-2 -mt-2">
               <X className="h-6 w-6 text-slate-500" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
          <Tabs defaultValue="billing" className="w-full mt-2">
            <div className="px-4 md:px-6 bg-white pb-2 pt-2 border-b border-slate-200 sticky top-0 z-10">
              <TabsList className="grid w-full grid-cols-2 h-11 max-w-md mx-auto">
                <TabsTrigger value="details">Trip & Driver</TabsTrigger>
                <TabsTrigger value="billing">Advanced Billing</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="details" className="space-y-4 py-4 px-4 md:px-6 pb-safe">
               {/* Legacy Trip Details - Simplified for now as focus is on Billing */}
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200">
                     <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4">Passenger</h3>
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                           <User className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="font-bold text-slate-900">{booking.name}</p>
                           <p className="text-sm text-slate-500">{booking.mobile_number}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-slate-200">
                     <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs">Driver</h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowAssignDriverModal(true)} className="h-6 text-blue-600 p-0 hover:bg-transparent">
                           Edit
                        </Button>
                     </div>
                     {booking.driver_name ? (
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                              <Car className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="font-bold text-slate-900">{booking.driver_name}</p>
                              <p className="text-sm text-slate-500">{booking.driver_car_no}</p>
                           </div>
                        </div>
                     ) : (
                        <p className="text-sm text-slate-400 italic">No driver assigned.</p>
                     )}
                  </div>
               </div>
            </TabsContent>
            
            <TabsContent value="billing" className="py-4 px-4 md:px-6 pb-safe">
               <AdvancedBillingCard 
                 booking={booking}
                 onUpdate={handleBookingUpdate}
               />
            </TabsContent>
          </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <AssignDriverModal
         isOpen={showAssignDriverModal}
         onClose={() => setShowAssignDriverModal(false)}
         booking={booking}
         onAssignmentComplete={() => onClose()} 
      />
    </>
  );
}