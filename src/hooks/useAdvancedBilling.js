import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { validateBillData } from '@/utils/validateBillData';

export function useAdvancedBilling() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // New State logic
  const [billingState, setBillingState] = useState({
    booking_amount: 0,
    final_fare: 0,
    manual_fare: 0,
    add_gst: false,
    gst_amount: 0,
    total_payable: 0,
    validationErrors: {}
  });

  const initializeBilling = useCallback((booking) => {
    const bookingAmount = Number(booking.total_amount) || 0; // Original booking amount
    const savedManualFare = Number(booking.manual_fare) || 0;
    const isGstEnabled = booking.add_gst === true;
    
    // Determine base fare: Manual overrides original if set
    // But logically, we start with bookingAmount
    const baseFare = savedManualFare > 0 ? savedManualFare : bookingAmount;
    const gstAmt = isGstEnabled ? (baseFare * 0.05) : 0;
    const total = baseFare + gstAmt;

    setBillingState({
      booking_amount: bookingAmount,
      manual_fare: savedManualFare,
      final_fare: baseFare,
      add_gst: isGstEnabled,
      gst_amount: gstAmt,
      total_payable: total,
      validationErrors: {}
    });
  }, []);

  const recalculate = (newState) => {
    const manual = Number(newState.manual_fare) || 0;
    const base = newState.booking_amount;
    
    // If manual is set, it overrides, BUT strictly for calculation. 
    // Validation happens elsewhere to prevent saving invalid states.
    const effectiveBase = manual > 0 ? manual : base;
    
    const gstAmt = newState.add_gst ? (effectiveBase * 0.05) : 0;
    
    return {
      ...newState,
      final_fare: effectiveBase,
      gst_amount: gstAmt,
      total_payable: effectiveBase + gstAmt
    };
  };

  const updateBillingField = (field, value) => {
    setBillingState(prev => {
      const next = { ...prev, [field]: value };
      if (['manual_fare', 'add_gst'].includes(field)) {
        return recalculate(next);
      }
      return next;
    });
  };

  // Deprecated but kept for compatibility if needed, though replaced by logic above
  const getAutoFareByCities = async (fromCity, toCity, vehicleType) => {
    return 0; 
  };

  const saveBookingBill = async (bookingId, fullBillData, isFinal = false) => {
    setLoading(true);
    
    // 1. Validate if Finalizing
    if (isFinal) {
      const { isValid, errors } = validateBillData(fullBillData);
      if (!isValid) {
        setLoading(false);
        throw { message: "Validation failed", errors };
      }
    }

    try {
      // Prepare payload
      const payload = {
        ...fullBillData,
        // Ensure these specific calculated fields are synced
        manual_fare: billingState.manual_fare > 0 ? billingState.manual_fare : null,
        final_fare: billingState.final_fare,
        add_gst: billingState.add_gst,
        gst_amount: billingState.gst_amount,
        total_payable: billingState.total_payable,
        
        bill_status: isFinal ? 'Final' : 'Draft',
        updated_at: new Date().toISOString()
      };

      // Clean up UI-only fields before sending if any (validationErrors is not in DB)
      delete payload.validationErrors;

      const { data, error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: isFinal ? "Bill Finalized" : "Draft Saved",
        description: isFinal ? "The bill has been locked and is ready for sharing." : "Changes saved successfully.",
        className: isFinal ? "bg-green-600 text-white" : ""
      });

      return data;
    } catch (error) {
      console.error("Error saving bill:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Unknown error occurred"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    billingState,
    initializeBilling,
    updateBillingField,
    saveBookingBill,
    getAutoFareByCities // Kept for interface compatibility
  };
}