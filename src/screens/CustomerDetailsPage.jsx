import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, ShieldCheck, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { generateBookingId } from '@/utils/bookingUtils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingSummary from '@/components/booking/BookingSummary';
import CustomerDetailsForm from '@/components/booking/CustomerDetailsForm';
import CouponInput from '@/components/booking/CouponInput';
import { trackEvent, trackBookingConversion } from '@/utils/gtm';
import { getBookingState, setBookingState } from '@/lib/bookingState';

export default function CustomerDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  // sessionStorage isn't available during SSR, so incoming booking data is
  // only read once mounted on the client.
  const [incoming, setIncoming] = useState(null);

  useEffect(() => {
    setIncoming(getBookingState());
  }, []);

  const {
    from_city,
    to_city,
    distance,
    pickup_date,
    pickup_time,
    selected_vehicle,
    vehicle_fare,
    mobileNumber,
    name
  } = incoming || {};

  const routeData = {
    from_city,
    to_city,
    distance,
    pickup_date,
    pickup_time
  };

  useEffect(() => {
    if (!incoming) return; // still waiting on sessionStorage read
    if (!selected_vehicle || !from_city) {
      router.replace('/booking/vehicle-selection');
    }
    window.scrollTo(0, 0);
  }, [incoming, selected_vehicle, from_city]);

  const handleBookingSubmit = async formData => {
    setIsSubmitting(true);
    try {
      const bookingRefId = await generateBookingId();
      const finalAmount = Math.max(0, vehicle_fare - (appliedCoupon?.discountAmount || 0));
      
      const bookingPayload = {
        booking_ref_id: bookingRefId,
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobileNumber,
        driver_details: {
          alternate_mobile: formData.alternateMobile,
          special_instructions: formData.specialInstructions,
          requested_vehicle: selected_vehicle.name,
          vehicle_image: selected_vehicle.image_url,
          coupon_code: appliedCoupon?.code,
          discount_amount: appliedCoupon?.discountAmount,
          original_fare: vehicle_fare,
          passenger_count: formData.passengerCount,
          luggage_count: formData.luggageCount,
          payment_mode: formData.paymentMode,
          traveler_name: formData.travelerName || formData.name 
        },
        from_city: from_city,
        to_city: to_city,
        pickup_location: formData.pickupAddress || 'Pending',
        drop_location: formData.dropAddress || 'Pending',
        pickup_date: pickup_date,
        pickup_time: pickup_time,
        car_type: selected_vehicle.type_key,
        total_amount: finalAmount,
        status: 'Pending'
      };

      const { data: booking, error } = await supabase.from('bookings').insert([bookingPayload]).select().single();
      
      if (error) throw error;
      
      // Track Booking Submission Event (GTM)
      trackEvent('booking_submitted', {
        booking_id: bookingRefId,
        amount: finalAmount,
        currency: 'INR',
        from_city: from_city,
        to_city: to_city,
        vehicle_type: selected_vehicle.type_key,
        coupon_code: appliedCoupon?.code
      });

      // Track Booking Conversion (Google Ads)
      trackBookingConversion({
        id: bookingRefId,
        amount: finalAmount,
        currency: 'INR',
        items: [
          {
            item_id: selected_vehicle.type_key,
            item_name: selected_vehicle.name,
            item_category: 'Taxi Service',
            price: finalAmount,
            quantity: 1
          }
        ]
      });
      
      if (appliedCoupon?.id) {
        await supabase.rpc('increment_coupon_usage', {
          coupon_id: appliedCoupon.id
        });
      }

      try {
        await supabase.functions.invoke('send-booking-notification', {
          body: JSON.stringify({
            booking,
            vehicleName: selected_vehicle.name
          })
        });
      } catch (funcError) {
        console.warn("Failed to invoke send-booking-notification:", funcError.message);
      }

      setBookingState({ booking });
      router.replace('/booking/confirm');

      toast({
        title: "Booking Successful!",
        description: "Your ride has been scheduled.",
        className: "bg-green-600 text-white border-green-700"
      });
    } catch (error) {
      console.error('Booking Error:', error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selected_vehicle || !from_city) return null;

  return (
    <>
      <Head>
        <title>Complete Booking | One Way Taxi</title>
        <meta name="description" content="Final step to confirm your taxi booking." />
      </Head>

      <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
        <Header />

        {/* Hero / Header Section */}
        <div className="bg-[#0F1419] text-white pt-6 pb-12 shadow-md relative overflow-hidden">
           {/* Background Accents */}
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FFD700]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
           
           <div className="container mx-auto px-4 max-w-[1200px] relative z-10">
              <Button variant="ghost" onClick={() => router.back()} className="mb-2 pl-0 hover:bg-transparent hover:text-[#FFD700] text-slate-400 group h-auto py-1 text-sm">
                <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Vehicles
              </Button>
              <h1 className="text-2xl font-black tracking-tight">Complete Booking</h1>
              <p className="text-slate-400 text-sm">
                Ride from <span className="text-[#FFD700]">{from_city}</span> to <span className="text-[#FFD700]">{to_city}</span>
              </p>
           </div>
        </div>

        <div className="flex-1 container mx-auto px-4 pb-12 max-w-[1200px] -mt-6 relative z-20">
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            
            {/* LEFT COLUMN: Sticky Summary (Desktop) / Top Summary (Mobile) */}
            <div className="w-full lg:w-[300px] lg:sticky lg:top-24 space-y-4 order-1 lg:order-1">
              <BookingSummary vehicle={selected_vehicle} routeData={routeData} fare={vehicle_fare} couponDiscount={appliedCoupon?.discountAmount} />
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-bold text-[#0F1419] text-sm mb-3 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-[#FFD700]" /> Promo Code
                </h3>
                <CouponInput ourPrice={vehicle_fare} onCouponApplied={setAppliedCoupon} />
              </div>

              {/* Trust/Support Box */}
              <div className="bg-[#0F1419]/95 backdrop-blur-sm rounded-lg p-4 border border-white/10 text-center text-white shadow-lg">
                 <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-3 text-[#0F1419]">
                    <PhoneCall className="w-5 h-5" />
                 </div>
                 <h4 className="font-bold text-sm mb-0.5">Need Help?</h4>
                 <a href="tel:+919876543210" className="text-[#FFD700] font-bold text-base hover:underline block">+91 75675 75578</a>
              </div>
            </div>

            {/* RIGHT COLUMN: Form */}
            <div className="flex-1 w-full order-2 lg:order-2">
               <CustomerDetailsForm 
                 initialData={{
                    name: name || '',
                    mobileNumber: mobileNumber || '',
                    email: ''
                 }} 
                 routeData={routeData} 
                 onSubmit={handleBookingSubmit} 
                 isSubmitting={isSubmitting} 
               />
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
