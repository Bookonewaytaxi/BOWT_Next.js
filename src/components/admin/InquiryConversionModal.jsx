import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function InquiryConversionModal({ isOpen, onClose, inquiry, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    email: '',
    from_city: '',
    to_city: '',
    pickup_date: '',
    pickup_time: '',
    car_type: 'Sedan',
    pickup_location: '',
    drop_location: '',
    total_amount: 0,
    advance_amount: 0
  });

  useEffect(() => {
    if (inquiry) {
      setFormData({
        customer_name: inquiry.name || '',
        mobile_number: inquiry.phone || '',
        email: inquiry.email || '',
        from_city: inquiry.from_city || '',
        to_city: inquiry.to_city || '',
        pickup_date: inquiry.pickup_date || '',
        pickup_time: inquiry.pickup_time || '',
        car_type: inquiry.car_type || 'Sedan',
        pickup_location: inquiry.from_city || '',
        drop_location: inquiry.to_city || '',
        total_amount: 0,
        advance_amount: 0
      });
    }
  }, [inquiry]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create Booking
      const bookingRef = `BK${Date.now().toString().slice(-6)}`;
      
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          name: formData.customer_name,
          mobile_number: formData.mobile_number,
          email: formData.email,
          from_city: formData.from_city,
          to_city: formData.to_city,
          pickup_date: formData.pickup_date,
          pickup_time: formData.pickup_time,
          car_type: formData.car_type,
          pickup_location: formData.pickup_location,
          drop_location: formData.drop_location,
          total_amount: formData.total_amount,
          advance_amount: formData.advance_amount,
          status: 'Confirmed', // Default for conversion
          payment_status: 'Pending',
          booking_ref_id: bookingRef,
          inquiry_id: inquiry.id
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Update Inquiry Status
      const { error: inquiryError } = await supabase
        .from('inquiries')
        .update({ 
           status: 'converted_to_booking',
           booking_id: bookingData.id
        })
        .eq('id', inquiry.id);

      if (inquiryError) throw inquiryError;

      toast({
        title: "Inquiry Converted!",
        description: `Booking #${bookingRef} created successfully.`,
        className: "bg-green-50 border-green-200 text-green-900"
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Conversion failed:', error);
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1e293b] text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <ArrowRightLeft className="h-5 w-5 text-amber-500" /> 
             Convert Inquiry to Booking
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
           {/* Row 1 */}
           <div className="space-y-1">
              <Label>Customer Name</Label>
              <Input 
                 value={formData.customer_name} 
                 onChange={e => setFormData({...formData, customer_name: e.target.value})}
                 className="bg-slate-800 border-slate-600"
              />
           </div>
           <div className="space-y-1">
              <Label>Mobile Number</Label>
              <Input 
                 value={formData.mobile_number} 
                 onChange={e => setFormData({...formData, mobile_number: e.target.value})}
                 className="bg-slate-800 border-slate-600"
              />
           </div>

           {/* Row 2 */}
           <div className="space-y-1">
              <Label>From City</Label>
              <Input 
                 value={formData.from_city} 
                 onChange={e => setFormData({...formData, from_city: e.target.value})}
                 className="bg-slate-800 border-slate-600"
              />
           </div>
           <div className="space-y-1">
              <Label>To City</Label>
              <Input 
                 value={formData.to_city} 
                 onChange={e => setFormData({...formData, to_city: e.target.value})}
                 className="bg-slate-800 border-slate-600"
              />
           </div>

           {/* Row 3 */}
           <div className="space-y-1">
              <Label>Pickup Date</Label>
              <Input 
                 type="date"
                 value={formData.pickup_date} 
                 onChange={e => setFormData({...formData, pickup_date: e.target.value})}
                 className="bg-slate-800 border-slate-600"
              />
           </div>
           <div className="space-y-1">
              <Label>Pickup Time</Label>
              <Input 
                 type="time"
                 value={formData.pickup_time} 
                 onChange={e => setFormData({...formData, pickup_time: e.target.value})}
                 className="bg-slate-800 border-slate-600"
              />
           </div>

           {/* Row 4 */}
           <div className="space-y-1">
              <Label>Car Type</Label>
              <Select value={formData.car_type} onValueChange={v => setFormData({...formData, car_type: v})}>
                 <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Innova Crysta">Innova Crysta</SelectItem>
                 </SelectContent>
              </Select>
           </div>
           <div className="space-y-1">
              <Label>Email (Optional)</Label>
              <Input 
                 value={formData.email} 
                 onChange={e => setFormData({...formData, email: e.target.value})}
                 className="bg-slate-800 border-slate-600"
              />
           </div>

           {/* Row 5 - Specific Locations */}
           <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <Label>Pickup Address</Label>
                 <Input 
                    value={formData.pickup_location} 
                    onChange={e => setFormData({...formData, pickup_location: e.target.value})}
                    placeholder="Full address"
                    className="bg-slate-800 border-slate-600"
                 />
              </div>
              <div className="space-y-1">
                 <Label>Drop Address</Label>
                 <Input 
                    value={formData.drop_location} 
                    onChange={e => setFormData({...formData, drop_location: e.target.value})}
                    placeholder="Full address"
                    className="bg-slate-800 border-slate-600"
                 />
              </div>
           </div>

           {/* Row 6 - Pricing */}
           <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <div className="space-y-1">
                 <Label className="text-green-400">Total Quote Amount (₹)</Label>
                 <Input 
                    type="number"
                    value={formData.total_amount} 
                    onChange={e => setFormData({...formData, total_amount: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-lg font-bold"
                 />
              </div>
              <div className="space-y-1">
                 <Label className="text-yellow-400">Advance (If Any)</Label>
                 <Input 
                    type="number"
                    value={formData.advance_amount} 
                    onChange={e => setFormData({...formData, advance_amount: e.target.value})}
                    className="bg-slate-900 border-slate-600"
                 />
              </div>
           </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</> : 'Confirm & Create Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}