import React, { useState, useEffect } from 'react';
import BillHeaderSection from './BillHeaderSection';
import CustomerDetailsSection from './CustomerDetailsSection';
import TripDetailsSection from './TripDetailsSection';
import VehicleDriverSection from './VehicleDriverSection';
import PaymentDetailsSection from './PaymentDetailsSection';
import FareDetailsSection from './FareDetailsSection';
import AdminOnlySection from './AdminOnlySection';
import BillActionsSection from './BillActionsSection';
import { useAdvancedBilling } from '@/hooks/useAdvancedBilling';
import { downloadPDF } from '@/utils/BillPDFGenerator';
import { generateAdvancedPDF } from '@/utils/AdvancedBillPDFGenerator';
import { shareBillOnWhatsApp } from '@/utils/whatsappUtils';
import { useToast } from '@/components/ui/use-toast';
import { validateBillData } from '@/utils/validateBillData';
import { supabase } from '@/lib/customSupabaseClient';

export default function AdvancedBillingCard({ booking, onUpdate }) {
  const { toast } = useToast();
  const { 
    billingState, 
    initializeBilling, 
    updateBillingField, 
    saveBookingBill, 
    loading: apiLoading 
  } = useAdvancedBilling();
  
  const [formData, setFormData] = useState(booking);
  const [errors, setErrors] = useState({});
  const [isEditable, setIsEditable] = useState(false); 

  useEffect(() => {
    // 1. Fetch fresh booking data to ensure we have the correct total_amount (booking_amount)
    const fetchFreshData = async () => {
      if (!booking.id) return;
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking.id)
        .single();
        
      if (data) {
        setFormData(data);
        setIsEditable(data.bill_status !== 'Final');
        initializeBilling(data);
      } else {
        // Fallback to prop
        setFormData(booking);
        setIsEditable(booking.bill_status !== 'Final');
        initializeBilling(booking);
      }
    };

    fetchFreshData();
  }, [booking.id, initializeBilling]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Sync specific fields with billing calculation state
    if (['manual_fare', 'add_gst'].includes(field)) {
      updateBillingField(field, value);
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const runValidation = () => {
    // Merge formData with calculated billing values for validation
    const fullData = {
      ...formData,
      manual_fare: billingState.manual_fare,
      final_fare: billingState.final_fare,
      total_amount: billingState.booking_amount // Pass booking amount for comparison
    };

    const { isValid, errors: newErrors } = validateBillData(fullData);
    setErrors(newErrors);
    return isValid;
  };

  const handleSaveDraft = async () => {
    // Save current form state merged with billing state
    const payload = {
      ...formData,
      manual_fare: billingState.manual_fare,
      add_gst: billingState.add_gst,
      // Note: Calculated fields like final_fare, gst_amount, total_payable 
      // are handled inside saveBookingBill via billingState
    };
    
    try {
      await saveBookingBill(formData.id, payload, false);
      if (onUpdate) onUpdate();
    } catch (e) {
      // Handled by hook
    }
  };

  const handleFinalize = async () => {
    if (!runValidation()) {
       const firstError = Object.values(errors)[0] || "Please resolve validation errors first.";
       toast({ 
         variant: "destructive", 
         title: "Cannot Finalize", 
         description: "Please fill in all required fields marked in red." 
       });
       return;
    }
    
    if (confirm("Are you sure you want to finalize this bill? It will be locked for editing.")) {
      const payload = {
        ...formData,
        manual_fare: billingState.manual_fare,
        add_gst: billingState.add_gst
      };

      try {
        await saveBookingBill(formData.id, payload, true);
        setIsEditable(false);
        if (onUpdate) onUpdate();
      } catch (e) {
        if (e.errors) setErrors(e.errors);
      }
    }
  };

  const handleDownload = async () => {
     try {
       // Merge current view data for PDF
       const pdfData = {
         ...formData,
         ...billingState, // Use calculated values
       };
       const blob = await generateAdvancedPDF(pdfData);
       const filename = `INV-${formData.booking_ref_id || 'DRAFT'}.pdf`;
       downloadPDF(blob, filename);
       toast({ title: "Downloaded", description: "Invoice PDF downloaded successfully." });
     } catch (e) {
       toast({ variant: "destructive", title: "Download Failed", description: "Could not generate PDF." });
     }
  };

  const handleWhatsApp = async () => {
     try {
        const shareData = {
         ...formData,
         ...billingState,
       };
       await shareBillOnWhatsApp(shareData);
       toast({ title: "WhatsApp Opened", description: "Please review and send the message." });
     } catch (e) {
       toast({ variant: "destructive", title: "Share Failed", description: e.message });
     }
  };

  // Pass calculated values to FareDetails
  const fareData = {
    booking_amount: billingState.booking_amount,
    manual_fare: billingState.manual_fare,
    final_fare: billingState.final_fare,
    add_gst: billingState.add_gst,
    gst_amount: billingState.gst_amount,
    total_payable: billingState.total_payable
  };

  return (
    <div className="bill-card-scroll-container bg-slate-50 border border-slate-200 shadow-sm">
      <BillHeaderSection booking={formData} />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 xl:divide-x divide-slate-200">
        <div>
          <CustomerDetailsSection 
            data={formData} 
            onChange={handleChange} 
            isEditable={isEditable}
            errors={errors}
          />
          <TripDetailsSection 
            data={formData} 
            onChange={handleChange} 
            isEditable={isEditable} 
            errors={errors}
          />
        </div>
        <div>
          <VehicleDriverSection 
            data={formData} 
            onChange={handleChange} 
            isEditable={isEditable} 
            errors={errors}
          />
          <PaymentDetailsSection 
             data={formData} 
             onChange={handleChange} 
             isEditable={isEditable} 
             errors={errors}
          />
          <FareDetailsSection 
             data={fareData} 
             onChange={handleChange} 
             isEditable={isEditable} 
             errors={errors}
          />
        </div>
      </div>

      <AdminOnlySection 
         data={formData} 
         onChange={handleChange} 
         isEditable={isEditable} 
      />

      <BillActionsSection 
        isDraft={isEditable}
        loading={apiLoading}
        onSaveDraft={handleSaveDraft}
        onFinalize={handleFinalize}
        onDownload={handleDownload}
        onWhatsApp={handleWhatsApp}
      />
    </div>
  );
}