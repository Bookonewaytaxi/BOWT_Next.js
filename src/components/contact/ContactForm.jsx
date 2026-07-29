import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import FormField from './FormField';
import SmartCityAutocomplete from '@/components/home/SmartCityAutocomplete';
import { format } from 'date-fns';
import { trackEvent, trackInquiryConversion } from '@/utils/gtm';

export default function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    pickup: '',
    drop: '',
    date: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (!formData.mobile || !/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }
    if (!formData.pickup) {
      newErrors.pickup = "Pickup city is required";
    }
    if (!formData.drop) {
      newErrors.drop = "Drop city is required";
    }
    if (!formData.date) {
      newErrors.date = "Journey date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the form for errors."
      });
      return;
    }

    setLoading(true);
    
    // Track contact form submission (GTM)
    trackEvent('inquiry_submitted', {
      inquiry_id: `whatsapp-${Date.now()}`,
      from_city: formData.pickup,
      to_city: formData.drop,
      phone: formData.mobile,
      method: 'whatsapp_contact_form'
    });

    // Track Lead Conversion (Google Ads)
    trackInquiryConversion({
      name: formData.name,
      phone: formData.mobile,
      message: formData.message || 'WhatsApp Contact Form'
    });

    const whatsappMessage = `Hi, I need a one-way taxi quote:
Name: ${formData.name}
Mobile: ${formData.mobile}
From: ${formData.pickup}
To: ${formData.drop}
Date: ${formData.date}
Message: ${formData.message || 'N/A'}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/917567575578?text=${encodedMessage}`;

    // Simulate API delay/processing
    setTimeout(() => {
      setLoading(false);
      window.open(whatsappUrl, '_blank');
      toast({
        title: "Redirecting to WhatsApp",
        description: "Please send the pre-filled message to get your quote."
      });
    }, 1000);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#161B22] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-bl-full pointer-events-none" />

      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Get Instant <span className="text-[#FFD700]">One-Way Taxi</span> Quote
        </h2>
        <p className="text-gray-400 text-sm">
          Share your route details and get fare instantly on WhatsApp
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="name"
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          error={errors.name}
          required
        />

        <FormField
          id="mobile"
          label="Mobile Number"
          type="tel"
          placeholder="10-digit mobile number"
          value={formData.mobile}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
            setFormData({...formData, mobile: val});
          }}
          error={errors.mobile}
          helperText="We respect your privacy. No spam calls."
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="pickup"
            label="Pickup City"
            error={errors.pickup}
            required
          >
            <SmartCityAutocomplete
              placeholder="Search pickup city"
              value={formData.pickup}
              onChange={(val) => setFormData({...formData, pickup: val})}
              className="bg-[#0A0D11] border-white/10 text-white placeholder:text-gray-500 focus:border-[#FFD700] h-12"
            />
          </FormField>

          <FormField
            id="drop"
            label="Drop City"
            error={errors.drop}
            required
          >
            <SmartCityAutocomplete
              placeholder="Search drop city"
              value={formData.drop}
              onChange={(val) => setFormData({...formData, drop: val})}
              className="bg-[#0A0D11] border-white/10 text-white placeholder:text-gray-500 focus:border-[#FFD700] h-12"
            />
          </FormField>
        </div>

        <FormField
          id="date"
          label="Journey Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          error={errors.date}
          min={today}
          required
          className="w-full"
        />

        <FormField
          id="message"
          label="Message (Optional)"
          type="textarea"
          placeholder="Any specific requirements?"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />

        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-[#FFD700] hover:bg-[#E5C100] text-[#0F1419] font-bold text-lg rounded-xl shadow-lg hover:shadow-[#FFD700]/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <MessageCircle className="w-5 h-5" /> Get Instant Quote on WhatsApp
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <Clock className="w-3 h-3 text-[#FFD700]" />
            <span>Our team usually replies within 5 minutes</span>
          </div>
        </div>
      </form>
    </motion.div>
  );
}