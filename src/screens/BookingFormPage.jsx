import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { User, MapPin, ArrowLeft, Calendar, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { generateBookingId } from '@/utils/bookingUtils';
import VehicleImage from '@/components/vehicle/VehicleImage';

export default function BookingFormPage() {
  const router = useRouter();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Data from previous steps
  const {
    from_city,
    to_city,
    pickup_date,
    pickup_time,
    selected_vehicle,
    vehicle_fare
  } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    pickupLocation: '',
    dropLocation: '',
    specialRequests: ''
  });

  // Redirect if missing critical data
  useEffect(() => {
    if (!selected_vehicle || !from_city) {
      router.push('/booking/route-selection');
    }
  }, [selected_vehicle, from_city, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingRefId = await generateBookingId();

      const bookingPayload = {
        booking_ref_id: bookingRefId,
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobileNumber,
        from_city: from_city,
        to_city: to_city,
        pickup_location: formData.pickupLocation,
        drop_location: formData.dropLocation,
        pickup_date: pickup_date,
        pickup_time: pickup_time,
        car_type: selected_vehicle.type_key,
        total_amount: vehicle_fare,
        status: 'Pending',
        // Store selected vehicle details for record
        driver_details: { 
           requested_vehicle: selected_vehicle.name,
           vehicle_image: selected_vehicle.image_url 
        }
      };

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select()
        .single();

      if (error) throw error;

      // Notify
      await supabase.functions.invoke('send-booking-notification', {
        body: JSON.stringify({ booking, vehicleName: selected_vehicle.name })
      });

      navigate('/booking/confirm', { state: { booking } });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Please try again or contact support."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selected_vehicle) return null;

  const marketPrice = Math.round(vehicle_fare * 1.35);
  const savings = marketPrice - vehicle_fare;

  return (
    <>
      <Head>
        <title>Customer Details | One Way Taxi</title>
      </Head>

      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-start">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Summary Sidebar (Left on Desktop, Top on Mobile) */}
          <div className="bg-slate-900 text-white md:w-1/3 p-6 md:p-8 flex flex-col order-1 md:order-1">
             <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold uppercase tracking-wider text-sm text-amber-500">Trip Summary</h3>
                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-6 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                   onClick={() => navigate('/booking/vehicle-selection', { state: location.state })}
                >
                   <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
             </div>
             
             <div className="space-y-6 flex-1">
                {/* Vehicle Card Mini */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 overflow-hidden">
                   <div className="w-full h-32 rounded-lg overflow-hidden mb-3 border border-slate-600/50">
                      <VehicleImage 
                        src={selected_vehicle.image_url} 
                        alt={selected_vehicle.name} 
                        containerClassName="w-full h-full" 
                      />
                   </div>
                   <div className="font-bold text-lg">{selected_vehicle.name}</div>
                   <div className="text-xs text-slate-400 mb-3">{selected_vehicle.capacity} Seater • AC</div>
                   
                   <div className="flex justify-between items-end border-t border-slate-700 pt-3">
                      <div className="text-xs text-slate-400">Total Fare</div>
                      <div className="text-xl font-bold text-amber-500">₹{vehicle_fare}</div>
                   </div>
                   <div className="text-right text-[10px] text-green-400 mt-1">You saved ₹{savings}</div>
                </div>

                <div className="space-y-4 text-sm">
                   <div className="flex gap-3">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                         <div className="text-xs text-slate-500 uppercase">Route</div>
                         <div className="font-medium text-slate-200">{from_city} to {to_city}</div>
                      </div>
                   </div>
                   
                   <div className="flex gap-3">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                         <div className="text-xs text-slate-500 uppercase">Pickup</div>
                         <div className="font-medium text-slate-200">{pickup_date} at {pickup_time}</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500">
                Needs help? Call <span className="text-white font-bold">+91 7567575578</span>
             </div>
          </div>

          {/* Form Area */}
          <div className="md:w-2/3 p-6 md:p-8 order-2 md:order-2">
             <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
                   <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-black text-slate-900">Passenger Details</h1>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-500" /> Personal Info
                   </h3>
                   <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                         <Label>Full Name *</Label>
                         <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            placeholder="e.g. Rahul Sharma"
                         />
                      </div>
                      <div className="space-y-2">
                         <Label>Mobile Number *</Label>
                         <Input 
                            type="tel"
                            value={formData.mobileNumber}
                            onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                            required
                            placeholder="10 digit number"
                         />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <Label>Email Address *</Label>
                         <Input 
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            placeholder="rahul@example.com"
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" /> Pickup & Drop
                   </h3>
                   <div className="space-y-5">
                      <div className="space-y-2">
                         <Label>Pickup Address ({from_city}) *</Label>
                         <Input 
                            placeholder="House No, Street, Landmark"
                            value={formData.pickupLocation}
                            onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                            required
                         />
                      </div>
                      <div className="space-y-2">
                         <Label>Drop Address ({to_city}) *</Label>
                         <Input 
                            placeholder="Area, Street, Hotel Name"
                            value={formData.dropLocation}
                            onChange={(e) => setFormData({...formData, dropLocation: e.target.value})}
                            required
                         />
                      </div>
                   </div>
                </div>

                <Button 
                   type="submit" 
                   className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 mt-4"
                   disabled={loading}
                >
                   {loading ? (
                      <span className="flex items-center gap-2">Processing...</span>
                   ) : (
                      <span className="flex items-center gap-2">Confirm Booking <ArrowLeft className="w-5 h-5 rotate-180" /></span>
                   )}
                </Button>
             </form>
          </div>

        </div>
      </div>
    </>
  );
}