import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Receipt, IndianRupee } from 'lucide-react';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/components/ui/use-toast';

export default function BillGenerationModal({ isOpen, onClose, booking, onBillGenerated }) {
  const { generateBill, loading } = useBills();
  const { toast } = useToast();
  
  // State for all required fields
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    customer_mobile: '',
    customer_email: '', 
    
    // Route info
    from_city: '',
    to_city: '',
    pickup: '',
    drop_location: '',
    
    vehicle_type: '',
    trip_type: 'OneWay',
    base_fare: 0,
    toll_charges: 0,
    parking_charges: 0,
    driver_allowance: 0,
    payment_mode: 'Cash',
    payment_status: 'Pending',
    invoice_date: new Date().toISOString().split('T')[0],
    
    // Additional booking related info
    booking_id: '', // This will hold the UUID
    booking_ref: '', // This will hold the readable ID (e.g. B-1001)
    driver_name: '',
    driver_phone: '',
    car_registration: '',
  });

  useEffect(() => {
    if (booking && isOpen) {
      // Use booking_ref_id as the Invoice Number directly
      // If booking_ref_id is missing, fallback to a timestamp-based ID
      const refId = booking.booking_ref_id || `INV-${Date.now().toString().slice(-6)}`;
      
      setFormData({
        invoice_number: refId,
        booking_id: booking.id, // Keep UUID for relation
        booking_ref: refId, // Set booking_ref to same value as invoice_number
        
        customer_name: booking.name || '',
        customer_mobile: booking.mobile_number || '',
        customer_email: booking.email || '',
        
        from_city: booking.from_city || '',
        to_city: booking.to_city || '',
        pickup: booking.pickup_location || '',
        drop_location: booking.drop_location || '',
        
        vehicle_type: booking.car_type || '',
        trip_type: booking.service_type || 'OneWay',
        base_fare: booking.total_amount || 0,
        toll_charges: 0,
        parking_charges: 0,
        driver_allowance: 0,
        payment_mode: 'Cash',
        payment_status: 'Pending',
        invoice_date: new Date().toISOString().split('T')[0],
        
        driver_name: booking.driver_name || booking.driver_details?.driver_name || '',
        driver_phone: booking.driver_phone || booking.driver_details?.driver_mobile_number || '',
        car_registration: booking.driver_car_no || booking.driver_details?.cab_registration_number || '',
      });
    }
  }, [booking, isOpen]);

  const calculateTotal = () => {
    // Handle potential empty strings or undefined values safely
    const base = parseFloat(formData.base_fare) || 0;
    const toll = parseFloat(formData.toll_charges) || 0;
    const parking = parseFloat(formData.parking_charges) || 0;
    const da = parseFloat(formData.driver_allowance) || 0;
    return base + toll + parking + da;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If invoice_number changes, keep booking_ref in sync
      if (name === 'invoice_number') {
        newData.booking_ref = value;
      }
      return newData;
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Starting Bill Generation Submission...");
    console.log("Current Form Data:", formData);

    // 1. Precise validation logic
    const errors = [];
    
    // Check visibly required fields (marked with * in UI)
    if (!formData.invoice_number?.toString().trim()) errors.push("Invoice Number");
    if (!formData.invoice_date) errors.push("Invoice Date");
    if (!formData.customer_name?.toString().trim()) errors.push("Customer Name");
    if (!formData.customer_mobile?.toString().trim()) errors.push("Mobile Number");
    // Only check pickup/drop if actually needed, but usually good to have
    if (!formData.from_city?.toString().trim()) errors.push("From City");
    if (!formData.to_city?.toString().trim()) errors.push("To City");

    // Note: total_amount was previously checked in formData but it's a calculated value, not in state.
    // We check if the calculation returns a valid number (even 0 is valid for a bill technically, though unlikely)
    const total_amount = calculateTotal();
    if (isNaN(total_amount)) errors.push("Invalid Amount Calculation");

    if (errors.length > 0) {
      console.error("Validation Failed. Missing fields:", errors);
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: `Please check the following fields: ${errors.join(', ')}`
      });
      return;
    }

    try {
      const billPayload = {
        booking_id: formData.booking_id, // UUID Link
        booking_ref: formData.invoice_number, // Readable ID (Same as Invoice Number per requirement)
        bill_number: formData.invoice_number,
        
        customer_name: formData.customer_name,
        customer_phone: formData.customer_mobile,
        customer_email: formData.customer_email,
        
        from_city: formData.from_city,
        to_city: formData.to_city,
        pickup_location: formData.pickup,
        drop_location: formData.drop_location,
        
        car_model: formData.vehicle_type,
        trip_type: formData.trip_type,
        
        // Ensure numeric values are sent, default to 0
        payment_amount: parseFloat(formData.base_fare) || 0,
        toll_amount: parseFloat(formData.toll_charges) || 0,
        parking_amount: parseFloat(formData.parking_charges) || 0,
        driver_da_amount: parseFloat(formData.driver_allowance) || 0,
        total_amount: total_amount,
        
        payment_mode: formData.payment_mode,
        payment_status: formData.payment_status,
        invoice_date: formData.invoice_date,
        
        // Additional info
        driver_name: formData.driver_name,
        driver_phone: formData.driver_phone,
        car_registration: formData.car_registration,
        status: 'Generated',
        pickup_date: booking.pickup_date,
        pickup_time: booking.pickup_time
      };

      console.log("Payload ready for submission:", billPayload);

      const newBill = await generateBill(billPayload);
      
      if (newBill) {
        onBillGenerated(newBill);
        onClose();
      }
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      toast({
        variant: "destructive",
        title: "System Error",
        description: "An unexpected error occurred while processing the bill."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-6 w-6 text-amber-500" />
            Generate Invoice
          </DialogTitle>
          <DialogDescription>
            Verify and complete all details for Invoice <span className="font-mono font-bold text-amber-600">{formData.invoice_number}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          
          {/* Section 1: Header Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-1 text-sm uppercase tracking-wide">1. Header Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number / Booking ID *</Label>
                <Input 
                  id="invoice_number" 
                  name="invoice_number" 
                  value={formData.invoice_number} 
                  onChange={handleChange} 
                  placeholder="e.g. B-123456"
                />
                <p className="text-[10px] text-slate-500">This will be used as both Invoice No. and Booking ID.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_date">Invoice Date *</Label>
                <Input type="date" id="invoice_date" name="invoice_date" value={formData.invoice_date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking_display">Original Booking Ref</Label>
                <Input id="booking_display" value={booking?.booking_ref_id || 'N/A'} disabled className="bg-slate-100" />
              </div>
            </div>
          </div>

          {/* Section 2: Customer & Trip */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-1 text-sm uppercase tracking-wide">2. Customer & Trip Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input id="customer_name" name="customer_name" value={formData.customer_name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_mobile">Mobile Number *</Label>
                <Input id="customer_mobile" name="customer_mobile" value={formData.customer_mobile} onChange={handleChange} />
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
            
            {/* Route Information Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="from_city">From City *</Label>
                <Input id="from_city" name="from_city" value={formData.from_city} onChange={handleChange} placeholder="e.g. Mumbai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_city">To City *</Label>
                <Input id="to_city" name="to_city" value={formData.to_city} onChange={handleChange} placeholder="e.g. Pune" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Address / Landmark</Label>
                <Input id="pickup" name="pickup" value={formData.pickup} onChange={handleChange} placeholder="e.g. Airport Terminal 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drop_location">Drop Address / Landmark</Label>
                <Input id="drop_location" name="drop_location" value={formData.drop_location} onChange={handleChange} placeholder="e.g. Phoenix Mall" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                <Input id="vehicle_type" name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section 3: Financials */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-1 text-sm uppercase tracking-wide">3. Charges Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_fare">Base Fare</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="number" id="base_fare" name="base_fare" value={formData.base_fare} onChange={handleChange} className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toll_charges">Toll Charges</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="number" id="toll_charges" name="toll_charges" value={formData.toll_charges} onChange={handleChange} className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parking_charges">Parking Charges</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="number" id="parking_charges" name="parking_charges" value={formData.parking_charges} onChange={handleChange} className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_allowance">Driver Allowance</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="number" id="driver_allowance" name="driver_allowance" value={formData.driver_allowance} onChange={handleChange} className="pl-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Payment */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-1 text-sm uppercase tracking-wide">4. Payment Details</h3>
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
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg flex justify-between items-center mb-4 border border-amber-200">
           <span className="font-bold text-slate-800 uppercase">Total Payable Amount</span>
           <span className="text-2xl font-black text-amber-600">₹{calculateTotal()}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white font-bold w-full sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Generate Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}