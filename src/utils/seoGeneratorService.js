import { renderTemplate } from '@/lib/seo/metaTemplates';

const clean = (value) => String(value ?? '').trim();

export const generateSEOTitle = (fromCity, toCity, startingPrice, config = null) => {
  const from = clean(fromCity);
  const to = clean(toCity);
  const maxLen = config?.max_length || 60;

  if (config?.template_value) {
    const rendered = renderTemplate(config.template_value, { from_city: from, to_city: to, price: startingPrice });
    return rendered.length > maxLen ? `${rendered.substring(0, maxLen - 3)}...` : rendered;
  }

  const price = Number(startingPrice) > 0 ? ` @ ₹${Number(startingPrice).toLocaleString('en-IN')}` : '';
  const title = `${from} to ${to} Taxi | One Way Cab${price}`;
  return title.length > 60 ? `${title.substring(0, 57)}...` : title;
};

export const generateMetaDescription = (fromCity, toCity, config = null) => {
  const from = clean(fromCity);
  const to = clean(toCity);
  if (config?.template_value) {
    return renderTemplate(config.template_value, { from_city: from, to_city: to });
  }
  return `Book a one-way taxi from ${from} to ${to} with fixed route pricing. Check available vehicle options, fare and booking details online.`;
};

export const generateKeywords = (fromCity, toCity, startingPrice, config = null) => {
  const from = clean(fromCity).toLowerCase();
  const to = clean(toCity).toLowerCase();

  if (config?.template_list && Array.isArray(config.template_list) && config.template_list.length > 0) {
    const rendered = config.template_list.map((tpl) => renderTemplate(tpl, { from_city: from, to_city: to, price: startingPrice }));
    return [...new Set(rendered)].slice(0, 20);
  }

  const routeKeywords = [
    `${from} to ${to} taxi`,
    `${from} to ${to} cab`,
    `taxi from ${from} to ${to}`,
    `cab from ${from} to ${to}`,
    `${from} to ${to} one way taxi`,
    `${from} to ${to} taxi fare`
  ];

  const cityKeywords = [
    `${from} taxi service`,
    `${to} cab booking`,
    `taxi service in ${from}`,
    `cab in ${to}`,
    `outstation taxi ${from}`
  ];

  return [...new Set([...routeKeywords, ...cityKeywords, 'one way taxi', 'intercity cab', 'outstation cab'])].slice(0, 20);
};

export const generateSEOContent = (fromCity, toCity, km, startingPrice, config = null) => {
  const from = clean(fromCity);
  const to = clean(toCity);
  const distance = Number(km);
  const price = Number(startingPrice);

  if (config?.template_value) {
    return renderTemplate(config.template_value, {
      from_city: from,
      to_city: to,
      distance_km: km,
      price: startingPrice,
    });
  }

  const distanceText = Number.isFinite(distance) && distance > 0 ? `${distance} km` : 'the route distance shown on this page';
  const priceText = Number.isFinite(price) && price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'the fare shown on this page';

  return `
    <h2>${from} to ${to} One-Way Taxi Service</h2>
    <p>Book a one-way taxi from <strong>${from} to ${to}</strong>. The route fare and available vehicle options are shown on this page using the route information maintained in our booking system.</p>

    <h3>Route Fare</h3>
    <p>The starting fare shown for this route is <strong>${priceText}</strong>. Vehicle-wise prices are displayed separately when available.</p>

    <h3>Distance</h3>
    <p>The route distance is approximately <strong>${distanceText}</strong>.</p>

    <h3>How to Book</h3>
    <p>Select your preferred vehicle, choose your pickup date and time, enter the required passenger and pickup details, and submit the booking request.</p>
  `;
};
