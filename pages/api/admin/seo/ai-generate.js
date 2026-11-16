import { supabase } from '@/lib/customSupabaseClient';
import { generateMetaDescription, generateMetaTitle } from '@/utils/seoGenerator';

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    meta_title: { type: 'string' },
    meta_description: { type: 'string' },
    h1_heading: { type: 'string' },
    focus_keyword: { type: 'string' },
    secondary_keywords: { type: 'array', items: { type: 'string' } },
    long_form_content: { type: 'string' },
    faq_section: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          category: { type: 'string' },
          question: { type: 'string' },
          answer: { type: 'string' }
        },
        required: ['category', 'question', 'answer']
      }
    }
  },
  required: ['meta_title', 'meta_description', 'h1_heading', 'focus_keyword', 'secondary_keywords', 'long_form_content', 'faq_section']
};

function sanitizeSeoHtml(value) {
  let html = String(value || '').slice(0, 30000);
  html = html.replace(/<\s*(script|style|iframe|object|svg|form|input|button)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '');
  html = html.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/<\/?(?!h2\b|h3\b|p\b|strong\b|em\b|ul\b|ol\b|li\b|a\b)[a-z][^>]*>/gi, '');
  html = html.replace(/<(h2|h3|p|strong|em|ul|ol|li)\b[^>]*>/gi, '<$1>');
  html = html.replace(/<a\b[^>]*href\s*=\s*(["'])(https?:\/\/[^"']+|tel:[^"']+|\/[^"']*)\1[^>]*>/gi, '<a href="$2" rel="nofollow noopener">');
  html = html.replace(/<a\b(?![^>]*href=)[^>]*>/gi, '<a>');
  return html;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'Please sign in again to use AI SEO generation.' });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return res.status(401).json({ error: 'Your admin session is invalid or expired.' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI generation is not configured yet. Add OPENAI_API_KEY to the Vercel project environment, then redeploy the preview.' });

  const body = req.body || {};
  const route = body.route || {};
  const fromCity = String(route.from_city || '').trim().slice(0, 100);
  const toCity = String(route.to_city || '').trim().slice(0, 100);
  if (!fromCity || !toCity) return res.status(400).json({ error: 'Pickup and drop city are required.' });

  const distanceKm = Number(route.distance_km) > 0 ? Number(route.distance_km) : null;
  const startingPrice = Number(route.starting_price) > 0 ? Number(route.starting_price) : null;
  const vehiclePrices = route.vehicle_prices && typeof route.vehicle_prices === 'object' ? route.vehicle_prices : {};

  const facts = {
    route: { from_city: fromCity, to_city: toCity, distance_km: distanceKm },
    current_route_fares: {
      sedan: Number(vehiclePrices.sedan) > 0 ? Number(vehiclePrices.sedan) : null,
      ertiga: Number(vehiclePrices.ertiga) > 0 ? Number(vehiclePrices.ertiga) : null,
      carens: Number(vehiclePrices.carens) > 0 ? Number(vehiclePrices.carens) : null,
      innova_crysta: Number(vehiclePrices.innova_crysta) > 0 ? Number(vehiclePrices.innova_crysta) : null,
      displayed_starting_price: startingPrice
    },
    business_facts: {
      one_way_fixed_route_fares: true,
      included_in_fare: ['toll', 'border tax', 'permit', 'driver allowance'],
      parking: 'extra',
      contact_phone: '+91 75675 75578',
      website: 'Book One Way Taxi'
    }
  };

  const prompt = `Create a high-quality, useful on-page SEO package for this exact taxi route using only the supplied facts. Do not invent local attractions, road conditions, travel time, driver verification, GPS tracking, 24/7 availability, vehicle availability, customer reviews, guarantees, or claims not in the facts. Do not change or suggest a URL slug. Do not invent fares; only use a price if supplied. State accurately that toll, border tax, permit and driver allowance are included in the fixed one-way fare, while parking is extra. Include the exact phone number +91 75675 75578 in the meta description. Keep the meta title at 60 characters or fewer and meta description between 140 and 160 characters where the city names allow. Write natural English, no keyword stuffing, no repetitive filler, and useful route-specific information. HTML content may use only h2, h3, p, strong, em, ul, ol, li and a tags. Provide 3-5 FAQs whose answers are limited to the supplied facts and practical booking steps. Return only the requested structured fields.\n\nRoute facts:\n${JSON.stringify(facts)}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SEO_MODEL || 'gpt-6-luna',
        reasoning: { effort: 'low' },
        max_output_tokens: 5000,
        input: prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'bowt_route_seo',
            strict: true,
            schema: OUTPUT_SCHEMA
          }
        }
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error('[AI SEO] OpenAI API error:', response.status, payload?.error?.message || 'Unknown error');
      return res.status(response.status === 429 ? 429 : 502).json({ error: 'AI provider could not complete the request. Please retry shortly.' });
    }

    const outputText = (payload.output || [])
      .filter((item) => item.type === 'message')
      .flatMap((item) => item.content || [])
      .find((item) => item.type === 'output_text')?.text;
    if (!outputText) return res.status(502).json({ error: 'AI returned an empty response. Please retry.' });

    const generated = JSON.parse(outputText);
    const title = String(generated.meta_title || generateMetaTitle(fromCity, toCity)).trim().slice(0, 60);
    const aiDescription = String(generated.meta_description || '').trim();
    const description = aiDescription.length >= 140 && aiDescription.length <= 160 && aiDescription.includes('+91 75675 75578')
      ? aiDescription
      : generateMetaDescription(fromCity, toCity, distanceKm, startingPrice);

    return res.status(200).json({
      meta_title: title,
      meta_description: description,
      h1_heading: String(generated.h1_heading || `One Way Taxi from ${fromCity} to ${toCity}`).slice(0, 120),
      focus_keyword: String(generated.focus_keyword || `${fromCity} to ${toCity} one way taxi`).slice(0, 120),
      secondary_keywords: Array.isArray(generated.secondary_keywords) ? generated.secondary_keywords.slice(0, 8).map((item) => String(item).slice(0, 100)) : [],
      long_form_content: sanitizeSeoHtml(generated.long_form_content),
      faq_section: Array.isArray(generated.faq_section) ? generated.faq_section.slice(0, 5).map((faq, index) => ({
        category: String(faq.category || `ai-faq-${index + 1}`).slice(0, 80),
        question: String(faq.question || '').slice(0, 250),
        answer: String(faq.answer || '').slice(0, 1200),
        status: 'draft'
      })) : [],
      generated_by: 'openai',
      review_required: true
    });
  } catch (error) {
    console.error('[AI SEO] Generation failed:', error);
    return res.status(502).json({ error: 'AI generation failed unexpectedly. No route data was changed.' });
  }
}
