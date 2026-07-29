import { supabase } from '@/lib/customSupabaseClient';

/**
 * Generates a unique Booking ID in the format BOWT + YYYYMMDD + Sequence
 * Example: BOWT2026010801
 * @returns {Promise<string>} The generated Booking ID
 */
export async function generateBookingId() {
  const now = new Date();
  
  // Format date parts
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;
  
  // Define the start and end of the current day in UTC for querying
  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

  try {
    // Get count of bookings created today to determine sequence
    // We use head: true to get only the count, not the data
    const { count, error } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (error) {
      console.error('Error fetching booking count:', error);
      // Fallback: use random number if DB query fails to prevent blocking user
      return `BOWT${dateString}${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`;
    }

    // Sequence is count + 1. Pad to at least 2 digits (01, 02, ... 10, 11)
    const sequence = String((count || 0) + 1).padStart(2, '0');
    
    return `BOWT${dateString}${sequence}`;
  } catch (err) {
    console.error('Unexpected error generating ID:', err);
    return `BOWT${dateString}ER`; // ER for Error fallback
  }
}