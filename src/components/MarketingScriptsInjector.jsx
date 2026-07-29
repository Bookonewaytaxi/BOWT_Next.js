import { useEffect } from 'react';
import { getMarketingIntegrations } from '@/utils/marketingIntegrationsUtils';
import { injectRawHtml } from '@/utils/headScriptInjector';

/**
 * Mounted once near the root of the app (see App.jsx). Loads whatever the
 * admin has saved in Settings -> Marketing & Analytics Integration and
 * injects it into <head>, so Search Console verification / GTM / Ads /
 * custom scripts go live on every public page without any code changes.
 */
export default function MarketingScriptsInjector() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const settings = await getMarketingIntegrations();
        if (cancelled) return;

        injectRawHtml('gsc-verification', settings.search_console_code);
        injectRawHtml('ga-gtm', settings.ga_gtm_code);
        injectRawHtml('google-ads', settings.google_ads_code);
        injectRawHtml('custom-script', settings.custom_script_code);
      } catch (error) {
        // Fail silently on the public site - a missing/broken marketing
        // script should never break the customer-facing app.
        console.error('[MarketingScriptsInjector] Failed to load integrations:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
