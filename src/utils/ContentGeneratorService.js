// Utility to generate comprehensive route content and validate keyword usage
import { generateRouteContentHindi, validateKeywordUsageHindi } from './ContentGeneratorServiceHindi';

export const generateRouteContent = (route, keywords = [], language = 'hindi') => {
  if (language === 'english') {
    return generateRouteContentEnglish(route, keywords);
  }
  return generateRouteContentHindi(route, keywords);
};

export const validateKeywordUsage = (content, keywords = [], language = 'hindi') => {
  if (language === 'english') {
    return validateKeywordUsageEnglish(content, keywords);
  }
  return validateKeywordUsageHindi(content, keywords);
};

const generateRouteContentEnglish = (route, keywords = []) => {
  const {
    from_city,
    to_city,
    distance_km,
    sedan_price,
    ertiga_price,
    carens_price,
    innova_crysta_price
  } = route;

  const distance = distance_km || '0';
  const duration = calculateDuration(distance);
  const basePrice = sedan_price || 0;

  const sections = [
    generateOverviewSection(from_city, to_city, distance, duration, basePrice),
    generatePickupCitySection(from_city),
    generateDropCitySection(to_city),
    generateDistanceSection(from_city, to_city, distance, duration),
    generateFareSection(from_city, to_city, route),
    generateVehicleSection(from_city, to_city),
    generateWhyChooseUsSection(from_city, to_city),
    generateBenefitsSection(from_city, to_city),
    generateDriverSafetySection(),
    generateFAQs(from_city, to_city, distance, duration, basePrice),
    generateCTA(from_city, to_city, basePrice)
  ];

  return sections.join('\n\n');
};

const calculateDuration = (km) => {
  const hours = Math.ceil(Number(km) / 50); // Assuming avg speed 50km/h
  return `${hours} hours`;
};

const generateOverviewSection = (from, to, dist, time, price) => {
  return `
    <section id="overview">
      <h2>${from} to ${to} Taxi Service: Comfortable One Way & Round Trip Cabs</h2>
      <p>Are you looking for a reliable <strong>${from} to ${to} taxi</strong> service? Whether you are planning a business trip, a family vacation, or a sudden visit, booking a cab is the most convenient option. The distance from <strong>${from} to ${to}</strong> is approximately <strong>${dist} km</strong>, and it takes about <strong>${time}</strong> to cover this journey by road. We offer the best one-way cab services with transparent pricing starting at just <strong>₹${price}</strong>.</p>
      <p>Our fleet includes well-maintained Sedans, SUVs, and Premium cars like Innova Crysta, ensuring a smooth ride. Unlike shared cabs or buses, a private <strong>taxi from ${from} to ${to}</strong> gives you the freedom to stop at your convenience, enjoy the scenic route, and travel in privacy. With our 24/7 customer support and verified drivers, your safety and comfort are our top priorities.</p>
    </section>
  `;
};

const generatePickupCitySection = (city) => {
  return `
    <section id="about-pickup">
      <h3>About ${city}</h3>
      <p>${city} is a vibrant city known for its rich culture, bustling markets, and historical significance. As a major hub, it connects to various important destinations across the state. Whether you are a local resident or a tourist, starting your journey from ${city} is convenient with our doorstep pickup service. Avoid the hassle of public transport and let our professional drivers navigate the city traffic while you relax.</p>
    </section>
  `;
};

const generateDropCitySection = (city) => {
  return `
    <section id="about-drop">
      <h3>About ${city}</h3>
      <p>Arriving in ${city} is always an exciting experience. Known for its unique attractions and welcoming atmosphere, ${city} draws travelers from all over. Whether you are visiting for work or leisure, reaching your destination in comfort is essential. Our cab service ensures you are dropped off exactly where you need to be, be it a hotel, office, or residence in ${city}.</p>
    </section>
  `;
};

const generateDistanceSection = (from, to, dist, time) => {
  return `
    <section id="distance-time">
      <h3>${from} to ${to} Distance and Travel Time</h3>
      <p>The road distance between <strong>${from} and ${to}</strong> is roughly <strong>${dist} kilometers</strong>. Under normal traffic conditions, this drive takes approximately <strong>${time}</strong>. The route is scenic and well-connected, making it a pleasant drive. Our drivers are well-versed with the best routes to ensure you reach your destination on time, avoiding unnecessary congestion where possible.</p>
      <p>We recommend starting early to enjoy a stress-free journey and reach ${to} with plenty of time to spare.</p>
    </section>
  `;
};

const generateFareSection = (from, to, prices) => {
  return `
    <section id="taxi-fare">
      <h3>${from} to ${to} Taxi Fare: Affordable & Transparent Pricing</h3>
      <p>We believe in transparent billing with no hidden charges. Below is our fixed fare chart for one-way drops:</p>
      <table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left;">Vehicle Type</th>
            <th style="padding: 10px; text-align: left;">One Way Price</th>
            <th style="padding: 10px; text-align: left;">Seating Capacity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px;">Sedan (Dzire/Etios)</td>
            <td style="padding: 10px;">₹${prices.sedan_price}</td>
            <td style="padding: 10px;">4 Passengers</td>
          </tr>
          <tr>
            <td style="padding: 10px;">SUV (Ertiga)</td>
            <td style="padding: 10px;">₹${prices.ertiga_price}</td>
            <td style="padding: 10px;">6 Passengers</td>
          </tr>
          <tr>
            <td style="padding: 10px;">SUV (Kia Carens)</td>
            <td style="padding: 10px;">₹${prices.carens_price}</td>
            <td style="padding: 10px;">6 Passengers</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Premium SUV (Innova Crysta)</td>
            <td style="padding: 10px;">₹${prices.innova_crysta_price}</td>
            <td style="padding: 10px;">6/7 Passengers</td>
          </tr>
        </tbody>
      </table>
      <p><em>Note: Toll taxes, parking fees, and state entry taxes (if applicable) are excluded from the base fare and are payable directly as per actuals.</em></p>
    </section>
  `;
};

const generateVehicleSection = (from, to) => {
  return `
    <section id="vehicles">
      <h3>Available Cab Options for ${from} to ${to}</h3>
      <p>We offer a diverse fleet to suit every travel need and budget:</p>
      <ul>
        <li><strong>Sedan:</strong> Ideal for small families or couples (up to 4 pax). Models include Swift Dzire and Toyota Etios. Compact yet comfortable for highway drives.</li>
        <li><strong>SUV (6+1):</strong> Perfect for larger groups or families with extra luggage. Maruti Suzuki Ertiga provides ample legroom and boot space.</li>
        <li><strong>Premium SUV:</strong> For those who prefer luxury, the Toyota Innova Crysta offers superior comfort, captain seats, and a powerful engine for a smooth ride on the ${from} to ${to} highway.</li>
      </ul>
    </section>
  `;
};

const generateWhyChooseUsSection = (from, to) => {
  return `
    <section id="why-choose-us">
      <h3>Why Choose Us for ${from} to ${to} Cab Booking?</h3>
      <p>Traveling should be enjoyable, not stressful. Here is why thousands of customers trust us for their <strong>${from} to ${to} taxi</strong> needs:</p>
      <ul>
        <li><strong>Door-to-Door Service:</strong> We pick you up from your home in ${from} and drop you at your exact location in ${to}.</li>
        <li><strong>On-Time Pickups:</strong> We value your time. Our drivers arrive 15 minutes before the scheduled time.</li>
        <li><strong>Clean & Sanitized Cars:</strong> Hygiene is our priority. All vehicles are deeply cleaned before every trip.</li>
        <li><strong>Expert Drivers:</strong> Our chauffeurs are experienced, polite, and knowledgeable about the route.</li>
        <li><strong>24/7 Support:</strong> Our customer support team is available round the clock to assist you with bookings or queries.</li>
      </ul>
    </section>
  `;
};

const generateBenefitsSection = (from, to) => {
  return `
    <section id="benefits">
      <h3>Benefits of Booking a One Way Taxi</h3>
      <p>Booking a one-way cab from <strong>${from} to ${to}</strong> is often more economical than a round trip if you do not plan to return immediately. You pay only for the distance you travel one way. This is perfect for:</p>
      <ul>
        <li>Travelers catching a flight or train from ${to}.</li>
        <li>Students moving to universities.</li>
        <li>Families shifting base or visiting relatives for an extended stay.</li>
        <li>Business travelers with one-way commitments.</li>
      </ul>
      <p>Why pay for a return trip when you don't need it? Save money with our dedicated one-way service.</p>
    </section>
  `;
};

const generateDriverSafetySection = () => {
  return `
    <section id="safety">
      <h3>Driver Expertise & Safety Measures</h3>
      <p>Your safety is non-negotiable. We implement strict safety protocols for every ride:</p>
      <ul>
        <li><strong>Background Checks:</strong> All drivers undergo police verification and background checks.</li>
        <li><strong>GPS Tracking:</strong> Our cars are equipped with GPS for real-time tracking.</li>
        <li><strong>Emergency Support:</strong> We have a dedicated helpline for emergencies during the trip.</li>
        <li><strong>Driving Standards:</strong> Drivers are trained to follow traffic rules strictly and avoid overspeeding.</li>
      </ul>
    </section>
  `;
};

const generateFAQs = (from, to, dist, time, price) => {
  return `
    <section id="faqs">
      <h3>Frequently Asked Questions (FAQs)</h3>
      <div class="faq-item">
        <h4>1. What is the taxi fare from ${from} to ${to}?</h4>
        <p>The one-way taxi fare starts from ₹${price} for a Sedan. SUV prices are slightly higher depending on the model chosen.</p>
      </div>
      <div class="faq-item">
        <h4>2. How long does it take to travel from ${from} to ${to} by cab?</h4>
        <p>It typically takes around ${time} to cover the ${dist} km distance, depending on traffic and road conditions.</p>
      </div>
      <div class="faq-item">
        <h4>3. Is the toll tax included in the fare?</h4>
        <p>No, toll taxes, parking fees, and state entry taxes are extra and need to be paid by the customer as per actual receipts.</p>
      </div>
      <div class="faq-item">
        <h4>4. Can I book a cab for a night journey?</h4>
        <p>Yes, we operate 24/7. You can book a cab for any time of the day or night. Night charges may apply for trips starting late at night.</p>
      </div>
      <div class="faq-item">
        <h4>5. Do you provide return trip services?</h4>
        <p>Absolutely! We offer both one-way and round-trip packages. You can book a round trip if you plan to return to ${from} within a few days.</p>
      </div>
      <div class="faq-item">
        <h4>6. How can I book a taxi from ${from} to ${to}?</h4>
        <p>You can book easily through our website by filling out the booking form, or simply call/WhatsApp us at our customer care number.</p>
      </div>
    </section>
  `;
};

const generateCTA = (from, to, price) => {
  return `
    <section id="cta">
      <h3>Book Your ${from} to ${to} Cab Today!</h3>
      <p>Don't wait! Secure the best rates for your journey. Experience a comfortable, safe, and hassle-free ride with us. <strong>Call now or book online to save up to 10% on your first ride.</strong></p>
      <p><strong>Route:</strong> ${from} to ${to} | <strong>Starting Fare:</strong> ₹${price}</p>
    </section>
  `;
};

const validateKeywordUsageEnglish = (content, keywords = []) => {
  if (!content) return { totalKeywords: 0, validKeywords: 0, invalidKeywords: [], keywordCounts: {}, status: 'error' };

  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(' ').length;

  const keywordCounts = {};
  const invalidKeywords = [];
  let validKeywordsCount = 0;

  keywords.forEach(keyword => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'gi');
    const matches = plainText.match(regex);
    const count = matches ? matches.length : 0;
    
    keywordCounts[keyword] = count;

    if (count >= 2) {
      validKeywordsCount++;
    } else {
      invalidKeywords.push({
        keyword,
        count,
        required: 2
      });
    }
  });

  let status = 'valid';
  if (wordCount < 1000) status = 'error'; 
  else if (invalidKeywords.length > 0) status = 'warning';
  
  if (invalidKeywords.length === 0 && wordCount >= 1000) status = 'valid';

  return {
    wordCount,
    totalKeywords: keywords.length,
    validKeywords: validKeywordsCount,
    invalidKeywords,
    keywordCounts,
    status
  };
};