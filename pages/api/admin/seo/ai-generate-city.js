import { supabase } from '@/lib/customSupabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'Please sign in again to use AI city content generation.' });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) return res.status(401).json({ error: 'Your admin session is invalid or expired.' });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI generation is not configured. Add OPENAI_API_KEY to the Vercel project environment.' });

  const body = req.body || {};
  const cityName = String(body.city_name || '').trim().slice(0, 100);
  const state = String(body.state || '').trim().slice(0, 100);
  const outgoing = Array.isArray(body.outgoing_destinations) ? body.outgoing_destinations.slice(0, 20).map((v) => String(v).slice(0, 100)) : [];
  const incoming = Array.isArray(body.incoming_origins) ? body.incoming_origins.slice(0, 20).map((v) => String(v).slice(0, 100)) : [];
  if (!cityName) return res.status(400).json({ error: 'City name is required.' });

  const prompt = `Write a genuinely useful, distinct 150–250 word city introduction for a one-way taxi route landing page. Use only the facts supplied. Do not invent attractions, airports, railway stations, distances, population, local geography, travel times, safety claims, service coverage, or any local facts not supplied. Explain that this page lists the available one-way taxi connections where this city is a pickup or destination. Mention a few supplied destination/origin city names naturally, without keyword stuffing. Explain practical booking considerations in general terms. State the known business fare rule accurately: toll, border tax, permit and driver allowance are included in the fixed one-way route fare; parking is extra. Contact number: +91 75675 75578. Do not claim 24/7 service, GPS tracking, verified drivers or guaranteed availability. Return plain text only, no HTML or markdown.\n\nVerified city facts:\n${JSON.stringify({ city_name: cityName, state: state || null, available_drop_cities: outgoing, available_pickup_cities: incoming })}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_SEO_MODEL || 'gpt-6-luna',
        reasoning: { effort: 'low' },
        max_output_tokens: 1800,
        input: prompt,
        text: { format: { type: 'json_schema', name: 'bowt_city_content', strict: true, schema: {
          type: 'object', additionalProperties: false,
          properties: { description: { type: 'string' } },
          required: ['description']
        } } }
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      console.error('[AI City SEO] Provider error:', response.status, payload?.error?.message || 'Unknown error');
      return res.status(response.status === 429 ? 429 : 502).json({ error: 'AI provider could not complete city content. Please retry.' });
    }
    const outputText = (payload.output || []).filter((item) => item.type === 'message').flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
    if (!outputText) return res.status(502).json({ error: 'AI returned an empty city description.' });
    const result = JSON.parse(outputText);
    const description = String(result.description || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 5000);
    if (description.length < 120) return res.status(502).json({ error: 'AI city content was too short. Please retry.' });
    return res.status(200).json({ description, generated_by: 'openai', review_required: true });
  } catch (error) {
    console.error('[AI City SEO] Generation failed:', error);
    return res.status(502).json({ error: 'AI city content generation failed. No city profile was changed.' });
  }
}
