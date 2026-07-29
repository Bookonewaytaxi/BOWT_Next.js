import { supabase } from '@/lib/customSupabaseClient';

/**
 * Generates a unique inquiry ID in the format INQ-YYYYMMDD-XXX
 */
export async function generateInquiryId(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;
  const prefix = `INQ-${dateStr}`;

  // Fetch the latest ID for today to increment sequence
  const { data, error } = await supabase
    .from('inquiries')
    .select('inquiry_id')
    .ilike('inquiry_id', `${prefix}-%`)
    .order('inquiry_id', { ascending: false })
    .limit(1);

  let sequence = 1;
  
  if (data && data.length > 0 && data[0].inquiry_id) {
    const lastId = data[0].inquiry_id;
    const parts = lastId.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
  }

  const sequenceStr = String(sequence).padStart(3, '0');
  return `${prefix}-${sequenceStr}`;
}