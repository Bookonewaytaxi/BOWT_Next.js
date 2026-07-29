import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lock } from 'lucide-react';

export default function AdminOnlySection({ 
  data, 
  onChange, 
  isEditable 
}) {
  return (
    <div className="mb-5 p-4 border border-slate-200 rounded-md bg-slate-100 border-l-4 border-l-red-500">
      <div className="flex items-center gap-2 mb-4 text-red-600">
        <Lock className="w-4 h-4" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Admin Only Fields</h3>
        <span className="text-xs text-slate-500 normal-case ml-2">(Not visible to customer)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Toll Charges</Label>
          <Input 
            type="number" 
            value={data.toll || 0}
            onChange={(e) => isEditable && onChange('toll', e.target.value)}
            disabled={!isEditable}
            className="bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Parking</Label>
          <Input 
            type="number" 
            value={data.parking || 0}
            onChange={(e) => isEditable && onChange('parking', e.target.value)}
            disabled={!isEditable}
            className="bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Border Tax</Label>
          <Input 
            type="number" 
            value={data.border_tax || 0}
            onChange={(e) => isEditable && onChange('border_tax', e.target.value)}
            disabled={!isEditable}
            className="bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Driver Allowance</Label>
          <Input 
            type="number" 
            value={data.driver_allowance || 0}
            onChange={(e) => isEditable && onChange('driver_allowance', e.target.value)}
            disabled={!isEditable}
            className="bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-slate-500">Internal Notes</Label>
        <Textarea 
          value={data.internal_notes || ''}
          onChange={(e) => isEditable && onChange('internal_notes', e.target.value)}
          disabled={!isEditable}
          className="bg-white min-h-[80px]"
          placeholder="Private notes about this trip..."
        />
      </div>
    </div>
  );
}