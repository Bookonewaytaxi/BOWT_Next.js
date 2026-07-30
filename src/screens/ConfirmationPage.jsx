import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CheckCircle2, Phone, MessageCircle, Home, Car, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoImage from '@/components/ui/LogoImage';
import { getBookingState, clearBookingState } from '@/lib/bookingState';

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState(null);

  // Read once on mount (sessionStorage isn't available during SSR), then
  // clear it so a fresh booking flow starts with a clean slate.
  useEffect(() => {
    setBooking(getBookingState()?.booking || null);
    return () => clearBookingState();
  }, []);

  const handleCall = () => {
    window.location.href = 'tel:+917567575578';
  };

 const handleWhatsApp = () => {
    const message = booking
      ? [
          `Hi, I just made a booking on One Way Taxi.`,
          `Booking ID: ${booking.booking_ref_id || booking.id?.slice(0, 8)}`,
          `Name: ${booking.name}`,
          `Mobile: ${booking.mobile_number}`,
          `Route: ${booking.from_city} to ${booking.to_city}`,
          `Pickup Date: ${new Date(booking.pickup_date).toLocaleDateString()}`,
          booking.pickup_time ? `Pickup Time: ${booking.pickup_time}` : null,
          `Car Type: ${booking.car_type}`,
          booking.pickup_location && booking.pickup_location !== 'Pending' ? `Pickup Location: ${booking.pickup_location}` : null,
          booking.drop_location && booking.drop_location !== 'Pending' ? `Drop Location: ${booking.drop_location}` : null,
          `Total Amount: ₹${booking.total_amount}`
        ].filter(Boolean).join('\n')
      : `Hi, I need help with a taxi booking.`;
    window.open(`https://wa.me/917567575578?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <h2 className="text-xl font-bold mb-4">No Booking Found</h2>
            <p className="text-slate-500 mb-6">It seems you landed here without a valid booking. If you completed a booking, please check your email.</p>
            <Button onClick={() => router.push('/')} className="w-full">Back to Home</Button>
         </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Booking Confirmed - One Way Taxi</title>
        <meta name="description" content="Your taxi booking has been confirmed successfully with One Way Taxi" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center"
        >
          <div className="flex justify-center mb-6">
             <LogoImage size="large" className="rounded-full shadow-lg border border-slate-200" />
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
          </motion.div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-slate-600 mb-8">
            Thank you for choosing One Way Taxi. We've received your booking and will contact you shortly.
          </p>

          <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left border-l-4 border-green-500">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Booking Details</h2>
              <div className="space-y-3 text-slate-600">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-medium text-slate-500">Booking ID:</span> 
                  <span className="font-mono font-bold text-lg text-green-600">{booking.booking_ref_id || booking.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Name:</span> 
                  <span className="font-semibold text-slate-900">{booking.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Route:</span> 
                  <span className="font-semibold text-slate-900">{booking.from_city} to {booking.to_city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Pickup Date:</span> 
                  <span className="font-semibold text-slate-900">{new Date(booking.pickup_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Car Type:</span> 
                  <span className="font-semibold text-slate-900 capitalize">{booking.car_type}</span>
                </div>
              </div>

              {booking.driver_name && (
                 <div className="mt-6 pt-4 border-t border-slate-300">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Your Driver</h3>
                    <div className="flex items-start gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                       <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-600" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900">{booking.driver_name}</p>
                          <p className="text-xs text-slate-500">{booking.driver_phone}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded inline-flex">
                             <Car className="h-3 w-3" />
                             {booking.driver_car_no} ({booking.car_type})
                          </div>
                       </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                       <CheckCircle2 className="h-3 w-3" /> Your driver details have been sent to your email.
                    </p>
                 </div>
              )}
            </div>

          <div className="space-y-4">
            <p className="text-slate-600 mb-6">Need immediate assistance? Contact us now:</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                onClick={handleCall} 
                size="lg"
                className="gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <Phone className="h-5 w-5" />
                Call Us
              </Button>
              
              <Button 
                onClick={handleWhatsApp}
                size="lg"
                className="gap-2 bg-green-500 hover:bg-green-600"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </Button>
            </div>

            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
              className="w-full gap-2 mt-4"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              You will receive a confirmation call/message from our team within 30 minutes.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
