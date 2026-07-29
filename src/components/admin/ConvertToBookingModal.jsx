import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function ConvertToBookingModal({ isOpen, onClose, inquiry, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    from_city: '',
    to_city: '',
    pickup_date: '',
    pickup_time: '',
    car_type: 'Sedan',
    pickup_location: '',
    drop_location: '',
    total_amount: 0,
    advance_amount: 0,
    email: ''
  });

  useEffect(() => {
    if (inquiry) {
      // Task 2: Ensure name is populated from either name or customer_name
      setFormData({
        name: inquiry.name || inquiry.customer_name || '',
        mobile_number: inquiry.mobile_number || inquiry.phone || '',
        from_city: inquiry.pickup_city || '',
        to_city: inquiry.drop_city || '',
        pickup_date: inquiry.pickup_date ? inquiry.pickup_date.toString().split('T')[0] : '',
        pickup_time: inquiry.pickup_time || '10:00 AM',
        car_type: 'Sedan',
        pickup_location: inquiry.pickup_city || '',
        drop_location: inquiry.drop_city || '',
        total_amount: inquiry.fare_shown || 0,
        advance_amount: 0,
        email: inquiry.email !== '-' ? inquiry.email : ''
      });
    }
  }, [inquiry]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile_number) {
       toast({ variant: "destructive", title: "Missing Information", description: "Name and Mobile are required." });
       return;
    }
    
    setLoading(true);
    try {
       // 1. Create Booking
       const bookingRef = `BK${Date.now().toString().slice(-6)}`;
       const { data: booking, error: bookingError } = await supabase
         .from('bookings')
         .insert([{
            ...formData,
            status: 'Confirmed',
            payment_status: 'Pending',
            booking_ref_id: bookingRef,
            inquiry_id: inquiry.id
         }])
         .select()
         .single();
         
       if (bookingError) throw bookingError;
       
       // 2. Update Inquiry
       const { error: inquiryError } = await supabase
         .from('inquiries')
         .update({ 
            status: 'Converted',
            booking_id: booking.id,
            updated_at: new Date()
         })
         .eq('id', inquiry.id);
         
       if (inquiryError) throw inquiryError;
       
       toast({
         title: "Success",
         description: `Booking #${bookingRef} created successfully.`,
         className: "bg-green-50 border-green-200 text-green-900"
       });
       
       onSuccess();
       onClose();
    } catch (error) {
       console.error(error);
       toast({ variant: "destructive", title: "Conversion Failed", description: error.message });
    } finally {
       setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0f172a] text-white border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
             Convert Inquiry to Booking <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded ml-2">{inquiry?.inquiry_id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
           <div className="col-span-2">
              <h4 className="text-xs font-bold text-amber-500 uppercase mb-2 border-b border-slate-800 pb-1">Customer Details</h4>
           </div>
           <div className="space-y-1">
              <Label>Customer Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-800 border-slate-600 focus:border-amber-500" />
           </div>
           <div className="space-y-1">
              <Label>Mobile Number</Label>
              <Input value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} className="bg-slate-800 border-slate-600 focus:border-amber-500" />
           </div>

           <div className="col-span-2 mt-2">
              <h4 className="text-xs font-bold text-amber-500 uppercase mb-2 border-b border-slate-800 pb-1">Trip Details</h4>
           </div>
           <div className="space-y-1">
              <Label>From City</Label>
              <Input value={formData.from_city} onChange={e => setFormData({...formData, from_city: e.target.value})} className="bg-slate-800 border-slate-600 focus:border-amber-500" />
           </div>
           <div className="space-y-1">
              <Label>To City</Label>
              <Input value={formData.to_city} onChange={e => setFormData({...formData, to_city: e.target.value})} className="bg-slate-800 border-slate-600 focus:border-amber-500" />
           </div>
           <div className="space-y-1">
              <Label>Pickup Date</Label>
              <Input type="date" value={formData.pickup_date} onChange={e => setFormData({...formData, pickup_date: e.target.value})} className="bg-slate-800 border-slate-600 focus:border-amber-500" />
           </div>
           <div className="space-y-1">
              <Label>Pickup Time</Label>
              <Input type="text" value={formData.pickup_time} onChange={e => setFormData({...formData, pickup_time: e.target.value})} className="bg-slate-800 border-slate-600 focus:border-amber-500" />
           </div>

           <div className="col-span-2 mt-2">
              <h4 className="text-xs font-bold text-amber-500 uppercase mb-2 border-b border-slate-800 pb-1">Booking Specifics</h4>
           </div>
           <div className="space-y-1">
              <Label>Vehicle Type</Label>
              <Select value={formData.car_type} onValueChange={v => setFormData({...formData, car_type: v})}>
                 <SelectTrigger className="bg-slate-800 border-slate-600"><SelectValue /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Innova Crysta">Innova Crysta</SelectItem>
                 </SelectContent>
              </Select>
           </div>
           <div className="space-y-1">
              <Label>Total Amount (₹)</Label>
              <Input type="number" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} className="bg-slate-800 border-slate-600 font-bold text-emerald-400" />
           </div>
        </div>

        <DialogFooter className="border-t border-slate-800 pt-4">
          <Button variant="outline" onClick={onClose} className="border-slate-600 hover:bg-slate-800 text-slate-300">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8">
             {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
