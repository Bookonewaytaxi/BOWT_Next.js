import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export function useBills() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: "Unable to load bills list. Please check your connection."
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getBillByBookingId = async (bookingId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data;
    } catch (error) {
      console.error('Error fetching bill:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateBill = async (billData) => {
    try {
      setLoading(true);
      
      console.log('Attempting to generate bill with data:', billData);

      // billData now includes booking_ref (Task 2)
      
      const { data, error } = await supabase
        .from('bills')
        .insert([billData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message || "Failed to insert bill into database.");
      }
      
      if (!data) {
         throw new Error("Supabase returned no data after bill insertion.");
      }

      toast({
        title: "Bill Generated",
        description: `Invoice ${data.bill_number} has been created successfully.`
      });
      return data;
    } catch (error) {
      console.error('Error generating bill in hook:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate bill. Please try again."
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBillStatus = async (billId, status) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .update({ status })
        .eq('id', billId)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Bill status changed to ${status}.`
      });
      return data;
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update bill status."
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateBillDetails = async (billId, updatedData) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .update(updatedData)
        .eq('id', billId)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Bill Updated",
        description: "Invoice details have been updated successfully."
      });
      return data;
    } catch (error) {
      console.error('Error updating bill details:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update invoice details."
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendBillEmail = async (bill) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('send-bill-email', {
        body: JSON.stringify({ 
          billId: bill.id, 
          customerEmail: bill.customer_email 
        })
      });

      if (error) throw error;

      await updateBillStatus(bill.id, 'Sent');

      toast({
        title: "Email Sent",
        description: `Invoice sent successfully to ${bill.customer_email}`
      });
      return true;
    } catch (error) {
      console.error('Error sending bill email:', error);
      toast({
        variant: "destructive",
        title: "Email Failed",
        description: "Failed to send invoice email. Please check the email service."
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getBills,
    getBillByBookingId,
    generateBill,
    updateBillStatus,
    updateBillDetails,
    sendBillEmail
  };
}