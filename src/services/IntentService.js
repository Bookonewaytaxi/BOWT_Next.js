import { supabase } from '@/lib/customSupabaseClient';
import { classifyRouteIntent } from '@/lib/intent/intentClassifier';

const VALID_INTENTS = ['price_related', 'distance_related', 'route_booking'];
const VALID_SOURCES = ['rule_based'];

export async function getIntentByRouteId(routeId, route = null) {
  if (!routeId) return route ? classifyRouteIntent(route) : null;

  const { data, error } = await supabase
    .from('route_intents')
    .select('route_id, primary_intent, confidence_score, intent_source, computed_at')
    .eq('route_id', routeId)
    .maybeSingle();

  if (error) {
    console.error('[IntentService] getIntentByRouteId failed:', error);
    if (route) return classifyRouteIntent(route);
    throw error;
  }

  // The database is authoritative when an intent row exists. For routes that
  // have not been backfilled yet, return the deterministic classifier result so
  // an empty route_intents table never disables the intent engine.
  return data || (route ? classifyRouteIntent(route) : null);
}

export async function getIntentsByRouteIds(routeIds) {
  if (!Array.isArray(routeIds) || routeIds.length === 0) return [];
  const { data, error } = await supabase
    .from('route_intents')
    .select('route_id, primary_intent, confidence_score, intent_source, computed_at')
    .in('route_id', routeIds);
  if (error) { console.error('[IntentService] getIntentsByRouteIds failed:', error); throw error; }
  return data || [];
}

function validateIntent(routeId, intent) {
  const errors = [];
  if (!routeId) errors.push('routeId is required');
  if (!intent?.primary_intent || !VALID_INTENTS.includes(intent.primary_intent)) errors.push(`primary_intent must be one of: ${VALID_INTENTS.join(', ')}`);
  if (intent?.confidence_score !== undefined && (typeof intent.confidence_score !== 'number' || intent.confidence_score < 0 || intent.confidence_score > 1)) errors.push('confidence_score must be a number between 0 and 1');
  if (intent?.intent_source && !VALID_SOURCES.includes(intent.intent_source)) errors.push(`intent_source must be one of: ${VALID_SOURCES.join(', ')}`);
  return { isValid: errors.length === 0, errors };
}

export async function upsertIntent(routeId, intent) {
  const { isValid, errors } = validateIntent(routeId, intent);
  if (!isValid) return { success: false, error: `Invalid intent: ${errors.join('; ')}` };
  const row = {
    route_id: routeId,
    primary_intent: intent.primary_intent,
    confidence_score: intent.confidence_score ?? 1.0,
    intent_source: intent.intent_source || 'rule_based',
    computed_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('route_intents').upsert(row, { onConflict: 'route_id' });
  if (error) { console.error('[IntentService] upsertIntent failed:', error); return { success: false, error: error.message }; }
  return { success: true };
}

export async function deleteIntent(routeId) {
  if (!routeId) return { success: false, error: 'routeId is required' };
  const { error } = await supabase.from('route_intents').delete().eq('route_id', routeId);
  if (error) { console.error('[IntentService] deleteIntent failed:', error); return { success: false, error: error.message }; }
  return { success: true };
}
