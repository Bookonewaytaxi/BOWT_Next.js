import { VEHICLE_TYPES_CONSTANTS } from '@/lib/constants';
import { estimateTravelTimeRange } from './travelTimeEstimate';

const PRICE_FIELD_CANDIDATES = [
  'sedan_price', 'suv_ertiga_price', 'ertiga_price', 'kia_carens_price',
  'carens_price', 'innova_crysta_price', 'crysta_price',
];

const VEHICLE_PRICE_FIELD_BY_TYPE_KEY = {
  sedan: 'sedan_price', suv6: 'suv_ertiga_price', suv7: 'kia_carens_price', crysta: 'innova_crysta_price',
};

function isValidPositiveNumber(value) {
  const num = Number(value);
  return typeof value !== 'boolean' && value !== null && value !== '' && isFinite(num) && num > 0;
}

function getLowestValidPrice(route) {
  const validPrices = PRICE_FIELD_CANDIDATES.map((f) => route[f]).filter(isValidPositiveNumber).map(Number);
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
}

function getAvailableVehicleNames(route) {
  return VEHICLE_TYPES_CONSTANTS
    .filter((v) => {
      const field = VEHICLE_PRICE_FIELD_BY_TYPE_KEY[v.type_key];
      return field && isValidPositiveNumber(route[field]);
    })
    .map((v) => v.name);
}

export function generateFaqsForRoute(route) {
  if (!route || typeof route !== 'object') return [];
  if (!route.from_city || !route.to_city) return [];
  if (route.is_active === false) return [];

  const fromCity = route.from_city;
  const toCity = route.to_city;
  const faqs = [];

  const lowestPrice = getLowestValidPrice(route);
  if (lowestPrice !== null) {
    faqs.push({
      category: 'taxi_fare',
      question: `How much does a taxi from ${fromCity} to ${toCity} cost?`,
      answer: `A one-way taxi from ${fromCity} to ${toCity} starts at ₹${lowestPrice.toLocaleString('en-IN')}. Pricing is fixed and shown upfront before booking.`,
      priority: 100,
    });
  }

  const distanceKm = Number(route.distance_km);
  const hasValidDistance = isFinite(distanceKm) && distanceKm > 0;
  if (hasValidDistance) {
    faqs.push({
      category: 'distance',
      question: `How far is ${fromCity} to ${toCity} by taxi?`,
      answer: `The distance from ${fromCity} to ${toCity} is approximately ${distanceKm} km.`,
      priority: 90,
    });
  }

  if (hasValidDistance) {
    const timeRange = estimateTravelTimeRange(distanceKm);
    if (timeRange) {
      faqs.push({
        category: 'travel_time',
        question: `How long does it take to travel from ${fromCity} to ${toCity}?`,
        answer: `The estimated travel time from ${fromCity} to ${toCity} is ${timeRange}, depending on traffic and road conditions.`,
        priority: 80,
      });
    }
  }

  faqs.push({
    category: 'one_way_availability',
    question: `Is one-way taxi service available from ${fromCity} to ${toCity}?`,
    answer: `Yes, one-way taxi service is available from ${fromCity} to ${toCity}.`,
    priority: 70,
  });

  const vehicleNames = getAvailableVehicleNames(route);
  if (vehicleNames.length > 0) {
    faqs.push({
      category: 'vehicle_types',
      question: `Which vehicle types are available for ${fromCity} to ${toCity}?`,
      answer: `For ${fromCity} to ${toCity}, the following vehicle types are available: ${vehicleNames.join(', ')}.`,
      priority: 60,
    });
  }

  faqs.push({
    category: 'pickup_availability',
    question: `Is doorstep pickup available in ${fromCity}?`,
    answer: `Yes, doorstep pickup is available in ${fromCity} for your trip to ${toCity}.`,
    priority: 50,
  });

  faqs.push({
    category: 'book_online',
    question: `Can I book my ${fromCity} to ${toCity} taxi online?`,
    answer: `Yes, you can book your ${fromCity} to ${toCity} taxi directly online.`,
    priority: 40,
  });

  faqs.push({
    category: 'fixed_fare',
    question: `Is the fare fixed for ${fromCity} to ${toCity}?`,
    answer: `Yes, the fare for ${fromCity} to ${toCity} is fixed and shown to you before you confirm your booking.`,
    priority: 30,
  });

  return faqs;
}
