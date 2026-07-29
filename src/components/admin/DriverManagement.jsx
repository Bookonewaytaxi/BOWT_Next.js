import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash, Search, User, Car, Phone, ShieldCheck, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import DriverForm from './DriverForm';

export default function DriverManagement() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load drivers list."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Driver deleted successfully." });
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete driver."
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDriver(null);
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.driver_phone?.includes(searchTerm) ||
    driver.car_registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e293b] p-6 rounded-2xl border border-slate-700/50 shadow-xl">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             <User className="h-6 w-6 text-amber-500" /> Driver Fleet
             <button onClick={fetchDrivers} className="p-1.5 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white" title="Refresh">
               <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
           </h2>
           <p className="text-slate-400 text-sm mt-1">Manage your drivers and vehicle assignments.</p>
        </div>
        <Button 
           onClick={() => setShowForm(true)} 
           className="bg-gradient-to-r from-amber-500 to-amber-600 text-navy font-bold shadow-lg hover:shadow-amber-500/20"
        >
           <Plus className="h-5 w-5 mr-2" /> Add New Driver
        </Button>
      </div>

      <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
         <Input 
           placeholder="Search drivers by name, phone, or car number..." 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="pl-10 bg-[#1e293b] border-slate-700 text-white placeholder:text-slate-500 h-12"
         />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="text-center py-20 bg-[#1e293b] rounded-xl border border-dashed border-slate-700">
           <User className="h-12 w-12 text-slate-500 mx-auto mb-3" />
           <h3 className="text-xl font-bold text-slate-300">No Drivers Found</h3>
           <p className="text-slate-500 mt-1">Try a different search or add a new driver.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredDrivers.map((driver) => (
              <motion.div 
                 key={driver.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-colors shadow-lg group"
              >
                 <div className="p-5 border-b border-slate-700/50 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg border border-slate-600">
                          {driver.driver_name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="font-bold text-white text-lg">{driver.driver_name}</h3>
                          <div className={`text-xs px-2 py-0.5 rounded-full inline-block font-bold ${
                             driver.status === 'Active' ? 'bg-green-500/20 text-green-400' : 
                             driver.status === 'On Duty' ? 'bg-blue-500/20 text-blue-400' : 
                             'bg-red-500/20 text-red-400'
                          }`}>
                             {driver.status}
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-1">
                       <Button size="sm" variant="ghost" onClick={() => handleEdit(driver)} className="h-8 w-8 p-0 text-slate-400 hover:text-amber-400 hover:bg-slate-700">
                          <Edit className="h-4 w-4" />
                       </Button>
                       <Button size="sm" variant="ghost" onClick={() => handleDelete(driver.id)} disabled={deletingId === driver.id} className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-700">
                          {deletingId === driver.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash className="h-4 w-4" />}
                       </Button>
                    </div>
                 </div>
                 
                 <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                       <Phone className="h-4 w-4 text-amber-500" />
                       {driver.driver_phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                       <Car className="h-4 w-4 text-amber-500" />
                       {driver.car_model}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                       <ShieldCheck className="h-4 w-4 text-amber-500" />
                       <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-xs">{driver.car_registration_number}</span>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>
      )}

      <DriverForm 
        isOpen={showForm} 
        onClose={handleFormClose} 
        driverToEdit={editingDriver}
        onSuccess={fetchDrivers}
      />
    </div>
  );
}