import React from 'react';
import { VEHICLE_TYPES_CONSTANTS } from '@/lib/constants';

const PRICE_FIELD_BY_TYPE_KEY = {
  sedan: 'sedan_price',
  suv6: 'suv_6_price',
  suv7: 'suv_7_price',
  crysta: 'premium_suv_price',
};

// Average intercity travel speed assumption (mixed highway + city driving,
// India context) — used ONLY to compute a labeled *estimate* from real
// distance data. Never presented as a guaranteed/verified time.
const AVG_SPEED_KMPH = 50;

function estimateTravelTime(distanceKm) {
  if (!distanceKm) return null;
  const totalHours = distanceKm / AVG_SPEED_KMPH;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  if (hours === 0) return `~${minutes} min`;
  return minutes > 0 ? `~${hours} hr ${minutes} min` : `~${hours} hr`;
}

export default function RouteInfoSection({ route }) {
  if (!route?.distance_km) return null;

  const availableVehicles = VEHICLE_TYPES_CONSTANTS.filter((vehicle) => {
    const priceField = PRICE_FIELD_BY_TYPE_KEY[vehicle.type_key];
    return priceField && Number(route[priceField]) > 0;
  });

  const travelTime = estimateTravelTime(route.distance_km);

  const infoRows = [
    { label: 'Distance', value: `${route.distance_km} km` },
    travelTime && {
      label: 'Estimated Travel Time',
      value: travelTime,
      note: `(estimate, based on ${AVG_SPEED_KMPH} km/h average — actual time varies with traffic and stops)`,
    },
    { label: 'Trip Type', value: 'One Way (No Return Fare)' },
    availableVehicles.length > 0 && {
      label: 'Available Vehicles',
      value: availableVehicles.map((v) => v.name).join(', '),
    },
  ].filter(Boolean);

  return (
    <section id="route-info" aria-labelledby="route-info-heading" className="scroll-mt-24">
      <h2 id="route-info-heading" className="text-2xl font-bold mb-6 text-slate-900">
        Route Information
      </h2>
      <dl className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {infoRows.map((row) => (
          <div key={row.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-4">
            <dt className="text-sm font-semibold text-slate-500 sm:w-56 flex-shrink-0">{row.label}</dt>
            <dd className="text-slate-900 font-medium">
              {row.value}
              {row.note && <span className="block text-xs font-normal text-slate-400 mt-0.5">{row.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
