import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBills } from '@/hooks/useBills';
import { Loader2, Edit, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function EditableBillModal({ isOpen, onClose, bill, onBillUpdated }) {
  const { updateBillDetails, loading } = useBills();
  const { toast } = useToast();
  
  // State for all 17 fields
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (bill) {
      // Map DB schema to form state (17 fields)
      setFormData({
        invoice_id: bill.id,
        booking_id: bill.booking_id,
        invoice_number: bill.bill_number,
        invoice_date: bill.invoice_date || (bill.created_at ? bill.created_at.split('T')[0] : ''),
        
        customer_name: bill.customer_name || '',
        customer_mobile: bill.customer_phone || '',
        pickup: bill.pickup_location || '',
        drop_location: bill.drop_location || '',
        
        vehicle_type: bill.car_model || '',
        trip_type: bill.trip_type || '',
        
        base_fare: bill.payment_amount || 0,
        toll_charges: bill.toll_amount || 0,
        parking_charges: bill.parking_amount || 0,
        driver_allowance: bill.driver_da_amount || 0,
        total_amount: bill.total_amount || 0,
        
        payment_mode: bill.payment_mode || '',
        payment_status: bill.payment_status || 'Pending'
      });
    }
  }, [bill, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Re-calculate total? Usually good practice to trust input but offer auto-calc. 
    // Here we trust the explicit input for flexibility.

    // Map form state back to DB schema
    const updatedData = {
      bill_number: formData.invoice_number,
      invoice_date: formData.invoice_date,
      
      customer_name: formData.customer_name,
      customer_phone: formData.customer_mobile,
      pickup_location: formData.pickup,
      drop_location: formData.drop_location,
      
      car_model: formData.vehicle_type,
      trip_type: formData.trip_type,
      
      payment_amount: parseFloat(formData.base_fare),
      toll_amount: parseFloat(formData.toll_charges),
      parking_amount: parseFloat(formData.parking_charges),
      driver_da_amount: parseFloat(formData.driver_allowance),
      total_amount: parseFloat(formData.total_amount),
      
      payment_mode: formData.payment_mode,
      payment_status: formData.payment_status
    };

    const updated = await updateBillDetails(bill.id, updatedData);
    if (updated) {
      if (onBillUpdated) onBillUpdated(updated);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-amber-500" />
            Edit Invoice Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
            <div className="space-y-2">
              <Label>Invoice ID</Label>
              <Input value={formData.invoice_id || ''} disabled className="bg-slate-100" />
            </div>
            <div className="space-y-2">
              <Label>Booking ID</Label>
              <Input value={formData.booking_id || ''} disabled className="bg-slate-100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input id="invoice_number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_date">Invoice Date</Label>
              <Input type="date" id="invoice_date" name="invoice_date" value={formData.invoice_date} onChange={handleChange} />
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
             <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input id="customer_name" name="customer_name" value={formData.customer_name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_mobile">Customer Mobile</Label>
              <Input id="customer_mobile" name="customer_mobile" value={formData.customer_mobile} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input id="pickup" name="pickup" value={formData.pickup} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drop_location">Drop Location</Label>
              <Input id="drop_location" name="drop_location" value={formData.drop_location} onChange={handleChange} />
            </div>
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
             <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Input id="vehicle_type" name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trip_type">Trip Type</Label>
              <Select value={formData.trip_type} onValueChange={(val) => handleSelectChange('trip_type', val)}>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OneWay">One Way</SelectItem>
                    <SelectItem value="RoundTrip">Round Trip</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="Airport">Airport Transfer</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-b pb-4">
             <div className="space-y-2">
              <Label htmlFor="base_fare">Base Fare</Label>
              <Input type="number" id="base_fare" name="base_fare" value={formData.base_fare} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toll_charges">Toll</Label>
              <Input type="number" id="toll_charges" name="toll_charges" value={formData.toll_charges} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parking_charges">Parking</Label>
              <Input type="number" id="parking_charges" name="parking_charges" value={formData.parking_charges} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_allowance">Allowance</Label>
              <Input type="number" id="driver_allowance" name="driver_allowance" value={formData.driver_allowance} onChange={handleChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="total_amount" className="font-bold text-amber-600">Total Amount</Label>
              <Input type="number" id="total_amount" name="total_amount" value={formData.total_amount} onChange={handleChange} className="font-bold" />
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Select value={formData.payment_mode} onValueChange={(val) => handleSelectChange('payment_mode', val)}>
                  <SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online">Online / UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select value={formData.payment_status} onValueChange={(val) => handleSelectChange('payment_status', val)}>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}