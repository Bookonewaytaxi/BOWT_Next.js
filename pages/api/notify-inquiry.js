import { sendAdminEmail, sendAdminWhatsApp } from '@/lib/notifications/adminNotify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, mobile, pickup_city, drop_city, travel_date, source } = req.body || {};

  if (!mobile) {
    return res.status(400).json({ error: 'mobile is required' });
  }

  const payload = { name, mobile, pickup_city, drop_city, travel_date, source };

  const [emailResult, whatsappResult] = await Promise.all([
    sendAdminEmail(payload),
    sendAdminWhatsApp(payload),
  ]);

  // Notification failures are reported in the response but intentionally do
  // not fail the request: the inquiry has already been saved in Supabase and
  // the customer must still be allowed to continue to the price page.
  return res.status(200).json({
    ok: whatsappResult.ok,
    email: emailResult,
    whatsapp: whatsappResult,
  });
}
