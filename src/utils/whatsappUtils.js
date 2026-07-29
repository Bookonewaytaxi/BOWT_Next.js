import { supabase } from '@/lib/customSupabaseClient';
import { generateAdvancedPDF } from './AdvancedBillPDFGenerator';
import { formatCurrency } from './billingUtils';

export const shareBillOnWhatsApp = async (booking) => {
  try {
    // 1. Generate PDF
    const pdfBlob = await generateAdvancedPDF(booking);
    
    // 2. Upload to Supabase
    const date = new Date().toISOString().split('T')[0];
    const ref = booking.booking_ref_id || (booking.id ? booking.id.slice(0, 8) : 'unknown');
    const filename = `invoices/${date}/INV-${ref}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filename, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw new Error("Upload failed: " + uploadError.message);

    // 3. Get Signed URL
    const { data: signedData, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filename, 60 * 60 * 24 * 30); // 30 days

    if (signError) throw new Error("Link generation failed: " + signError.message);

    // 4. Construct Message
    const total = formatCurrency(booking.total_payable || 0);
    const text = `
Hi ${booking.name},
Your bill is ready. 

Bill #: ${ref}
Amount: ${total}

Download here: ${signedData.signedUrl}

Thank you for choosing One Way Taxi!
    `.trim();

    // 5. Open WhatsApp
    // Format phone number: Remove non-digits, ensure country code if 10 digits
    let phone = booking.mobile_number ? String(booking.mobile_number).replace(/\D/g, '') : '';
    if (phone.length === 10) phone = '91' + phone;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    
    return true;
  } catch (error) {
    console.error("WhatsApp Share Error:", error);
    throw error;
  }
};