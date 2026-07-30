import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Loader2, AlertCircle, Info, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VehicleCard from '@/components/vehicle/VehicleCard';
import StickyBookingSummary from '@/components/vehicle/StickyBookingSummary';
import { VEHICLE_TYPES_CONSTANTS } from '@/lib/constants';
import useInquiryCapture from '@/hooks/useInquiryCapture';
import { getBookingState, setBookingState } from '@/lib/bookingState';

export default function VehicleSelectionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routePrices, setRoutePrices] = useState(null);
  // sessionStorage isn't available during SSR, so incoming booking data is
  // only read once mounted on the client.
  const [incoming, setIncoming] = useState(null);

  useEffect(() => {
    setIncoming(getBookingState());
  }, []);

  // Extract Route Data
  const {
    from_city,
    to_city,
    distance,
    pickup_date,
    pickup_time,
    mobileNumber,
    name,
    email,
    fromCity, toCity, pickupDate, pickupTime
  } = incoming || {};

  // Normalize Data
  const routeData = {
    from_city: from_city || fromCity,
    to_city: to_city || toCity,
    distance,
    pickup_date: pickup_date || pickupDate,
    pickup_time: pickup_time || pickupTime
  };

  // Date & time are editable here so a customer arriving from a route page
  // (which pre-fills today's date/time) can still plan a future trip.
  const [editedDate, setEditedDate] = useState('');
  const [editedTime, setEditedTime] = useState('');

  useEffect(() => {
    if (!incoming) return;
    setEditedDate(routeData.pickup_date || '');
    setEditedTime(routeData.pickup_time || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming]);

  const handleDateChange = (e) => {
    const value = e.target.value;
    setEditedDate(value);
    setBookingState({ pickup_date: value });
  };

  const handleTimeChange = (e) => {
    const value = e.target.value;
    setEditedTime(value);
    setBookingState({ pickup_time: value });
  };

  // Inquiry Capture Hook
  useInquiryCapture({
    pickup_city: routeData.from_city,
    drop_city: routeData.to_city,
    travel_date: routeData.pickup_date,
    travel_time: routeData.pickup_time,
    customer_name: name,
    customer_mobile: mobileNumber,
    email: email
  });

  useEffect(() => {
    if (!incoming) return; // still waiting on sessionStorage read
    if (!routeData.from_city || !routeData.to_city) {
      router.push('/booking/route-selection');
      return;
    }
    fetchRouteAndPrices();
  }, [incoming, routeData.from_city, routeData.to_city]);

  const fetchRouteAndPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch route from DB to get FIXED prices
      // We try to match from_city and to_city case-insensitively
      const { data, error: apiError } = await supabase
        .from('routes')
        .select('*')
        .ilike('from_city', routeData.from_city)
        .ilike('to_city', routeData.to_city)
        .eq('is_active', true)
        .maybeSingle();

      if (apiError) throw apiError;

      if (!data) {
        setError("This route is not currently available for online booking. Please contact support.");
        return;
      }

      setRoutePrices(data);
    } catch (err) {
      console.error("Error fetching route prices:", err);
      setError("Failed to load pricing for this route.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleContinue = () => {
    if (!selectedVehicle) {
      toast({ variant: "destructive", title: "Selection Required", description: "Please select a vehicle to continue." });
      return;
    }

    setBookingState({
      selected_vehicle: selectedVehicle,
      vehicle_fare: selectedVehicle.price,
      vehicle_type: selectedVehicle.type_key
    });
    router.replace('/booking/customer-details');
  };

  // Construct vehicle list with specific prices
  const vehiclesWithPrices = routePrices ? [
    { ...VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === 'sedan'), price: routePrices.sedan_price },
    { ...VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === 'suv6'), price: routePrices.ertiga_price || routePrices.suv_ertiga_price },
    { ...VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === 'suv7'), price: routePrices.carens_price || routePrices.kia_carens_price },
    { ...VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === 'crysta'), price: routePrices.innova_crysta_price || routePrices.crysta_price },
  ].filter(v => v.price && v.price > 0 && v.id) : [];

  if (!routeData.from_city) return null;

  return (
    <>
      <Head>
        <title>Select Vehicle | One Way Taxi</title>
        <meta name="description" content="Choose your preferred taxi for your one-way trip." />
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />

        {/* Route Info Header */}
        <div className="bg-slate-900 text-white pt-24 pb-12 px-4 shadow-lg">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => router.back()} 
                  className="mb-4 pl-0 hover:bg-transparent hover:text-amber-500 text-slate-400 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Change Route
                </Button>
                <h1 className="text-3xl md:text-4xl font-black mb-2">Select Your Vehicle</h1>
                <p className="text-slate-400">Fixed pricing. No hidden charges.</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 w-full md:w-auto min-w-[300px]">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{routeData.from_city}</span>
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-lg">{routeData.to_city}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <input
                      type="date"
                      value={editedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleDateChange}
                      className="bg-transparent text-slate-200 text-sm outline-none [color-scheme:dark] cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <input
                      type="time"
                      value={editedTime}
                      onChange={handleTimeChange}
                      className="bg-transparent text-slate-200 text-sm outline-none [color-scheme:dark] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 pb-32 flex-1 max-w-7xl">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Total Fixed Price</p>
              <p>Prices below are all-inclusive (Tolls, Driver Allowance, Fuel). Parking extra if applicable.</p>
            </div>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto text-center py-12 bg-white rounded-2xl shadow-sm border border-red-100">
               <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-slate-800 mb-2">Route Not Found</h3>
               <p className="text-slate-500 mb-6">{error}</p>
               <Button onClick={() => router.push('/booking/route-selection')}>Try Another Route</Button>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 h-80 animate-pulse" />
               ))}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehiclesWithPrices.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  price={vehicle.price}
                  isSelected={selectedVehicle?.id === vehicle.id}
                  onSelect={handleSelectVehicle}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
        
        {selectedVehicle && (
           <StickyBookingSummary 
             route={routeData}
             vehicle={selectedVehicle}
             price={selectedVehicle.price}
             onContinue={handleContinue}
           />
        )}
        
        {/* Desktop Summary Bar (Hidden on Mobile) */}
        {selectedVehicle && (
          <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-40">
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Fare</p>
                    <p className="text-2xl font-black text-slate-900">₹{selectedVehicle.price.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="font-bold text-slate-900">{selectedVehicle.name}</p>
                    <p className="text-xs text-slate-500">{routeData.from_city} to {routeData.to_city}</p>
                  </div>
               </div>
               <Button onClick={handleContinue} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 h-12 text-lg">
                 Continue to Booking
               </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
