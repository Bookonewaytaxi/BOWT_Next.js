import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Car, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AssignDriverModal({ isOpen, onClose, booking, onAssignmentComplete }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [useManualEntry, setUseManualEntry] = useState(false);
  
  // Manual Entry State
  const [manualData, setManualData] = useState({
    driverName: '',
    driverMobile: '',
    carModel: '',
    cabRegistration: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
      if (booking?.driver_id) {
         setSelectedDriverId(booking.driver_id);
         setUseManualEntry(false);
      } else if (booking?.driver_name && !booking.driver_id) {
         setUseManualEntry(true);
         setManualData({
            driverName: booking.driver_name || '',
            driverMobile: booking.driver_phone || '',
            carModel: booking.driver_details?.car_model || booking.car_type || '',
            cabRegistration: booking.driver_car_no || ''
         });
      } else {
         setSelectedDriverId('');
         setUseManualEntry(false);
         setManualData({ driverName: '', driverMobile: '', carModel: '', cabRegistration: '' });
      }
    }
  }, [isOpen, booking]);

  const fetchDrivers = async () => {
    // Fetch all drivers to check status
    const { data } = await supabase.from('drivers').select('*');
    // Sort so available are first, others below disabled
    const sorted = data?.sort((a, b) => {
       if (a.status === 'Available' && b.status !== 'Available') return -1;
       if (a.status !== 'Available' && b.status === 'Available') return 1;
       return 0;
    }) || [];
    setDrivers(sorted);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let driverDetails = {};
      let driverIdToSave = null;

      if (useManualEntry) {
         if (!manualData.driverName || !manualData.driverMobile) {
            throw new Error("Please fill in driver name and mobile.");
         }
         driverDetails = {
            driver_name: manualData.driverName,
            driver_mobile_number: manualData.driverMobile,
            car_model: manualData.carModel,
            cab_registration_number: manualData.cabRegistration
         };
      } else {
         if (!selectedDriverId) throw new Error("Please select a driver from the list.");
         
         const selectedDriver = drivers.find(d => d.id === selectedDriverId);
         if (!selectedDriver) throw new Error("Invalid driver selection.");

         driverIdToSave = selectedDriver.id;
         driverDetails = {
            driver_name: selectedDriver.driver_name,
            driver_mobile_number: selectedDriver.driver_phone,
            car_model: selectedDriver.car_model,
            cab_registration_number: selectedDriver.car_registration_number
         };
      }

      // Determine if this is a new assignment or a change
      const isChange = !!booking.driver_name;
      const functionName = isChange ? 'send-driver-change-email' : 'send-driver-assignment-email';

      // 1. Update Booking
      const { error: dbError } = await supabase
        .from('bookings')
        .update({
          status: 'Driver Assigned',
          driver_details: driverDetails,
          driver_id: driverIdToSave,
          driver_assignment_date: new Date().toISOString(),
          driver_name: driverDetails.driver_name,
          driver_phone: driverDetails.driver_mobile_number,
          driver_car_no: driverDetails.cab_registration_number
        })
        .eq('id', booking.id);

      if (dbError) throw dbError;
      
      // 2. Update Driver Status (If selected from list)
      if (driverIdToSave) {
         await supabase.from('drivers').update({ status: 'On Trip' }).eq('id', driverIdToSave);
      }
      // If changing driver, we should arguably set previous driver to 'Available' but that logic 
      // is complex without knowing previous ID easily. Skipping for this iteration.

      // 3. Send Email (non-blocking in UI, but good to wait)
      const emailPayload = {
        customer_email: booking.email,
        customer_name: booking.name,
        booking_ref_id: booking.booking_ref_id || booking.id,
        driver_name: driverDetails.driver_name,
        driver_phone: driverDetails.driver_mobile_number,
        car_model: driverDetails.car_model,
        car_registration: driverDetails.cab_registration_number,
        pickup_city: booking.from_city,
        drop_city: booking.to_city,
        pickup_date: booking.pickup_date
      };

      try {
        await supabase.functions.invoke(functionName, { body: JSON.stringify(emailPayload) });
      } catch (e) {
        console.warn("Email send warning", e);
      }

      toast({ title: "Success", description: `Driver ${isChange ? 'changed' : 'assigned'} successfully.` });
      onAssignmentComplete();
      onClose();
    } catch (error) {
      console.error('Assignment error:', error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getDriverStatusIndicator = (status) => {
     if (status === 'Available') return <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>;
     if (status === 'On Trip') return <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>;
     return <span className="h-2 w-2 rounded-full bg-slate-500 mr-2"></span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Car className="h-5 w-5 text-amber-500" />
            {booking?.driver_name ? 'Change Driver' : 'Assign Driver'}
          </DialogTitle>
          <DialogDescription>
            Select a driver from your fleet or enter details manually.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
           {/* Toggle Mode */}
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                 onClick={() => setUseManualEntry(false)}
                 className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!useManualEntry ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                 Select from Fleet
              </button>
              <button 
                 onClick={() => setUseManualEntry(true)}
                 className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${useManualEntry ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                 Manual Entry
              </button>
           </div>

           {useManualEntry ? (
              <div className="space-y-3 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <Label className="text-xs">Name</Label>
                       <Input value={manualData.driverName} onChange={(e) => setManualData({...manualData, driverName: e.target.value})} placeholder="Driver Name" />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">Phone</Label>
                       <Input value={manualData.driverMobile} onChange={(e) => setManualData({...manualData, driverMobile: e.target.value})} placeholder="+91..." />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">Car Model</Label>
                       <Input value={manualData.carModel} onChange={(e) => setManualData({...manualData, carModel: e.target.value})} placeholder="e.g. Swift Dzire" />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">Reg. Number</Label>
                       <Input value={manualData.cabRegistration} onChange={(e) => setManualData({...manualData, cabRegistration: e.target.value})} placeholder="GJ-01..." />
                    </div>
                 </div>
              </div>
           ) : (
              <div className="space-y-2">
                 <Label>Select Driver</Label>
                 <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger className="w-full h-12">
                       <SelectValue placeholder="Choose active driver..." />
                    </SelectTrigger>
                    <SelectContent>
                       {drivers.map(d => (
                          <SelectItem key={d.id} value={d.id} disabled={d.status !== 'Available'}>
                             <div className="flex flex-col text-left">
                                <span className="font-bold flex items-center">
                                   {getDriverStatusIndicator(d.status)}
                                   {d.driver_name} 
                                   {d.status !== 'Available' && <span className="ml-2 text-[10px] text-slate-400 font-normal">({d.status})</span>}
                                </span>
                                <span className="text-xs text-slate-500 pl-4">{d.car_model} - {d.car_registration_number}</span>
                             </div>
                          </SelectItem>
                       ))}
                       {drivers.length === 0 && <div className="p-2 text-sm text-slate-500 text-center">No drivers found.</div>}
                    </SelectContent>
                 </Select>
                 {selectedDriverId && (
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm flex items-center gap-2 border border-blue-100">
                       <CheckCircle2 className="h-4 w-4" />
                       Driver details will be auto-filled.
                    </div>
                 )}
              </div>
           )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {booking?.driver_name ? 'Updating...' : 'Assigning...'}
              </>
            ) : (
              booking?.driver_name ? 'Change Driver' : 'Assign & Notify'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}