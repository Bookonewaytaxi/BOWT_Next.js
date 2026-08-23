import { supabase } from '@/lib/customSupabaseClient';

const VALID_STATUSES = ['draft', 'approved', 'rejected'];

export async function getApprovedFaqs(routeId) {
  if (!routeId) return [];
  const { data, error } = await supabase
    .from('route_faqs')
    .select('id, category, question, answer, priority, status, generated_at, updated_at')
    .eq('route_id', routeId)
    .eq('status', 'approved')
    .order('priority', { ascending: true });
  if (error) { console.error('[FaqService] getApprovedFaqs failed:', error); throw error; }
  return data || [];
}

export async function getFaqsByRouteId(routeId) {
  if (!routeId) return [];
  const { data, error } = await supabase
    .from('route_faqs')
    .select('*')
    .eq('route_id', routeId)
    .order('priority', { ascending: true });
  if (error) { console.error('[FaqService] getFaqsByRouteId failed:', error); throw error; }
  return data || [];
}

function validateFaq(routeId, faq) {
  const errors = [];
  if (!routeId) errors.push('routeId is required');
  if (!faq?.category || typeof faq.category !== 'string' || faq.category.trim() === '') errors.push('category is required');
  if (!faq?.question || typeof faq.question !== 'string' || faq.question.trim() === '') errors.push('question is required');
  if (!faq?.answer || typeof faq.answer !== 'string' || faq.answer.trim() === '') errors.push('answer is required');
  if (faq?.status && !VALID_STATUSES.includes(faq.status)) errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  return { isValid: errors.length === 0, errors };
}

function normalizeFaqRow(routeId, faq) {
  return {
    route_id: routeId,
    category: faq.category.trim(),
    question: faq.question.trim(),
    answer: faq.answer.trim(),
    priority: Number.isFinite(faq.priority) ? faq.priority : 0,
    status: faq.status && VALID_STATUSES.includes(faq.status) ? faq.status : 'approved',
    updated_at: new Date().toISOString(),
  };
}

export async function upsertFaq(routeId, faq) {
  const { isValid, errors } = validateFaq(routeId, faq);
  if (!isValid) return { success: false, error: `Invalid FAQ: ${errors.join('; ')}` };
  const row = normalizeFaqRow(routeId, faq);
  const { error } = await supabase.from('route_faqs').upsert(row, { onConflict: 'route_id,category' });
  if (error) { console.error('[FaqService] upsertFaq failed:', error); return { success: false, error: error.message }; }
  return { success: true };
}

export async function upsertFaqs(routeId, faqs) {
  if (!routeId) return { success: false, error: 'routeId is required', savedCount: 0, skippedCount: 0 };
  if (!Array.isArray(faqs) || faqs.length === 0) return { success: true, savedCount: 0, skippedCount: 0 };
  const validRows = [];
  let skippedCount = 0;
  for (const faq of faqs) {
    const { isValid } = validateFaq(routeId, faq);
    if (isValid) validRows.push(normalizeFaqRow(routeId, faq));
    else skippedCount += 1;
  }
  if (validRows.length === 0) return { success: true, savedCount: 0, skippedCount };
  const { error } = await supabase.from('route_faqs').upsert(validRows, { onConflict: 'route_id,category' });
  if (error) { console.error('[FaqService] upsertFaqs failed:', error); return { success: false, error: error.message, savedCount: 0, skippedCount }; }
  return { success: true, savedCount: validRows.length, skippedCount };
}

export async function deleteFaq(routeId, category) {
  if (!routeId || !category) return { success: false, error: 'routeId and category are required' };
  const { error } = await supabase.from('route_faqs').delete().eq('route_id', routeId).eq('category', category);
  if (error) { console.error('[FaqService] deleteFaq failed:', error); return { success: false, error: error.message }; }
  return { success: true };
}

export async function deleteFaqsForRoute(routeId) {
  if (!routeId) return { success: false, error: 'routeId is required' };
  const { error } = await supabase.from('route_faqs').delete().eq('route_id', routeId);
  if (error) { console.error('[FaqService] deleteFaqsForRoute failed:', error); return { success: false, error: error.message }; }
  return { success: true };
}
