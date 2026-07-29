import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

export default function BillEditModal({ isOpen, onClose, bill, onBillUpdated }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bill) {
      setFormData({
        customer_name: bill.customer_name || '',
        customer_phone: bill.customer_phone || '',
        customer_email: bill.customer_email || '',
        from_city: bill.from_city || '',
        to_city: bill.to_city || '',
        car_model: bill.car_model || '',
        payment_amount: bill.payment_amount || 0, // Base Fare
        tax_amount: (bill.total_amount - bill.payment_amount) > 0 ? (bill.total_amount - bill.payment_amount) : 0, // Approx Tax
        notes: bill.description || '', // Mapping notes to description if available
      });
    }
  }, [bill]);

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_name || formData.customer_name.length < 2) newErrors.customer_name = "Name must be at least 2 chars";
    if (!formData.customer_phone || formData.customer_phone.length < 10) newErrors.customer_phone = "Valid phone required";
    if (formData.payment_amount < 0) newErrors.payment_amount = "Base fare cannot be negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const totalAmount = Number(formData.payment_amount) + Number(formData.tax_amount);
      
      const { data, error } = await supabase
        .from('bills')
        .update({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email,
          from_city: formData.from_city,
          to_city: formData.to_city,
          car_model: formData.car_model,
          payment_amount: Number(formData.payment_amount),
          total_amount: totalAmount,
          // Store tax implicitly as difference or if you have specific columns like toll_amount, update those if mapped
          // For now, we update total_amount based on base + tax input
        })
        .eq('id', bill.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Bill Updated",
        description: "Invoice details saved successfully.",
        className: "bg-green-600 text-white"
      });
      
      if (onBillUpdated) onBillUpdated(data);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update bill details."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle>Edit Invoice Details</DialogTitle>
          <DialogDescription>Modify the details appearing on the invoice.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input 
                id="customer_name" 
                value={formData.customer_name} 
                onChange={e => setFormData({...formData, customer_name: e.target.value})}
                className={errors.customer_name ? "border-red-500" : ""}
              />
              {errors.customer_name && <p className="text-xs text-red-500">{errors.customer_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone Number</Label>
              <Input 
                id="customer_phone" 
                value={formData.customer_phone} 
                onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                className={errors.customer_phone ? "border-red-500" : ""}
              />
              {errors.customer_phone && <p className="text-xs text-red-500">{errors.customer_phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">Email Address</Label>
            <Input 
              id="customer_email" 
              value={formData.customer_email} 
              onChange={e => setFormData({...formData, customer_email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_city">From City</Label>
              <Input 
                id="from_city" 
                value={formData.from_city} 
                onChange={e => setFormData({...formData, from_city: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_city">To City</Label>
              <Input 
                id="to_city" 
                value={formData.to_city} 
                onChange={e => setFormData({...formData, to_city: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
             <Label htmlFor="car_model">Vehicle Type</Label>
             <Input 
                id="car_model" 
                value={formData.car_model} 
                onChange={e => setFormData({...formData, car_model: e.target.value})}
             />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="space-y-2">
                <Label htmlFor="payment_amount">Base Fare (₹)</Label>
                <Input 
                   id="payment_amount" 
                   type="number"
                   value={formData.payment_amount} 
                   onChange={e => setFormData({...formData, payment_amount: e.target.value})}
                   className={errors.payment_amount ? "border-red-500" : ""}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="tax_amount">Extra/Tax Amount (₹)</Label>
                <Input 
                   id="tax_amount" 
                   type="number"
                   value={formData.tax_amount} 
                   onChange={e => setFormData({...formData, tax_amount: e.target.value})}
                />
             </div>
             <div className="col-span-2 text-right">
                <p className="text-sm font-bold text-slate-700">
                   Total: ₹{Number(formData.payment_amount || 0) + Number(formData.tax_amount || 0)}
                </p>
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-slate-900 text-white hover:bg-slate-800">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}