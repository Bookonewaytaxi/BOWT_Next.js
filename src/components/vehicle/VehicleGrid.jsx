import React from 'react';
import VehicleCard from './VehicleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VehicleGrid({ vehicles, loading, error, selectedVehicle, onSelect, prices }) {
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 h-[400px] border border-slate-100">
            <Skeleton className="h-40 w-full rounded-lg mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-6" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="flex justify-between mt-auto pt-4 border-t border-slate-50">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Unable to load vehicles</h3>
        <p className="text-red-700 mb-6">We encountered an issue fetching available vehicles for this route.</p>
        <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => {
        // Map price from route based on vehicle type key
        // Assuming route prices are passed in 'prices' object like { Sedan: 1200, SUV: 1800 }
        const price = prices?.[vehicle.type_key] || 0;
        
        // Skip if no price available for this vehicle type on this route
        if (!price) return null;

        return (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            price={price}
            selected={selectedVehicle?.id === vehicle.id}
            onSelect={(v) => onSelect({ ...v, price })} // Include price in selection
          />
        );
      })}
    </div>
  );
}