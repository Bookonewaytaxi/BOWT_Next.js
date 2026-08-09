import { renderTemplate } from '@/lib/seo/metaTemplates';

/**
 * Every function below now accepts an optional trailing `config` argument
 * (a row from seo_config, or undefined). When provided and it has real
 * template content, the config-driven path renders from it. When absent
 * (the default — every existing call site that doesn't pass it), the
 * function behaves EXACTLY as before this change, byte-for-byte.
 */

export const generateSEOTitle = (fromCity, toCity, startingPrice, config = null) => {
  const maxLen = config?.max_length || 60;

  if (config?.template_value) {
    const rendered = renderTemplate(config.template_value, {
      from_city: fromCity,
      to_city: toCity,
      price: startingPrice,
    });
    return rendered.length > maxLen ? rendered.substring(0, maxLen - 3) + '...' : rendered;
  }

  const price = startingPrice ? ` @ ₹${startingPrice}` : '';
  const title = `${fromCity} to ${toCity} Taxi | One Way Cab${price}`;
  return title.length > 60 ? title.substring(0, 57) + '...' : title;
};

export const generateMetaDescription = (fromCity, toCity, config = null) => {
  if (config?.template_value) {
    return renderTemplate(config.template_value, { from_city: fromCity, to_city: toCity });
  }
  return `Book ${fromCity} to ${toCity} one way taxi with fixed pricing, no hidden charges, professional drivers and 24/7 support.`;
};

export const generateKeywords = (fromCity, toCity, startingPrice, config = null) => {
  const from = fromCity.toLowerCase().trim();
  const to = toCity.toLowerCase().trim();

  if (config?.template_list && Array.isArray(config.template_list) && config.template_list.length > 0) {
    const rendered = config.template_list.map((tpl) =>
      renderTemplate(tpl, { from_city: from, to_city: to, price: startingPrice })
    );
    return [...new Set(rendered)].slice(0, 20);
  }

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

  const allKeywords = [
    ...routeKeywords,
    ...cityKeywords,
    ...serviceKeywords,
    ...priceKeywords
  ];

  return [...new Set(allKeywords)].slice(0, 20);
};

export const generateSEOContent = (fromCity, toCity, km, startingPrice, config = null) => {
  if (config?.template_value) {
    return renderTemplate(config.template_value, {
      from_city: fromCity,
      to_city: toCity,
      distance_km: km,
      price: startingPrice,
    });
  }

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