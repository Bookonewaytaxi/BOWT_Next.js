import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import VehiclePricingSection from './VehiclePricingSection';

export default function RouteFormFields({ formData, handleChange, handleBlur, errors, touched }) {
  return (
    <div className="space-y-8">
      {/* City & Distance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="from_city">From City <span className="text-red-500">*</span></Label>
          <Input
            id="from_city"
            value={formData.from_city}
            onChange={(e) => handleChange('from_city', e.target.value)}
            onBlur={() => handleBlur('from_city')}
            placeholder="e.g. Mumbai"
            className={cn(errors.from_city && touched.from_city ? "border-red-500" : "")}
          />
          {touched.from_city && errors.from_city && (
            <p className="text-xs text-red-500">{errors.from_city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="to_city">To City <span className="text-red-500">*</span></Label>
          <Input
            id="to_city"
            value={formData.to_city}
            onChange={(e) => handleChange('to_city', e.target.value)}
            onBlur={() => handleBlur('to_city')}
            placeholder="e.g. Pune"
            className={cn(errors.to_city && touched.to_city ? "border-red-500" : "")}
          />
          {touched.to_city && errors.to_city && (
            <p className="text-xs text-red-500">{errors.to_city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="distance_km">Distance (KM)</Label>
          <Input
            id="distance_km"
            type="number"
            min="0"
            max="5000"
            value={formData.distance_km}
            onChange={(e) => handleChange('distance_km', e.target.value)}
            onBlur={() => handleBlur('distance_km')}
            placeholder="e.g. 150"
            className={cn(errors.distance_km && touched.distance_km ? "border-red-500" : "")}
          />
          {touched.distance_km && errors.distance_km && (
            <p className="text-xs text-red-500">{errors.distance_km}</p>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Pricing Section */}
      <VehiclePricingSection 
        formData={formData}
        handleChange={handleChange}
        handleBlur={handleBlur}
        errors={errors}
        touched={touched}
      />

      <div className="h-px bg-slate-800" />

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder="Optional route details..."
          rows={4}
          maxLength={500}
          className={cn(errors.description && touched.description ? "border-red-500" : "")}
        />
        <div className="flex justify-between">
            {touched.description && errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-slate-500 ml-auto">{formData.description?.length || 0}/500</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Active Status</Label>
          <p className="text-xs text-slate-500">Enable to show on public site</p>
        </div>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange('is_active', checked)}
        />
      </div>
    </div>
  );
}