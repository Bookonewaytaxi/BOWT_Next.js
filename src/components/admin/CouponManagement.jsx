import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash, Ticket, Calendar, Percent, IndianRupee, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CouponManagement() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_booking_amount: 0,
    max_discount_amount: 0,
    valid_until: '',
    usage_limit: 100
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      if (!newCoupon.code || !newCoupon.discount_value) return;

      const { error } = await supabase.from('coupons').insert([{
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        valid_until: newCoupon.valid_until ? new Date(newCoupon.valid_until).toISOString() : null
      }]);

      if (error) throw error;

      toast({ title: "Success", description: "Coupon created successfully" });
      setIsDialogOpen(false);
      fetchCoupons();
      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_booking_amount: 0,
        max_discount_amount: 0,
        valid_until: '',
        usage_limit: 100
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error creating coupon", description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Coupon removed successfully" });
      fetchCoupons();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Ticket className="h-6 w-6 text-amber-500" /> Coupon Management
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
              <Plus className="h-4 w-4 mr-2" /> Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Coupon Code</Label>
                <Input 
                  value={newCoupon.code} 
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. SUMMER2025" 
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select 
                    value={newCoupon.discount_type} 
                    onValueChange={v => setNewCoupon({...newCoupon, discount_type: v})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Value</Label>
                  <Input 
                    type="number"
                    value={newCoupon.discount_value} 
                    onChange={e => setNewCoupon({...newCoupon, discount_value: parseInt(e.target.value)})}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Min Booking Amt (₹)</Label>
                  <Input 
                    type="number"
                    value={newCoupon.min_booking_amount} 
                    onChange={e => setNewCoupon({...newCoupon, min_booking_amount: parseInt(e.target.value)})}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                {newCoupon.discount_type === 'percentage' && (
                  <div className="grid gap-2">
                    <Label>Max Discount (₹)</Label>
                    <Input 
                      type="number"
                      value={newCoupon.max_discount_amount} 
                      onChange={e => setNewCoupon({...newCoupon, max_discount_amount: parseInt(e.target.value)})}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Valid Until</Label>
                <Input 
                  type="date"
                  value={newCoupon.valid_until} 
                  onChange={e => setNewCoupon({...newCoupon, valid_until: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <Button onClick={handleCreateCoupon} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900">
                Create Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-10"><Loader2 className="animate-spin text-amber-500" /></div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-10">No coupons found. Create one to get started.</div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ticket className="h-24 w-24 -rotate-12" />
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-3 py-1 rounded-lg text-lg font-mono font-bold">
                  {coupon.code}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="text-slate-500 hover:text-red-500">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  {coupon.discount_type === 'percentage' ? <Percent className="h-4 w-4 text-blue-400" /> : <IndianRupee className="h-4 w-4 text-green-400" />}
                  <span className="font-bold text-xl">{coupon.discount_value} {coupon.discount_type === 'percentage' ? '%' : ' OFF'}</span>
                </div>
                
                <div className="text-sm text-slate-400 space-y-1">
                  <p>Min Order: ₹{coupon.min_booking_amount}</p>
                  {coupon.max_discount_amount > 0 && <p>Max Discount: ₹{coupon.max_discount_amount}</p>}
                  {coupon.valid_until && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
                      <Calendar className="h-3 w-3" />
                      Expires: {new Date(coupon.valid_until).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="pt-3 flex justify-between items-center text-xs text-slate-500">
                  <span>Used: {coupon.used_count || 0} times</span>
                  <span className={`px-2 py-0.5 rounded-full ${coupon.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}