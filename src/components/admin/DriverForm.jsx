import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Car, User, Phone, FileText } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

export default function DriverForm({ isOpen, onClose, driverToEdit, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    driver_name: '',
    driver_phone: '',
    car_model: '',
    car_registration_number: '',
    status: 'Active'
  });

  useEffect(() => {
    if (driverToEdit) {
      setFormData({
        driver_name: driverToEdit.driver_name || '',
        driver_phone: driverToEdit.driver_phone || '',
        car_model: driverToEdit.car_model || '',
        car_registration_number: driverToEdit.car_registration_number || '',
        status: driverToEdit.status || 'Active'
      });
    } else {
      setFormData({
        driver_name: '',
        driver_phone: '',
        car_model: '',
        car_registration_number: '',
        status: 'Active'
      });
    }
  }, [driverToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.driver_name || !formData.driver_phone || !formData.car_model || !formData.car_registration_number) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    setLoading(true);

    try {
      if (driverToEdit) {
        // Update
        const { error } = await supabase
          .from('drivers')
          .update(formData)
          .eq('id', driverToEdit.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Driver updated successfully." });
      } else {
        // Create
        const { error } = await supabase
          .from('drivers')
          .insert([formData]);
          
        if (error) throw error;
        toast({ title: "Success", description: "Driver added successfully." });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save driver."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {driverToEdit ? <User className="h-5 w-5 text-blue-500" /> : <User className="h-5 w-5 text-green-500" />}
            {driverToEdit ? 'Edit Driver' : 'Add New Driver'}
          </DialogTitle>
          <DialogDescription>
            {driverToEdit ? 'Update driver details below.' : 'Enter details for the new driver.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="driverName"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({...formData, driver_name: e.target.value})}
                  className="pl-9"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="driverPhone"
                  value={formData.driver_phone}
                  onChange={(e) => setFormData({...formData, driver_phone: e.target.value})}
                  className="pl-9"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carModel">Car Model *</Label>
            <Select 
              value={formData.car_model} 
              onValueChange={(val) => setFormData({...formData, car_model: val})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Vehicle Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dzire">Swift Dzire / Etios (Sedan)</SelectItem>
                <SelectItem value="Ertiga">Ertiga / XL6 (SUV)</SelectItem>
                <SelectItem value="Kia Carnes">Kia Carens (SUV)</SelectItem>
                <SelectItem value="Innova Crysta">Innova Crysta (Premium)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carReg">Registration Number *</Label>
            <div className="relative">
              <Car className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="carReg"
                value={formData.car_registration_number}
                onChange={(e) => setFormData({...formData, car_registration_number: e.target.value})}
                className="pl-9 uppercase"
                placeholder="e.g. GJ-01-AB-1234"
              />
            </div>
          </div>
          
          <div className="space-y-2">
             <Label htmlFor="status">Status</Label>
             <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val})}
             >
                <SelectTrigger className="w-full">
                   <SelectValue />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="Active">Active</SelectItem>
                   <SelectItem value="Inactive">Inactive</SelectItem>
                   <SelectItem value="On Duty">On Duty</SelectItem>
                </SelectContent>
             </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {driverToEdit ? 'Update Driver' : 'Add Driver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}