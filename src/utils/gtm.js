import TagManager from 'react-gtm-module';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'G-4ZQG6RKFQVC';
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17465769705';

/**
 * Initialize Google Tag Manager
 * Checks if GTM is already initialized to prevent duplicates
 */
export const initializeGTM = () => {
  // Check if script is already in the DOM (e.g., from index.html)
  const scriptExists = document.querySelector(`script[src*="${GTM_ID}"]`);
  
  if (scriptExists) {
    console.log('[GTM] Script already present in DOM. Skipping injection.');
    // Even if script exists, we might want to ensure dataLayer is ready
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
  } else {
    console.log('[GTM] Initializing GTM via react-gtm-module...');
    TagManager.initialize({
      gtmId: GTM_ID
    });
  }
};

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} eventData - Additional data for the event
 */
export const trackEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined') {
    const data = {
      event: eventName,
      ...eventData
    };
    
    console.log('[GTM] Tracking Event:', data);
    
    // Use window.dataLayer directly for reliability or TagManager.dataLayer
    TagManager.dataLayer({
      dataLayer: data
    });
  }
};

/**
 * Track a page view
 * @param {string} pagePath - The path of the page
 * @param {string} pageTitle - The title of the page
 */
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof window !== 'undefined') {
    const data = {
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle || document.title
    };
    
    console.log('[GTM] Tracking Page View:', data);
    
    TagManager.dataLayer({
      dataLayer: data
    });
  }
};

/**
 * Track Google Ads Conversion
 * @param {string} conversionLabel - The conversion label from Google Ads
 * @param {number} value - The value of the conversion
 * @param {string} currency - The currency code (default INR)
 */
export const trackConversion = (conversionLabel, value = 0, currency = 'INR') => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log(`[Google Ads] Tracking Conversion: ${conversionLabel}, Value: ${value} ${currency}`);
    window.gtag('event', 'conversion', {
      'send_to': `${GOOGLE_ADS_ID}/${conversionLabel}`,
      'value': value,
      'currency': currency
    });
  } else {
    console.warn('[Google Ads] gtag not defined, conversion not tracked');
  }
};

/**
 * Track Booking Conversion (Purchase)
 * Uses standard purchase event
 * @param {object} bookingData - Details about the booking
 */
export const trackBookingConversion = (bookingData) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const { id, amount, currency = 'INR', items = [] } = bookingData;
    
    console.log('[Google Ads] Tracking Purchase:', bookingData);
    
    window.gtag('event', 'purchase', {
      transaction_id: id,
      value: amount,
      currency: currency,
      items: items
    });

    // Also track as a generic conversion if needed for specific goals
    // trackConversion('YOUR_BOOKING_LABEL_HERE', amount, currency);
  }
};

/**
 * Track Inquiry/Lead Conversion
 * Uses generate_lead event
 * @param {object} inquiryData - Details about the inquiry
 */
export const trackInquiryConversion = (inquiryData) => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('[Google Ads] Tracking Lead:', inquiryData);
    
    window.gtag('event', 'generate_lead', {
      currency: 'INR',
      value: 0, // Inquiries usually don't have direct value immediately
      ...inquiryData
    });
  }
};


/**
 * Verify GTM Installation
 * Helper for debugging
 */
export const verifyGTMInstallation = () => {
  console.group('=== GTM & Google Ads Verification ===');
  console.log('GTM ID:', GTM_ID);
  console.log('Google Ads ID:', GOOGLE_ADS_ID);
  
  const gtmScript = document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${GTM_ID}"]`);
  const gtagScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}"]`);
  
  console.log('GTM Script detected:', !!gtmScript);
  console.log('GTag Script detected:', !!gtagScript);
  
  const dataLayer = window.dataLayer;
  console.log('dataLayer exists:', !!dataLayer);
  console.log('dataLayer contents:', dataLayer);
  
  console.groupEnd();
  
  return {
    isInstalled: !!gtmScript,
    hasDataLayer: !!dataLayer,
    hasGtag: !!gtagScript
  };
};