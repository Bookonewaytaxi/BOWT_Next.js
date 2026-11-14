const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export const generateSlug = (fromCity, toCity) =>
  `${clean(fromCity).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${clean(toCity).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`.replace(/-+/g, '-').replace(/^-|-$/g, '');

export const generateMetaTitle = (fromCity, toCity) =>
  ` ${clean(fromCity)} to ${clean(toCity)} One Way Taxi | Book One Way Taxi`.trim().slice(0, 60);

export const generateMetaDescription = (fromCity, toCity, distance, price) => {
  const route = `${clean(fromCity)} to ${clean(toCity)} one way taxi.`;
  const phone = 'Call +91 75675 75578 for booking.';
  const inclusions = 'Toll, permit, border tax and driver allowance included; parking extra.';
  const fare = Number(price) > 0 ? ` Fare from ₹${Number(price).toLocaleString('en-IN')}.` : '';
  const distanceText = Number(distance) > 0 ? ` Approx. ${Number(distance)} km.` : '';
  let description = `${route} ${fare}${distanceText} ${phone} ${inclusions}`.replace(/\s+/g, ' ').trim();
  if (description.length > 160) description = `${route} ${phone} ${inclusions}`.replace(/\s+/g, ' ').trim();
  if (description.length > 160) description = `${route} ${phone}`.replace(/\s+/g, ' ').trim();
  if (description.length < 140) description = `${description} Book your cab today.`;
  if (description.length < 140) description = `${description} Check the fare before booking.`;
  return description.slice(0, 160);
};

export const generateH1Heading = (fromCity, toCity) =>
  `One Way Taxi from ${clean(fromCity)} to ${clean(toCity)}`;

export const generateDefaultContent = (fromCity, toCity, distance, price) => {
  const from = clean(fromCity), to = clean(toCity);
  const km = Number(distance) > 0 ? `${Number(distance)} km` : 'route-specific distance';
  const fare = Number(price) > 0 ? `₹${Number(price).toLocaleString('en-IN')}` : 'the fare shown for your selected vehicle';
  return `<h2>${from} to ${to} One Way Taxi Service</h2>
<p>Book a one-way taxi from <strong>${from} to ${to}</strong> with Book One Way Taxi. This route page helps you review the available vehicle options, route distance and the fixed fare recorded for the selected route. The listed route distance is ${km}; check the live route details before confirming your trip.</p>
<h2>Taxi Fare and Vehicle Options</h2>
<p>The displayed starting fare is ${fare}, subject to the vehicle selected and the current route fare saved in our booking system. Compare the available Sedan, Ertiga, Carens and Innova Crysta options where available. The booking page displays the applicable fare before you confirm.</p>
<h2>What Is Included in the One-Way Fare?</h2>
<p>Our stated one-way fare includes toll, border tax, permit and driver allowance. Parking charges are extra. Please review the fare details shown for this route and contact our team if you need clarification before booking.</p>
<h2>How to Book a Cab</h2>
<p>Select your route and available vehicle, enter the passenger and pickup details, review the fare, and submit your booking request. For assistance with availability, call <a href="tel:+917567575578">+91 75675 75578</a>.</p>
<h2>Plan Your Journey</h2>
<p>Pickup timing, exact pickup and drop locations, and vehicle availability should be confirmed during booking. Use the route and fare information on this page as the starting point for planning your one-way journey.</p>`;
};

export const generateDefaultFaqs = (fromCity, toCity, price) => [
  { category: 'fare', question: `What is the one-way taxi fare from ${clean(fromCity)} to ${clean(toCity)}?`, answer: Number(price) > 0 ? `The starting fare currently shown for this route is ₹${Number(price).toLocaleString('en-IN')}. The final displayed fare depends on the vehicle selected.` : 'Please select this route and a vehicle on the booking page to view the current fare.' },
  { category: 'included-charges', question: 'Are toll, permit, border tax and driver allowance included?', answer: 'Yes. Toll, border tax, permit and driver allowance are included in the stated one-way route fare. Parking charges are extra.' },
  { category: 'booking', question: 'How can I book this one-way taxi?', answer: 'Select the route and available vehicle on Book One Way Taxi, enter your trip details and review the fare before submitting your booking. You can also call +91 75675 75578 for assistance.' }
];

export const generateSeoForRoute = (route) => {
  if (!route) return null;
  const { from_city, to_city, distance_km, sedan_price } = route;
  return {
    meta_title: generateMetaTitle(from_city, to_city),
    meta_description: generateMetaDescription(from_city, to_city, distance_km, sedan_price),
    h1_heading: generateH1Heading(from_city, to_city),
    focus_keyword: `${from_city} to ${to_city} one way taxi`,
    secondary_keywords: [`${from_city} to ${to_city} taxi`, `${from_city} to ${to_city} cab`, `one way cab from ${from_city}`],
    long_form_content: generateDefaultContent(from_city, to_city, distance_km, sedan_price),
    faq_section: generateDefaultFaqs(from_city, to_city, sedan_price)
  };
};
