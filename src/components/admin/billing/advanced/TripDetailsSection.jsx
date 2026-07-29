import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, Clock, Navigation } from 'lucide-react';

export default function TripDetailsSection({ 
  data, 
  onChange, 
  isEditable,
  errors = {}
}) {
  return (
    <div className="mb-5 p-4 border border-slate-200 rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-green-500" /> Trip Details
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">From City</Label>
          {isEditable ? (
            <Input 
              value={data.from_city || ''} 
              onChange={(e) => onChange('from_city', e.target.value)}
              placeholder="From City"
              className={errors.route ? "border-red-500" : ""}
            />
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2">{data.from_city}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">To City</Label>
          {isEditable ? (
            <Input 
              value={data.to_city || ''} 
              onChange={(e) => onChange('to_city', e.target.value)}
              placeholder="To City"
              className={errors.route ? "border-red-500" : ""}
            />
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2">{data.to_city}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Pickup Address</Label>
          {isEditable ? (
            <>
              <Input 
                value={data.pickup_location || ''} 
                onChange={(e) => onChange('pickup_location', e.target.value)}
                className={errors.pickup_location ? "border-red-500" : ""}
                placeholder="Pickup Address"
              />
              {errors.pickup_location && <p className="text-xs text-red-500">{errors.pickup_location}</p>}
            </>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2 flex items-start gap-2">
              <MapPin className="w-3 h-3 text-green-500 mt-1" /> {data.pickup_location || 'N/A'}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Drop Address</Label>
          {isEditable ? (
             <>
              <Input 
                value={data.drop_location || ''} 
                onChange={(e) => onChange('drop_location', e.target.value)}
                className={errors.drop_location ? "border-red-500" : ""}
                placeholder="Drop Address"
              />
              {errors.drop_location && <p className="text-xs text-red-500">{errors.drop_location}</p>}
            </>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2 flex items-start gap-2">
              <MapPin className="w-3 h-3 text-red-500 mt-1" /> {data.drop_location || 'N/A'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Trip Type</Label>
          {isEditable ? (
            <Select 
              value={data.trip_type || 'One Way'} 
              onValueChange={(val) => onChange('trip_type', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="One Way">One Way</SelectItem>
                <SelectItem value="Round Trip">Round Trip</SelectItem>
                <SelectItem value="Airport Transfer">Airport Transfer</SelectItem>
                <SelectItem value="Local Rental">Local Rental</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2">{data.trip_type}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Pickup Date</Label>
          {isEditable ? (
            <Input 
              type="date"
              value={data.pickup_date ? new Date(data.pickup_date).toISOString().split('T')[0] : ''} 
              onChange={(e) => onChange('pickup_date', e.target.value)}
              className={errors.pickup_date ? "border-red-500" : ""}
            />
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-slate-400" /> {data.pickup_date}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase">Pickup Time</Label>
          {isEditable ? (
            <Input 
              type="time"
              value={data.pickup_time || ''} 
              onChange={(e) => onChange('pickup_time', e.target.value)}
            />
          ) : (
            <p className="font-medium text-slate-900 text-sm py-2 flex items-center gap-2">
              <Clock className="w-3 h-3 text-slate-400" /> {data.pickup_time}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}