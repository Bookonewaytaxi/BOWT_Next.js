export function buildRouteFaqs({ route, startingPrice = 0 }) {
  if (!route?.from_city || !route?.to_city) return [];

  const fromCity = route.from_city;
  const toCity = route.to_city;
  const distance = route.distance_km;
  const price = Number(startingPrice) > 0 ? `₹${Number(startingPrice).toLocaleString('en-IN')}` : null;

  return [
    {
      question: `What is the distance from ${fromCity} to ${toCity} by taxi?`,
      answer: distance
        ? `The road distance from ${fromCity} to ${toCity} is approximately ${distance} km. The actual travel distance can vary slightly with the pickup and drop location. The route page shows the currently available route distance."
        : `The exact taxi distance depends on the selected pickup and drop locations in ${fromCity} and ${toCity}.`,
    },
    {
      question: `What is the taxi fare from ${fromCity} to ${toCity}?`,
      answer: price
        ? `Taxi fares for ${fromCity} to ${toCity} start from ${price}. The final fare depends on the selected vehicle and the route pricing available for this booking.`,
        : `The fare for ${fromCity} to ${toCity} depends on the vehicle selected and the route pricing available at the time of booking.`,
    },
    {
      question: `Can I book a one-way taxi from ${fromCity} to ${toCity}?`,
      answer: `Yes. You can use this route page to book a one-way taxi from ${fromCity} to ${toCity}. Select the available vehicle, enter your travel details and continue with the booking flow.`,
    },
    {
      question: `Which vehicles are available for ${fromCity} to ${toCity}?`,
      answer: `Available vehicle options are shown in the vehicle pricing section on this route page. The options and fares can vary by route and current availability.`,
    },
    {
      question: `How can I book a taxi from ${fromCity} to ${toCity}?`,
      answer: `Click Book Now on this route page, select your travel details and preferred vehicle, and continue through the booking process to confirm your ${fromCity} to ${toCity} taxi.`,
    },
  ].filter((faq) => faq.question && faq.answer);
}
