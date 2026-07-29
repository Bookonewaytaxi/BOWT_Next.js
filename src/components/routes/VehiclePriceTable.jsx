import React from 'react';
import { Car, Users, CheckCircle } from 'lucide-react';

export default function VehiclePriceTable({ route }) {
  if (!route) {
    console.warn('[VehiclePriceTable] Missing route data');
    return null;
  }

  console.log('[VehiclePriceTable] Rendering prices for:', route.slug);

  // Helper to safely parse price
  const getPrice = (val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0 ? num : null;
  };

  // Map route data to table rows
  // Prioritize the normalized fields from RouteService, fallback to raw fields
  const vehicles = [
    {
      type: 'Sedan (4+1)',
      seating: '4 Passengers',
      examples: 'Dzire, Etios',
      price: getPrice(route.sedan_price),
      perKm: route.sedan_price_per_km,
      icon: Car
    },
    {
      type: 'SUV (6+1)',
      seating: '6 Passengers',
      examples: 'Ertiga, XL6',
      price: getPrice(route.suv_6_price), // Uses normalized field
      perKm: route.suv_6_price_per_km,
      icon: Users
    },
    {
      type: 'SUV (7+1)',
      seating: '7 Passengers',
      examples: 'Kia Carens',
      price: getPrice(route.suv_7_price), // Uses normalized field
      perKm: route.suv_7_price_per_km,
      icon: Users
    },
    {
      type: 'Premium SUV',
      seating: '7 Passengers',
      examples: 'Innova Crysta',
      price: getPrice(route.premium_suv_price), // Uses normalized field
      perKm: route.crysta_price_per_km,
      icon: CheckCircle
    }
  ];

  return (
    <div className="vehicle-price-table-section my-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Vehicle Options & Pricing</h2>
      <div className="table-wrapper bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="vehicle-table w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="w-[35%]">Vehicle Type</th>
                <th className="w-[25%]">Capacity</th>
                <th className="w-[20%] hidden sm:table-cell">Models</th>
                <th className="w-[20%]">Price</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle, idx) => (
                <tr key={idx} className="group transition-colors hover:bg-slate-50">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 group-hover:bg-white group-hover:text-[#667eea] group-hover:shadow-sm rounded-lg text-slate-600 transition-all hidden xs:block">
                        <vehicle.icon className="w-5 h-5 icon" />
                      </div>
                      <span className="font-semibold text-slate-900">{vehicle.type}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-slate-600 font-medium text-sm">{vehicle.seating}</div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <div className="text-slate-500 text-sm">{vehicle.examples}</div>
                  </td>
                  <td>
                    {vehicle.price ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-slate-900">₹{vehicle.price.toLocaleString()}</span>
                        {vehicle.perKm && (
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                            ₹{vehicle.perKm}/km extra
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-slate-400 italic">On Request</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
