import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, User, Phone, Mail } from 'lucide-react';

export default function CustomerDetailsSection({ 
  data, 
  onChange, 
  isEditable, 
  onToggleEdit,
  errors = {}
}) {
  return (
    <div className="mb-5 p-4 border border-slate-200 rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" /> Customer Details
        </h3>
        {/* Only show toggle if not globally locked (handled by parent passing isEditable false if final) */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Full Name</Label>
          {isEditable ? (
            <>
              <Input 
                value={data.name || ''} 
                onChange={(e) => onChange('name', e.target.value)}
                className={errors.name ? "border-red-500" : ""}
                placeholder="Customer Name"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2">{data.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Mobile Number</Label>
          {isEditable ? (
             <>
              <Input 
                value={data.mobile_number || ''} 
                onChange={(e) => onChange('mobile_number', e.target.value)}
                className={errors.mobile_number ? "border-red-500" : ""}
                placeholder="Mobile Number"
              />
              {errors.mobile_number && <p className="text-xs text-red-500">{errors.mobile_number}</p>}
            </>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2 flex items-center gap-2">
              <Phone className="w-3 h-3 text-slate-400" /> {data.mobile_number}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Email Address</Label>
          {isEditable ? (
            <>
              <Input 
                value={data.email || ''} 
                onChange={(e) => onChange('email', e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                placeholder="Email Address"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2 flex items-center gap-2">
              <Mail className="w-3 h-3 text-slate-400" /> {data.email || 'N/A'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}