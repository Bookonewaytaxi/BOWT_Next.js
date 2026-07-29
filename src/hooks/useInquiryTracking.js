import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export function useInquiryTracking() {
  const [currentInquiryId, setCurrentInquiryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const { toast } = useToast();

  const trackInquiry = useCallback(async (data, showToast = false) => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce execution
    debounceTimer.current = setTimeout(async () => {
      // Minimal validation: need at least mobile number to be useful
      if (!data.mobileNumber || data.mobileNumber.length < 10) return;

      setLoading(true);
      try {
        const mobile_number = data.mobileNumber.replace(/\D/g, '');
        
        // 1. Check for duplicate inquiry (same mobile + route + date) in last 24h
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        // Using valid columns from schema: id, created_at, phone, from_city, to_city
        let query = supabase
          .from('inquiries')
          .select('id, created_at')
          .eq('phone', mobile_number)
          .gte('created_at', oneDayAgo.toISOString());
          
        if (data.fromCity && data.toCity) {
           query = query
             .eq('from_city', data.fromCity)
             .eq('to_city', data.toCity);
        }
        
        // If pickup date is set, check match
        if (data.pickupDate) {
           query = query.eq('pickup_date', data.pickupDate);
        }

        const { data: existingInquiries, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        let dbId = null;

        if (existingInquiries && existingInquiries.length > 0) {
          // UPDATE existing
          const existing = existingInquiries[0];
          dbId = existing.id;
          
          // Only update fields that exist in schema
          await supabase
            .from('inquiries')
            .update({
              from_city: data.fromCity || undefined,
              to_city: data.toCity || undefined,
              pickup_date: data.pickupDate || undefined,
              pickup_time: data.pickupTime || undefined,
              name: data.name || undefined,
              message: data.specialInstructions || undefined,
              // updated_at does not exist in schema
            })
            .eq('id', dbId);
            
        } else {
          // INSERT new
          // Mapping to valid schema columns: 
          // id, name, email, phone, message, status, created_at, from_city, to_city, pickup_date, pickup_time, car_type, booking_id
          
          const { data: inserted, error: insertError } = await supabase
            .from('inquiries')
            .insert({
              phone: mobile_number,
              from_city: data.fromCity,
              to_city: data.toCity,
              pickup_date: data.pickupDate || null,
              pickup_time: data.pickupTime || null,
              name: data.name || 'Guest',
              email: data.email || 'no-email@provided.com', // Required field
              message: data.specialInstructions || 'No instructions', // Required field
              status: 'new_inquiry'
            })
            .select()
            .single();
            
          if (insertError) throw insertError;
          dbId = inserted.id;
        }

        setCurrentInquiryId(dbId);

        if (showToast) {
           toast({ 
              title: "Inquiry Saved", 
              description: "We've saved your details securely.",
              className: "bg-green-50 border-green-200"
           });
        }

      } catch (error) {
        console.error('Inquiry tracking error:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, [toast]);

  const updateInquiryStatus = async (inquiryId, status, notes = null) => {
    try {
      const updates = { status };
      // admin_notes and updated_at do not exist in schema, so we don't include them
      
      const { error } = await supabase.from('inquiries').update(updates).eq('id', inquiryId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to update inquiry status', err);
      return false;
    }
  };

  return {
    trackInquiry,
    updateInquiryStatus,
    currentInquiryId,
    loading
  };
}