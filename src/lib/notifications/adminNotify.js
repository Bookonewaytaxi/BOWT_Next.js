import nodemailer from 'nodemailer';
import twilio from 'twilio';

/**
 * Sends the admin a new-inquiry alert by email (Gmail SMTP).
 * Never throws — logs and returns { ok: false } on failure so one
 * channel failing doesn't block the other.
 */
export async function sendAdminEmail({ name, mobile, pickup_city, drop_city, travel_date, source }) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const subject = `New Inquiry: ${pickup_city || '?'} → ${drop_city || '?'} — ${name || 'Guest'}`;
    const text = [
      `New lead captured on the website:`,
      ``,
      `Name: ${name || 'Guest'}`,
      `Mobile: ${mobile || '-'}`,
      `Route: ${pickup_city || '-'} → ${drop_city || '-'}`,
      `Travel date: ${travel_date || '-'}`,
      `Source: ${source || '-'}`,
      ``,
      `Check the admin panel for full details.`,
    ].join('\n');

    await transporter.sendMail({
      from: `"BookOneWayTaxi Website" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject,
      text,
    });

    return { ok: true };
  } catch (err) {
    console.error('[adminNotify] Email failed:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends the admin a new-inquiry alert on WhatsApp (Twilio).
 * NOTE (sandbox mode): the admin number must have sent "join <code>"
 * to the Twilio sandbox number, and that session expires after
 * ~3 days of inactivity — it will need re-joining periodically until
 * a production WhatsApp sender is approved.
 */
export async function sendAdminWhatsApp({ name, mobile, pickup_city, drop_city, travel_date, source }) {
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const body = [
      `🚕 *New Inquiry — BookOneWayTaxi*`,
      `Name: ${name || 'Guest'}`,
      `Mobile: ${mobile || '-'}`,
      `Route: ${pickup_city || '-'} → ${drop_city || '-'}`,
      `Date: ${travel_date || '-'}`,
      `Source: ${source || '-'}`,
    ].join('\n');

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.ADMIN_WHATSAPP_NUMBER,
      body,
    });

    return { ok: true };
  } catch (err) {
    console.error('[adminNotify] WhatsApp failed:', err.message);
    return { ok: false, error: err.message };
  }
}
