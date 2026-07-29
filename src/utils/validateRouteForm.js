export const validateRouteForm = (data) => {
  const errors = {};
  let isValid = true;

  if (!data.from_city || data.from_city.trim().length < 3) {
    errors.from_city = 'From City is required and must be at least 3 characters.';
    isValid = false;
  }

  if (!data.to_city || data.to_city.trim().length < 3) {
    errors.to_city = 'To City is required and must be at least 3 characters.';
    isValid = false;
  }

  if (!data.distance_km || Number(data.distance_km) < 1) {
    errors.distance_km = 'Distance must be at least 1 KM.';
    isValid = false;
  }

  const priceFields = [
    { key: 'sedan_price_per_km', label: 'Sedan Price' },
    { key: 'suv_6_price_per_km', label: 'SUV (6+1) Price' },
    { key: 'suv_7_price_per_km', label: 'SUV (7+1) Price' },
    { key: 'crysta_price_per_km', label: 'Crysta Price' }
  ];

  priceFields.forEach(({ key, label }) => {
    if (!data[key] || Number(data[key]) < 1) {
      errors[key] = `${label} per KM must be at least ₹1.`;
      isValid = false;
    }
  });

  return { isValid, errors };
};