import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Loader2, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setBookingState, clearBookingState } from '@/lib/bookingState';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import SmartCityAutocomplete from './SmartCityAutocomplete';
import { validateInquiryForm } from '@/utils/validateInquiryForm';
import { trackEvent } from '@/utils/gtm';

export default function BookingForm({ prefilledPrice = null }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    pickup_city: '',
    drop_city: '',
    travel_date: '',
    travel_time: '',
    customer_name: '',
    customer_mobile: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validateInquiryForm(formData);
    if (validationErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run validation
    const validationErrors = validateInquiryForm(formData);
    setErrors(validationErrors);
    setTouched({
      pickup_city: true,
      drop_city: true,
      travel_date: true,
      travel_time: true,
      customer_name: true,
      customer_mobile: true
    });

    if (Object.keys(validationErrors).length > 0) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: "Please check the form for errors." 
      });
      return;
    }

    setLoading(true);

    try {
      // Track the search/quote attempt
      trackEvent('booking_quote_search', {
         from_city: formData.pickup_city,
         to_city: formData.drop_city,
         travel_date: formData.travel_date
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      clearBookingState();
      setBookingState({
        ...formData,
        fromCity: formData.pickup_city,
        toCity: formData.drop_city,
        pickupDate: formData.travel_date,
        pickupTime: formData.travel_time,
        name: formData.customer_name,
        mobileNumber: formData.customer_mobile,
        fixedPrice: prefilledPrice // Pass prefilled price if available
      });
      router.push('/booking/price');

    } catch (error) {
      console.error("Navigation Error:", error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Could not proceed. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 md:p-8 border-t-4 border-amber-500 relative z-20 flex flex-col gap-5 w-full"
    >
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
          {prefilledPrice ? 'Book This Trip' : 'Get One-Way Quote'}
        </h3>
        {prefilledPrice ? (
             <span className="text-xl font-black text-amber-600">₹{prefilledPrice.toLocaleString()}</span>
        ) : (
             <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Instant Price</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Cities */}
        <div className="space-y-4">
          <div className="relative">
            <SmartCityAutocomplete
              placeholder="Pickup City"
              value={formData.pickup_city}
              onChange={(val) => handleChange('pickup_city', val)}
              className={cn("h-12 text-base", errors.pickup_city && touched.pickup_city ? "border-red-500 focus-visible:ring-red-500" : "")}
            />
            {touched.pickup_city && errors.pickup_city && <p className="text-xs text-red-500 mt-1 ml-1">{errors.pickup_city}</p>}
          </div>

          <div className="relative">
            <SmartCityAutocomplete
               placeholder="Drop City"
               value={formData.drop_city}
               onChange={(val) => handleChange('drop_city', val)}
               excludeCity={formData.pickup_city}
               className={cn("h-12 text-base", errors.drop_city && touched.drop_city ? "border-red-500 focus-visible:ring-red-500" : "")}
             />
             {touched.drop_city && errors.drop_city && <p className="text-xs text-red-500 mt-1 ml-1">{errors.drop_city}</p>}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="travel_date" className="text-xs font-bold text-amber-600 uppercase ml-1">Date</label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-hover:text-amber-500 transition-colors" />
              <Input 
                 type="date"
                 id="travel_date"
                 className={cn(
                   "pl-10 h-12 cursor-pointer relative",
                   errors.travel_date && touched.travel_date ? "border-red-500 focus-visible:ring-red-500" : ""
                 )}
                 min={new Date().toISOString().split('T')[0]}
                 value={formData.travel_date}
                 onChange={(e) => handleChange('travel_date', e.target.value)}
                 onBlur={() => handleBlur('travel_date')}
              />
            </div>
            {touched.travel_date && errors.travel_date && <p className="text-xs text-red-500 ml-1">{errors.travel_date}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="travel_time" className="text-xs font-bold text-amber-600 uppercase ml-1">Time</label>
            <div className="relative group">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-hover:text-amber-500 transition-colors" />
              <Input 
                 type="time"
                 id="travel_time"
                 className={cn(
                   "pl-10 h-12 cursor-pointer relative",
                   errors.travel_time && touched.travel_time ? "border-red-500 focus-visible:ring-red-500" : ""
                 )}
                 value={formData.travel_time}
                 onChange={(e) => handleChange('travel_time', e.target.value)}
                 onBlur={() => handleBlur('travel_time')}
              />
            </div>
            {touched.travel_time && errors.travel_time && <p className="text-xs text-red-500 ml-1">{errors.travel_time}</p>}
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
             <label htmlFor="customer_name" className="text-xs font-bold text-amber-600 uppercase ml-1">Full Name</label>
             <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-hover:text-amber-500 transition-colors" />
                <Input 
                   type="text"
                   id="customer_name"
                   placeholder="Your name"
                   className={cn(
                      "pl-10 h-12 text-base",
                      errors.customer_name && touched.customer_name ? "border-red-500 focus-visible:ring-red-500" : ""
                   )}
                   value={formData.customer_name}
                   onChange={(e) => handleChange('customer_name', e.target.value)}
                   onBlur={() => handleBlur('customer_name')}
                />
             </div>
             {touched.customer_name && errors.customer_name && <p className="text-xs text-red-500 ml-1">{errors.customer_name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
             <label htmlFor="customer_mobile" className="text-xs font-bold text-amber-600 uppercase ml-1">Mobile Number</label>
             <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-hover:text-amber-500 transition-colors" />
                <Input 
                   type="tel"
                   id="customer_mobile"
                   placeholder="10-digit number"
                   maxLength={10}
                   className={cn(
                      "pl-10 h-12 text-base",
                      errors.customer_mobile && touched.customer_mobile ? "border-red-500 focus-visible:ring-red-500" : ""
                   )}
                   value={formData.customer_mobile}
                   onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleChange('customer_mobile', val);
                   }}
                   onBlur={() => handleBlur('customer_mobile')}
                />
             </div>
             {touched.customer_mobile && errors.customer_mobile && <p className="text-xs text-red-500 ml-1">{errors.customer_mobile}</p>}
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 text-lg uppercase tracking-wider font-black shadow-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-900 hover:from-amber-500 hover:to-amber-700 hover:text-white transition-all mt-2"
        >
          {loading ? (
             <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Processing...</div>
          ) : (
             <span className="flex items-center gap-2">
                 {prefilledPrice ? 'Book Now' : 'See Prices & Book'} <ArrowRight className="w-5 h-5" />
             </span>
          )}
        </Button>

      </form>
    </motion.div>
  );
}