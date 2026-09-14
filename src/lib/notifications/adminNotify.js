import nodemailer from 'nodemailer';
import twilio from 'twilio';

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
 * Production WhatsApp should use an approved Content Template.
 * Set TWILIO_WHATSAPP_CONTENT_SID to that approved template SID.
 * Template variables 1-6 are: name, mobile, pickup, drop, date, source.
 * Without a Content SID, plain body mode is retained for Sandbox/in-session testing.
 */
export async function sendAdminWhatsApp({ name, mobile, pickup_city, drop_city, travel_date, source }) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const to = process.env.ADMIN_WHATSAPP_NUMBER;
    const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;

    const missing = [
      ['TWILIO_ACCOUNT_SID', accountSid],
      ['TWILIO_AUTH_TOKEN', authToken],
      ['TWILIO_WHATSAPP_FROM', from],
      ['ADMIN_WHATSAPP_NUMBER', to],
    ].filter(([, value]) => !value).map(([key]) => key);

    if (missing.length) {
      const error = `WhatsApp notification is not configured: missing ${missing.join(', ')}`;
      console.error(`[adminNotify] ${error}`);
      return { ok: false, error, code: 'WHATSAPP_CONFIG_MISSING' };
    }

    const client = twilio(accountSid, authToken);
    const message = { from, to };

    if (contentSid) {
      message.contentSid = contentSid;
      message.contentVariables = JSON.stringify({
        '1': name || 'Guest',
        '2': mobile || '-',
        '3': pickup_city || '-',
        '4': drop_city || '-',
        '5': travel_date || '-',
        '6': source || '-',
      });
    } else {
      message.body = [
        `🚕 *New Inquiry — BookOneWayTaxi*`,
        `Name: ${name || 'Guest'}`,
        `Mobile: ${mobile || '-'}`,
        `Route: ${pickup_city || '-'} → ${drop_city || '-'}`,
        `Date: ${travel_date || '-'}`,
        `Source: ${source || '-'}`,
      ].join('\n');
    }

    const result = await client.messages.create(message);
    return { ok: true, sid: result.sid, mode: contentSid ? 'template' : 'body' };
  } catch (err) {
    const error = err?.message || 'Unknown Twilio WhatsApp error';
    const code = err?.code ? String(err.code) : undefined;
    console.error('[adminNotify] WhatsApp failed:', { code, error });
    return { ok: false, error, code };
  }
}
