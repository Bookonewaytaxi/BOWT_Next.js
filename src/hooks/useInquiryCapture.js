import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { trackEvent } from '@/utils/gtm';

const LOG_PREFIX = '[useInquiryCapture]';

function debugLog(message, data) {
  if ((process.env.NODE_ENV !== 'production')) {
    console.log(`${LOG_PREFIX} ${message}`, data || '');
  }
}

export default function useInquiryCapture(customerData, enabled = true) {
  const dataRef = useRef(customerData);
  const abortRef = useRef(false);
  
  // Sync latest data
  useEffect(() => {
    dataRef.current = customerData;
  }, [customerData]);

  const abortCapture = useCallback(() => {
    debugLog('Capture aborted by user action');
    abortRef.current = true;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Session management
    let sessionId = sessionStorage.getItem('booking_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('booking_session_id', sessionId);
    }

    const captureInquiry = async () => {
      // 1. Checks
      if (abortRef.current) return;

      const data = dataRef.current;
      if (!data) return;

      const { pickup_city, drop_city, travel_date, customer_mobile } = data;

      // Use a route-specific key so different route searches aren't blocked
      // by an earlier capture, but the same route won't be captured twice.
      const captureKey = `inquiry_captured_${pickup_city}_${drop_city}`;
      if (sessionStorage.getItem(captureKey)) return;

      // 2. Validation
      // Basic validation: needs route and contact
      if (!pickup_city || !drop_city || !customer_mobile || customer_mobile.length < 10) {
        debugLog('Validation failed, skipping capture', { pickup_city, drop_city, mobile: customer_mobile });
        return;
      }

      // 3. Prepare Payload
      const payload = {
         pickup_city,
         drop_city,
         travel_date,
         travel_time: data.travel_time || 'Not specified',
         customer_name: data.customer_name || 'Guest User',
         customer_mobile: data.customer_mobile,
         car_type: data.vehicle_type || 'Not selected',
         status: 'new_inquiry',
         source: 'price_page_drop_off',
         admin_notes: `Session: ${sessionId} | Auto-captured on exit`,
         
         // Map to table columns if different
         from_city: pickup_city,
         to_city: drop_city,
         pickup_date: travel_date,
         pickup_time: data.travel_time,
         name: data.customer_name || 'Guest',
         phone: data.customer_mobile,
         message: 'Auto-captured drop-off inquiry',
         email: '-'
      };

      try {
        debugLog('Attempting capture...', payload);
        
        // Using Supabase directly
        const { error, data: insertedData } = await supabase.from('inquiries').insert([payload]).select().single();

        if (error) throw error;
        
        // Track inquiry submission event
        trackEvent('inquiry_submitted', {
          inquiry_id: insertedData?.id || 'unknown',
          from_city: pickup_city,
          to_city: drop_city,
          phone: data.customer_mobile,
          method: 'auto_capture'
        });
        
        sessionStorage.setItem(captureKey, 'true');
        debugLog('Capture success');
      } catch (err) {
        console.error(`${LOG_PREFIX} Capture failed:`, err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        captureInquiry();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
       captureInquiry();
       window.removeEventListener('visibilitychange', handleVisibilityChange);
    };

  }, [enabled]);

  return { abortCapture };
}
