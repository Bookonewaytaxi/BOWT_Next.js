import React, { useState } from 'react';
import { Tag, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function CouponInput({ ourPrice, onCouponApplied }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (dbError || !data) {
        throw new Error('Invalid coupon code');
      }

      // Check date validity
      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) throw new Error('Coupon not yet valid');
      if (data.valid_until && new Date(data.valid_until) < now) throw new Error('Coupon expired');
      
      // Check limits
      if (data.usage_limit && data.used_count >= data.usage_limit) throw new Error('Coupon usage limit reached');
      if (data.min_booking_amount && ourPrice < data.min_booking_amount) {
        throw new Error(`Minimum booking amount ₹${data.min_booking_amount} required`);
      }

      // Calculate Discount
      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = Math.round((ourPrice * data.discount_value) / 100);
        if (data.max_discount_amount) {
          discount = Math.min(discount, data.max_discount_amount);
        }
      } else {
        discount = data.discount_value;
      }

      const finalPrice = Math.max(0, ourPrice - discount);
      
      const result = {
        code: data.code,
        discountAmount: discount,
        finalPrice: finalPrice,
        id: data.id
      };

      setAppliedCoupon(result);
      onCouponApplied(result);
      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${discount}`,
        className: "bg-green-600 text-white"
      });

    } catch (err) {
      setError(err.message);
      setAppliedCoupon(null);
      onCouponApplied(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setAppliedCoupon(null);
    setError(null);
    onCouponApplied(null);
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-bold text-green-800 text-sm">Code {appliedCoupon.code} Applied</p>
            <p className="text-green-600 text-xs">₹{appliedCoupon.discountAmount} savings applied</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            placeholder="Enter coupon code"
            className={cn("pl-9", error && "border-red-500 focus-visible:ring-red-500")}
          />
        </div>
        <Button onClick={handleApply} disabled={!code || loading} className="bg-slate-900 text-white hover:bg-slate-800">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <XCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}