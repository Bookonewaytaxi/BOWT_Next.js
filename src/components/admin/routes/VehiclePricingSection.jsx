import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Car } from 'lucide-react';

export default function VehiclePricingSection({ formData, handleChange, handleBlur, errors, touched }) {
  const vehicles = [
    { key: 'sedan_price', label: 'Sedan (4+1)', placeholder: '1200' },
    { key: 'ertiga_price', label: 'Ertiga (6+1)', placeholder: '1800' },
    { key: 'carens_price', label: 'Kia Carens (7+1)', placeholder: '2000' },
    { key: 'innova_crysta_price', label: 'Innova Crysta (8+1)', placeholder: '2500' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Car className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-white">Vehicle Pricing</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.key} className="space-y-2">
            <Label htmlFor={vehicle.key} className="text-sm font-medium text-slate-300">
              {vehicle.label} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
              <Input
                id={vehicle.key}
                type="number"
                min="0"
                value={formData[vehicle.key]}
                onChange={(e) => handleChange(vehicle.key, e.target.value)}
                onBlur={() => handleBlur(vehicle.key)}
                placeholder={vehicle.placeholder}
                className={cn(
                  "pl-7 bg-slate-950 border-slate-800",
                  errors[vehicle.key] && touched[vehicle.key] ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:border-amber-500"
                )}
              />
            </div>
            {touched[vehicle.key] && errors[vehicle.key] && (
              <p className="text-xs text-red-500">{errors[vehicle.key]}</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">All prices should be inclusive of Tolls and Driver Allowance.</p>
    </div>
  );
}