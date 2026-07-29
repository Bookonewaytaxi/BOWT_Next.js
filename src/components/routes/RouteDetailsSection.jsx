import React from 'react';
import { Car, Users, Briefcase } from 'lucide-react';
import { calculateStartingPrice } from '@/services/RouteService';

export default function RouteDetailsSection({ route }) {
  if (!route) return null;

  const startingPrice = calculateStartingPrice(route);
  
  // Define vehicle data based on route prices
  const vehicles = [
    {
      name: "Sedan",
      models: "Dzire, Etios",
      price: route.sedan_price,
      capacity: "4 Pax",
      luggage: "2 Bags"
    },
    {
      name: "SUV",
      models: "Ertiga",
      price: route.ertiga_price || route.suv_ertiga_price,
      capacity: "6 Pax",
      luggage: "3 Bags"
    },
    {
      name: "SUV Plus",
      models: "Kia Carens",
      price: route.carens_price || route.kia_carens_price,
      capacity: "6 Pax",
      luggage: "4 Bags"
    },
    {
      name: "Premium",
      models: "Innova Crysta",
      price: route.innova_crysta_price || route.crysta_price,
      capacity: "7 Pax",
      luggage: "5 Bags"
    }
  ].filter(v => v.price && Number(v.price) > 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 p-6 border-b border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {route.from_city} to {route.to_city} Taxi
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
           <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200">
             Distance: <strong>{route.distance_km || route.distance || '0'} km</strong>
           </span>
           <span className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 text-amber-700">
             Starting from: <strong>₹{startingPrice.toLocaleString()}</strong>
           </span>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Available Vehicle Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
              <div>
                <h3 className="font-bold text-slate-900">{v.name}</h3>
                <p className="text-xs text-slate-500">{v.models}</p>
                <div className="flex gap-3 mt-2 text-xs text-slate-400">
                   <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {v.capacity}</span>
                   <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/> {v.luggage}</span>
                </div>
              </div>
              <div className="text-right">
                 <div className="text-lg font-black text-slate-900">₹{Number(v.price).toLocaleString()}</div>
                 <div className="text-xs text-green-600 font-medium">All Inclusive</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}