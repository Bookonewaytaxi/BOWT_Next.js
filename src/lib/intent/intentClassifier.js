const PRICE_FIELD_CANDIDATES = [
  'sedan_price', 'suv_ertiga_price', 'ertiga_price', 'kia_carens_price',
  'carens_price', 'innova_crysta_price', 'crysta_price',
];

function isValidPositiveNumber(value) {
  const num = Number(value);
  return typeof value !== 'boolean' && value !== null && value !== '' && isFinite(num) && num > 0;
}

function hasValidPrice(route) {
  return PRICE_FIELD_CANDIDATES.some((field) => isValidPositiveNumber(route[field]));
}

function hasValidDistance(route) {
  const distanceKm = Number(route?.distance_km);
  return isFinite(distanceKm) && distanceKm > 0;
}

export function evaluateIntentSignals(route) {
  if (!route || typeof route !== 'object') {
    return { price_related: false, distance_related: false, route_booking: false };
  }
  return {
    price_related: hasValidPrice(route),
    distance_related: hasValidDistance(route),
    route_booking: Boolean(route.from_city) && Boolean(route.to_city) && route.is_active !== false,
  };
}

export function classifyRouteIntent(route) {
  const signals = evaluateIntentSignals(route);
  if (!signals.route_booking) return null;
  return {
    primary_intent: 'route_booking',
    confidence_score: 1.0,
    intent_source: 'rule_based',
  };
}
