import { supabase } from '@/lib/customSupabaseClient';

const VALID_INTENTS = ['price_related', 'distance_related', 'route_booking'];
const VALID_SOURCES = ['rule_based'];

export async function getIntentByRouteId(routeId) {
  if (!routeId) return null;
  const { data, error } = await supabase
    .from('route_intents')
    .select('route_id, primary_intent, confidence_score, intent_source, computed_at')
    .eq('route_id', routeId)
    .maybeSingle();
  if (error) { console.error('[IntentService] getIntentByRouteId failed:', error); throw error; }
  return data || null;
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
  if (intent?.confidence_score !== undefined && typeof intent.confidence_score !== 'number') errors.push('confidence_score must be numeric');
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
