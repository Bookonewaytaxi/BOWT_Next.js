import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, UserCheck } from 'lucide-react';

export default function VehicleDriverSection({ 
  data, 
  onChange, 
  isEditable,
  errors = {}
}) {
  return (
    <div className="mb-5 p-4 border border-slate-200 rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Car className="w-4 h-4 text-purple-500" /> Vehicle & Driver
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Vehicle Type</Label>
          {isEditable ? (
            <Select 
              value={data.car_type || ''} 
              onValueChange={(val) => onChange('car_type', val)}
            >
              <SelectTrigger className={errors.car_type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select Vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sedan">Sedan</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="Innova Crysta">Innova Crysta</SelectItem>
                <SelectItem value="Ertiga">Ertiga</SelectItem>
                <SelectItem value="Kia Carens">Kia Carens</SelectItem>
                <SelectItem value="Tempo Traveller">Tempo Traveller</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2">{data.car_type}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Vehicle Number</Label>
          {isEditable ? (
             <>
              <Input 
                value={data.driver_car_no || ''} 
                onChange={(e) => onChange('driver_car_no', e.target.value)}
                className={errors.vehicle_number ? "border-red-500" : ""}
                placeholder="e.g. GJ-01-AB-1234"
              />
              {errors.vehicle_number && <p className="text-xs text-red-500">{errors.vehicle_number}</p>}
            </>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2 font-mono bg-slate-50 inline-block px-2 rounded">
              {data.driver_car_no || 'Pending'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Driver Name</Label>
          {isEditable ? (
            <>
              <Input 
                value={data.driver_name || ''} 
                onChange={(e) => onChange('driver_name', e.target.value)}
                className={errors.driver_name ? "border-red-500" : ""}
                placeholder="Driver Name"
              />
              {errors.driver_name && <p className="text-xs text-red-500">{errors.driver_name}</p>}
            </>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2 flex items-center gap-2">
              <UserCheck className="w-3 h-3 text-slate-400" /> {data.driver_name || 'Unassigned'}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Driver Mobile</Label>
          {isEditable ? (
            <>
              <Input 
                value={data.driver_phone || ''} 
                onChange={(e) => onChange('driver_phone', e.target.value)}
                className={errors.driver_mobile ? "border-red-500" : ""}
                placeholder="Driver Mobile"
              />
              {errors.driver_mobile && <p className="text-xs text-red-500">{errors.driver_mobile}</p>}
            </>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2">{data.driver_phone || 'N/A'}</p>
          )}
        </div>
      </div>
    </div>
  );
}