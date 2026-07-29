export const generateSlug = (fromCity, toCity) => {
  return `${fromCity.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}-to-${toCity.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}-taxi`.replace(/-+/g, '-');
};

export const generateMetaTitle = (fromCity, toCity, price) => {
  return `Book ${fromCity} to ${toCity} Taxi | One Way Cab Fare ₹${price}`;
};

export const generateMetaDescription = (fromCity, toCity, distance, price) => {
  return `Best one way taxi from ${fromCity} to ${toCity}. Fixed fare ₹${price}. Distance ${distance}km. Verified drivers, clean cars & 24/7 service. Book your cab now!`;
};

export const generateH1Heading = (fromCity, toCity) => {
  return `One Way Taxi Service from ${fromCity} to ${toCity}`;
};

export const generateDefaultContent = (fromCity, toCity, distance, price) => {
  return `
    <h2>Reliable ${fromCity} to ${toCity} Taxi Service</h2>
    <p>Traveling from <strong>${fromCity} to ${toCity}</strong>? We provide the best one-way cab service with well-maintained cars and professional drivers. Our service is available 24/7 for your convenience.</p>
    
    <h3>Why Book With Us?</h3>
    <ul>
      <li><strong>Affordable Fares:</strong> Starting at just ₹${price}</li>
      <li><strong>Safety First:</strong> GPS tracked cars and verified drivers</li>
      <li><strong>Clean Cars:</strong> Deep cleaned before every trip</li>
      <li><strong>On-Time Service:</strong> Punctual pickups and drops</li>
    </ul>

    <h3>Distance and Time</h3>
    <p>The distance from ${fromCity} to ${toCity} is approximately <strong>${distance} km</strong>. It typically takes a comfortable drive to cover this distance.</p>
    
    <h3>Booking Process</h3>
    <p>Booking is easy! Select your car, enter your details, and confirm. No hidden charges.</p>
  `;
};

export const generateDefaultFaqs = (fromCity, toCity, price) => {
  return [
    { question: `What is the taxi fare from ${fromCity} to ${toCity}?`, answer: `The one-way taxi fare starts at ₹${price}.` },
    { question: `Is it safe to travel at night?`, answer: `Yes, our drivers are verified and we track all rides.` },
    { question: `How do I book?`, answer: `You can book online through our website or call us.` },
    { question: `Are toll taxes included?`, answer: `Toll taxes and parking are usually extra and paid as per actuals.` }
  ];
};

export const generateSeoForRoute = (route) => {
  if (!route) return null;
  const { from_city, to_city, distance_km, sedan_price } = route;
  
  return {
    slug: generateSlug(from_city, to_city),
    meta_title: generateMetaTitle(from_city, to_city, sedan_price),
    meta_description: generateMetaDescription(from_city, to_city, distance_km, sedan_price),
    h1_heading: generateH1Heading(from_city, to_city),
    focus_keyword: `${from_city} to ${to_city} taxi`,
    secondary_keywords: [`${from_city} to ${to_city} cab`, `taxi from ${from_city} to ${to_city}`, `one way cab ${from_city} to ${to_city}`],
    content: generateDefaultContent(from_city, to_city, distance_km, sedan_price),
    faqs: generateDefaultFaqs(from_city, to_city, sedan_price),
    internal_links: [] // Populated dynamically
  };
};
