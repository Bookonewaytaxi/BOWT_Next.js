export const VEHICLE_TYPES_CONSTANTS = [
  {
    id: 'sedan',
    type_key: 'sedan',
    name: 'Sedan (4+1)',
    description: 'Perfect for small families and budget travelers.',
    capacity: 4,
    // price_per_km removed, now uses fixed price mapping
    image_url: '/images/vehicles/sedan-dzire.jpg'
  },
  {
    id: 'suv6',
    type_key: 'suv6',
    name: 'SUV (Ertiga)',
    description: 'Spacious & comfortable for groups.',
    capacity: 6,
    image_url: '/images/vehicles/suv6-ertiga.jpg'
  },
  {
    id: 'suv7',
    type_key: 'suv7',
    name: 'SUV (Kia Carens)',
    description: 'Premium comfort for larger families.',
    capacity: 7,
    image_url: '/images/vehicles/suv7-kia-carens.jpg'
  },
  {
    id: 'crysta',
    type_key: 'crysta',
    name: 'Innova Crysta',
    description: 'The ultimate luxury travel experience.',
    capacity: 7,
    image_url: '/images/vehicles/crysta-innova.jpg'
  }
];

export const calculateFare = (distance, pricePerKm) => {
  // Legacy function - might still be used elsewhere but not in core flow
  if (!distance || !pricePerKm) return 0;
  const dist = parseFloat(distance.toString().replace(/[^0-9.]/g, ''));
  return Math.round(dist * pricePerKm);
};
