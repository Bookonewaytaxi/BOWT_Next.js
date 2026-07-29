import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Car, Fuel, Save, Loader2, Edit2, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { Textarea } from '@/components/ui/textarea';
import VehicleImage from '@/components/vehicle/VehicleImage'; // Import VehicleImage

export default function VehicleManagement() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vehicle_types').select('*').order('name');
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (vehicle) => {
    try {
      const { error } = await supabase
        .from('vehicle_types')
        .update({
          description: vehicle.description,
          included_km: parseInt(vehicle.included_km),
          extra_km_fare: parseInt(vehicle.extra_km_fare),
          driver_charges: parseInt(vehicle.driver_charges),
          night_charges: parseInt(vehicle.night_charges),
          image_url: vehicle.image_url
        })
        .eq('id', vehicle.id);

      if (error) throw error;
      toast({ title: "Success", description: "Vehicle settings updated" });
      setEditingId(null);
      fetchVehicles();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Car className="h-6 w-6 text-purple-500" /> Vehicle Types & Settings
      </h2>
      <p className="text-slate-400 text-sm">Manage default settings, descriptions, and included charges for each vehicle type.</p>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
                <div className="h-16 w-16 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <VehicleImage // Use VehicleImage component here
                    src={vehicle.image_url} 
                    alt={vehicle.name} 
                    containerClassName="h-full w-full"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{vehicle.name}</h3>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{vehicle.type_key}</p>
                </div>
                {editingId !== vehicle.id && (
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setEditingId(vehicle.id)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea 
                    disabled={editingId !== vehicle.id}
                    value={vehicle.description || ''}
                    onChange={(e) => {
                      const newVehicles = vehicles.map(v => v.id === vehicle.id ? {...v, description: e.target.value} : v);
                      setVehicles(newVehicles);
                    }}
                    className="bg-slate-900 border-slate-700 min-h-[80px]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Image URL</Label>
                  <div className="relative">
                    <Input 
                      disabled={editingId !== vehicle.id}
                      type="text"
                      value={vehicle.image_url || ''}
                      onChange={(e) => {
                        const newVehicles = vehicles.map(v => v.id === vehicle.id ? {...v, image_url: e.target.value} : v);
                        setVehicles(newVehicles);
                      }}
                      className="bg-slate-900 border-slate-700 pl-9"
                    />
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Included KM</Label>
                    <div className="relative">
                      <Input 
                        disabled={editingId !== vehicle.id}
                        type="number"
                        value={vehicle.included_km}
                        onChange={(e) => {
                          const newVehicles = vehicles.map(v => v.id === vehicle.id ? {...v, included_km: e.target.value} : v);
                          setVehicles(newVehicles);
                        }}
                        className="bg-slate-900 border-slate-700 pl-8"
                      />
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500">KM</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Extra KM Fare (₹)</Label>
                    <Input 
                      disabled={editingId !== vehicle.id}
                      type="number"
                      value={vehicle.extra_km_fare}
                      onChange={(e) => {
                        const newVehicles = vehicles.map(v => v.id === vehicle.id ? {...v, extra_km_fare: e.target.value} : v);
                        setVehicles(newVehicles);
                      }}
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Driver Charges (₹)</Label>
                    <Input 
                      disabled={editingId !== vehicle.id}
                      type="number"
                      value={vehicle.driver_charges}
                      onChange={(e) => {
                        const newVehicles = vehicles.map(v => v.id === vehicle.id ? {...v, driver_charges: e.target.value} : v);
                        setVehicles(newVehicles);
                      }}
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Night Charges (₹)</Label>
                    <Input 
                      disabled={editingId !== vehicle.id}
                      type="number"
                      value={vehicle.night_charges}
                      onChange={(e) => {
                        const newVehicles = vehicles.map(v => v.id === vehicle.id ? {...v, night_charges: e.target.value} : v);
                        setVehicles(newVehicles);
                      }}
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                </div>

                {editingId === vehicle.id && (
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleUpdate(vehicle)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingId(null); fetchVehicles(); }} className="border-slate-600 text-slate-300">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}