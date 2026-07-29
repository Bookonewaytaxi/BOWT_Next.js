export const generateSEOTitle = (fromCity, toCity, startingPrice) => {
  const price = startingPrice ? ` @ ₹${startingPrice}` : '';
  const title = `${fromCity} to ${toCity} Taxi | One Way Cab${price}`;
  // Ensure max 60 chars
  return title.length > 60 ? title.substring(0, 57) + '...' : title;
};

export const generateMetaDescription = (fromCity, toCity) => {
  return `Book ${fromCity} to ${toCity} one way taxi with fixed pricing, no hidden charges, professional drivers and 24/7 support.`;
};

export const generateKeywords = (fromCity, toCity, startingPrice) => {
  const from = fromCity.toLowerCase().trim();
  const to = toCity.toLowerCase().trim();
  
  const routeKeywords = [
    `${from} to ${to} taxi`,
    `${from} to ${to} cab`,
    `taxi from ${from} to ${to}`,
    `cab from ${from} to ${to}`,
    `${from} to ${to} car rental`,
    `${from} to ${to} one way taxi`
  ];

  const cityKeywords = [
    `${from} taxi service`,
    `${to} cab booking`,
    `taxi service in ${from}`,
    `cab in ${to}`,
    `outstation taxi ${from}`
  ];

  const serviceKeywords = [
    `one way taxi`,
    `intercity cab`,
    `outstation cab`,
    `airport taxi`
  ];

  const priceKeywords = [
    `cheap taxi ${from} to ${to}`,
    `lowest fare ${from} to ${to}`,
    `taxi fare ${from} to ${to}`
  ];

  // Combine and deduplicate
  const allKeywords = [
    ...routeKeywords,
    ...cityKeywords,
    ...serviceKeywords,
    ...priceKeywords
  ];

  return [...new Set(allKeywords)].slice(0, 20); // Return top 20 to ensure minimum 15
};

export const generateSEOContent = (fromCity, toCity, km, startingPrice) => {
  return `
    <h2>Reliable ${fromCity} to ${toCity} Taxi Service</h2>
    <p>Traveling from <strong>${fromCity} to ${toCity}</strong>? We provide the best one-way cab service with well-maintained cars and professional drivers. Our service is available 24/7 for your convenience.</p>
    
    <h3>Why Book With Us?</h3>
    <ul>
      <li><strong>Affordable Fares:</strong> Starting at just ₹${startingPrice}</li>
      <li><strong>Safety First:</strong> GPS tracked cars and verified drivers</li>
      <li><strong>Clean Cars:</strong> Deep cleaned before every trip</li>
      <li><strong>On-Time Service:</strong> Punctual pickups and drops</li>
    </ul>

    <h3>Distance and Time</h3>
    <p>The distance from ${fromCity} to ${toCity} is approximately <strong>${km} km</strong>. It typically takes a comfortable drive to cover this distance.</p>
    
    <h3>Booking Process</h3>
    <p>Booking is easy! Select your car, enter your details, and confirm. No hidden charges.</p>
  `;
};