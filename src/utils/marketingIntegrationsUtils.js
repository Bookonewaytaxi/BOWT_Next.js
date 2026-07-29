import { supabase } from '@/lib/customSupabaseClient';

const SETTINGS_KEY = 'marketing_integrations';

export const DEFAULT_MARKETING_SETTINGS = {
  search_console_code: '',
  ga_gtm_code: '',
  google_ads_code: '',
  custom_script_code: ''
};

/**
 * Fetches saved marketing/analytics integration codes from app_settings.
 */
export async function getMarketingIntegrations() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', SETTINGS_KEY)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    if (!data) {
      return DEFAULT_MARKETING_SETTINGS;
    }

    return { ...DEFAULT_MARKETING_SETTINGS, ...data.value };
  } catch (error) {
    console.error('Error fetching marketing integrations:', error);
    throw new Error('Failed to fetch marketing & analytics settings');
  }
}

/**
 * Saves marketing/analytics integration codes to app_settings.
 * Requires a UNIQUE constraint on app_settings.key for the upsert to update
 * (rather than duplicate) the existing row.
 *
 * Raw script/meta tag strings are stored as-is inside a JSON value column
 * (jsonb), so no manual string-escaping is needed on our end - Postgres/
 * Supabase's client library handles safe JSON encoding automatically. This
 * also means a <script> tag pasted here can never break the SQL query itself.
 */
export async function updateMarketingIntegrations(settings) {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(
        {
          key: SETTINGS_KEY,
          value: settings,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) throw error;
    return { ...DEFAULT_MARKETING_SETTINGS, ...data.value };
  } catch (error) {
    console.error('Error updating marketing integrations:', error);
    throw new Error('Failed to save marketing & analytics settings');
  }
}
