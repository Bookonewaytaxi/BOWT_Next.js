const INDIA_COUNTRY_CODE = '91';

export function normalizeWhatsAppNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `${INDIA_COUNTRY_CODE}${digits}`;
  if (digits.startsWith(INDIA_COUNTRY_CODE) && digits.length === 12) return digits;
  if (digits.length > 10) return digits;
  return '';
}

export function formatWhatsAppPhone(phone) {
  const normalized = normalizeWhatsAppNumber(phone);
  if (!normalized) return '';
  return normalized.length === 12
    ? `+${normalized.slice(0, 2)} ${normalized.slice(2)}`
    : `+${normalized}`;
}

export function openWhatsAppMessage(phone, message) {
  if (typeof window === 'undefined') return false;
  const normalized = normalizeWhatsAppNumber(phone);
  if (!normalized || !message) return false;

  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  return !!popup;
}

function value(value, fallback = 'Not provided') {
  return value === undefined || value === null || String(value).trim() === ''
    ? fallback
    : String(value).trim();
}

function formatDate(date) {
  if (!date) return 'Not provided';
  const raw = String(date);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString('en-IN');
}

function bookingId(booking) {
  return value(booking?.booking_ref_id || booking?.id, 'Not assigned');
}

function route(booking) {
  return `${value(booking?.from_city)} → ${value(booking?.to_city)}`;
}

function locations(booking) {
  return [
    `Pickup: ${value(booking?.pickup_location)}`,
    `Drop: ${value(booking?.drop_location)}`
  ];
}

export function buildCustomerDriverMessage(booking) {
  const lines = [
    `Hello ${value(booking?.name, 'Customer')},`,
    '',
    'Your driver has been assigned for your Book One Way Taxi booking.',
    '',
    `Booking ID: ${bookingId(booking)}`,
    `Route: ${route(booking)}`,
    `Pickup Date: ${formatDate(booking?.pickup_date)}`,
    `Pickup Time: ${value(booking?.pickup_time)}`,
    ...locations(booking),
    `Vehicle: ${value(booking?.driver_details?.car_model || booking?.car_type)}`,
    `Driver Name: ${value(booking?.driver_name)}`,
    `Driver Mobile: ${formatWhatsAppPhone(booking?.driver_phone || booking?.driver_details?.driver_mobile_number)}`,
    `Vehicle Number: ${value(booking?.driver_car_no || booking?.driver_details?.cab_registration_number)}`,
    `Fare: ₹${value(booking?.total_amount, '0')}`,
    '',
    'Please keep this message for your trip.',
    'For BOWT support: +91 75675 75578'
  ];

  return lines.join('\n');
}

export function buildDriverCustomerMessage(booking) {
  const instructions = booking?.driver_details?.special_instructions;
  const passengerCount = booking?.driver_details?.passenger_count;
  const luggageCount = booking?.driver_details?.luggage_count;

  const lines = [
    `Hello ${value(booking?.driver_name, 'Driver')},`,
    '',
    'New trip assigned by Book One Way Taxi.',
    '',
    `Booking ID: ${bookingId(booking)}`,
    `Customer Name: ${value(booking?.name)}`,
    `Customer Mobile: ${formatWhatsAppPhone(booking?.mobile_number)}`,
    `Route: ${route(booking)}`,
    `Pickup Date: ${formatDate(booking?.pickup_date)}`,
    `Pickup Time: ${value(booking?.pickup_time)}`,
    ...locations(booking),
    `Vehicle: ${value(booking?.driver_details?.car_model || booking?.car_type)}`,
    `Vehicle Number: ${value(booking?.driver_car_no || booking?.driver_details?.cab_registration_number)}`,
    `Fare: ₹${value(booking?.total_amount, '0')}`
  ];

  if (passengerCount) lines.push(`Passengers: ${passengerCount}`);
  if (luggageCount) lines.push(`Luggage: ${luggageCount}`);
  if (instructions) lines.push(`Customer Note: ${instructions}`);

  lines.push(
    '',
    'Please contact the customer before pickup and confirm the pickup point.',
    'BOWT support: +91 75675 75578'
  );

  return lines.join('\n');
}

export function buildCustomerBookingMessage(booking) {
  return [
    `Hello ${value(booking?.name, 'Customer')},`,
    '',
    'Regarding your Book One Way Taxi booking:',
    '',
    `Booking ID: ${bookingId(booking)}`,
    `Route: ${route(booking)}`,
    `Pickup Date: ${formatDate(booking?.pickup_date)}`,
    `Pickup Time: ${value(booking?.pickup_time)}`,
    ...locations(booking),
    `Vehicle: ${value(booking?.driver_details?.car_model || booking?.car_type)}`,
    `Fare: ₹${value(booking?.total_amount, '0')}`,
    '',
    'BOWT support: +91 75675 75578'
  ].join('\n');
}

export function buildDriverBookingMessage(booking) {
  return buildDriverCustomerMessage(booking);
}
