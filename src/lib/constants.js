export const VEHICLE_TYPES_CONSTANTS = [
  {
    id: 'sedan',
    type_key: 'sedan',
    name: 'Sedan (4+1)',
    description: 'Perfect for small families and budget travelers.',
    capacity: 4,
    // price_per_km removed, now uses fixed price mapping
    image_url: 'https://horizons-cdn.hostinger.com/7a33da7a-1297-48e9-b4e2-a37c6dd7b55b/4d79e5735e2daf1885159bbbab0e75ec.jpg'
  },
  {
    id: 'suv6',
    type_key: 'suv6',
    name: 'SUV (Ertiga)',
    description: 'Spacious & comfortable for groups.',
    capacity: 6,
    image_url: 'https://horizons-cdn.hostinger.com/7a33da7a-1297-48e9-b4e2-a37c6dd7b55b/67e8008f554c92e1f6a80fc91b1bb353.jpg' // Updated URL
  },
  {
    id: 'suv7',
    type_key: 'suv7',
    name: 'SUV (Kia Carens)',
    description: 'Premium comfort for larger families.',
    capacity: 7,
    image_url: 'https://horizons-cdn.hostinger.com/7a33da7a-1297-48e9-b4e2-a37c6dd7b55b/6b1a102d9a94bfc7438829da5f844409.jpg' // Updated URL
  },
  {
    id: 'crysta',
    type_key: 'crysta',
    name: 'Innova Crysta',
    description: 'The ultimate luxury travel experience.',
    capacity: 7,
    image_url: 'https://horizons-cdn.hostinger.com/7a33da7a-1297-48e9-b4e2-a37c6dd7b55b/dcad7d25ec086a77407d428211f5f92e.jpg' // Updated URL
  }
];

export const calculateFare = (distance, pricePerKm) => {
  // Legacy function - might still be used elsewhere but not in core flow
  if (!distance || !pricePerKm) return 0;
  const dist = parseFloat(distance.toString().replace(/[^0-9.]/g, ''));
  return Math.round(dist * pricePerKm);
};