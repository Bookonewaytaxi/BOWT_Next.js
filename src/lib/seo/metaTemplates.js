import { supabase } from '@/lib/customSupabaseClient';
import { SEO_VARIABLE_KEYS } from './seoVariableRegistry';

const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Extracts every {{placeholder}} token used in a template string. */
export function extractPlaceholders(templateString) {
  if (!templateString) return [];
  const found = new Set();
  let match;
  const re = new RegExp(PLACEHOLDER_REGEX);
  while ((match = re.exec(templateString)) !== null) {
    found.add(match[1]);
  }
  return Array.from(found);
}

/**
 * Validates that every placeholder used in a template is a real,
 * registered variable (seoVariableRegistry.js). Returns which ones are
 * invalid so the admin UI can show a precise error before saving.
 */
export function validatePlaceholders(templateString) {
  const used = extractPlaceholders(templateString);
  const invalidPlaceholders = used.filter((key) => !SEO_VARIABLE_KEYS.includes(key));
  return { isValid: invalidPlaceholders.length === 0, invalidPlaceholders };
}

/**
 * Renders a template string by replacing {{placeholders}} with real
 * values. Unrecognized or missing variables are left untouched (not
 * blanked out) so a misconfigured template fails visibly instead of
 * silently producing broken-looking text.
 */
export function renderTemplate(templateString, variables = {}) {
  if (!templateString) return '';
  return templateString.replace(PLACEHOLDER_REGEX, (fullMatch, key) => {
    const hasValue = Object.prototype.hasOwnProperty.call(variables, key) && variables[key] !== undefined && variables[key] !== null;
    return hasValue ? String(variables[key]) : fullMatch;
  });
}

/**
 * Loads all ACTIVE templates for a language/country, keyed by template_key.
 * Returns {} (never null/throws) on any failure or empty result — every
 * generator function in seoGeneratorService.js treats a missing key as
 * "no config for this type" and uses its own hardcoded fallback.
 */
export async function loadActiveSeoConfig(languageCode = 'en', countryCode = 'IN') {
  try {
    const { data, error } = await supabase
      .from('seo_config')
      .select('*')
      .eq('language_code', languageCode)
      .eq('country_code', countryCode)
      .eq('is_active', true);

    if (error || !data) return {};

    return data.reduce((acc, row) => {
      acc[row.template_key] = row;
      return acc;
    }, {});
  } catch (err) {
    console.warn('[metaTemplates] Failed to load seo_config:', err);
    return {};
  }
}

/**
 * Creates or updates the ACTIVE template for a given key/language.
 *
 * If an active row already exists, this UPDATEs it — the database
 * trigger (created by the seo_config.sql migration) automatically
 * archives the previous value into seo_config_history and increments
 * version_number BEFORE the update is applied. This function does not
 * write history itself; the database guarantees it, so history-writing
 * logic exists in exactly one place (the trigger), never duplicated here.
 *
 * Throws if any placeholder in the template is invalid — callers
 * (the admin UI) must catch this and show the error, never silently
 * swallow it.
 */
export async function saveSeoConfigTemplate({
  templateKey,
  languageCode = 'en',
  countryCode = 'IN',
  templateValue = null,
  templateList = null,
  maxLength = null,
}) {
  const textToValidate = templateList ? templateList.join(' ') : templateValue;
  const validation = validatePlaceholders(textToValidate);
  if (!validation.isValid) {
    throw new Error(
      `Invalid placeholder(s): ${validation.invalidPlaceholders.map((p) => `{{${p}}}`).join(', ')}`
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from('seo_config')
    .select('id')
    .eq('template_key', templateKey)
    .eq('language_code', languageCode)
    .eq('country_code', countryCode)
    .eq('is_active', true)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    const { error } = await supabase
      .from('seo_config')
      .update({
        template_value: templateValue,
        template_list: templateList,
        max_length: maxLength,
      })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('seo_config').insert({
      template_key: templateKey,
      language_code: languageCode,
      country_code: countryCode,
      is_default: true,
      template_value: templateValue,
      template_list: templateList,
      max_length: maxLength,
      version_number: 1,
      is_active: true,
    });
    if (error) throw error;
  }
}

/**
 * Returns full version history (newest first) for one template,
 * combining the currently-active row (from seo_config) with every
 * archived row (from seo_config_history).
 */
export async function getSeoConfigVersionHistory(templateKey, languageCode = 'en', countryCode = 'IN') {
  const { data: activeRow } = await supabase
    .from('seo_config')
    .select('*')
    .eq('template_key', templateKey)
    .eq('language_code', languageCode)
    .eq('country_code', countryCode)
    .eq('is_active', true)
    .maybeSingle();

  const { data: historyRows } = await supabase
    .from('seo_config_history')
    .select('*')
    .eq('template_key', templateKey)
    .eq('language_code', languageCode)
    .eq('country_code', countryCode)
    .order('version_number', { ascending: false });

  const combined = [
    ...(activeRow ? [{ ...activeRow, is_current: true }] : []),
    ...(historyRows || []).map((r) => ({ ...r, is_current: false })),
  ];

  return combined.sort((a, b) => b.version_number - a.version_number);
}

/**
 * Rolls back to a specific historical version. This calls
 * saveSeoConfigTemplate() with that version's content, which means the
 * CURRENT active version also gets archived by the trigger before the
 * rollback is applied — so rolling back is itself always reversible.
 */
export async function rollbackSeoConfigToVersion(historyRowId) {
  const { data: historyRow, error: fetchErr } = await supabase
    .from('seo_config_history')
    .select('*')
    .eq('id', historyRowId)
    .single();

  if (fetchErr || !historyRow) throw new Error('Version not found');

  return saveSeoConfigTemplate({
    templateKey: historyRow.template_key,
    languageCode: historyRow.language_code,
    countryCode: historyRow.country_code,
    templateValue: historyRow.template_value,
    templateList: historyRow.template_list,
    maxLength: historyRow.max_length,
  });
}
