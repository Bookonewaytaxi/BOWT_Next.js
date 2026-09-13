import { supabase } from '@/lib/customSupabaseClient';
import { slugify } from '@/lib/utils';
import { generateSEOTitle, generateMetaDescription, generateKeywords } from '@/utils/seoGeneratorService';
import { generateRouteContent, validateKeywordUsage } from '@/utils/ContentGeneratorService';

const PAGE_SIZE = 1000;
const WRITE_BATCH_SIZE = 250;

const firstValue = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return undefined;
};

const normalizeCity = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');
const routeKey = (fromCity, toCity) => `${fromCity.toLowerCase()}::${toCity.toLowerCase()}`;

const parseNumber = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const normalized = String(value).replace(/[,₹\s]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const normalizeImportRow = (row) => {
  const fromCity = normalizeCity(firstValue(row, ['from_city', 'pickup_city', 'pickup', 'from']));
  const toCity = normalizeCity(firstValue(row, ['to_city', 'drop_city', 'drop', 'to']));
  const distanceKm = parseNumber(firstValue(row, ['distance_km', 'km', 'distance']));
  const sedanPrice = parseNumber(firstValue(row, ['sedan_price', 'sedan', 'route_price']));
  const ertigaPrice = parseNumber(firstValue(row, ['ertiga_price', 'suv_6_price', 'suv_6', 'suv_price']));
  const carensPrice = parseNumber(firstValue(row, ['carens_price', 'suv_7_price', 'suv_7', 'kia_carens_price']));
  const crystaPrice = parseNumber(firstValue(row, ['innova_crysta_price', 'innova_price', 'premium_suv_price', 'premium_price', 'crysta_price']));

  return {
    source: row,
    fromCity,
    toCity,
    distanceKm,
    sedanPrice,
    ertigaPrice,
    carensPrice,
    crystaPrice,
    status: String(firstValue(row, ['status', 'is_active']) ?? 'active').toLowerCase() === 'inactive' || firstValue(row, ['is_active']) === false ? 'inactive' : 'active',
    seoTitle: firstValue(row, ['seo_title']),
    seoDescription: firstValue(row, ['seo_description']),
    seoKeywords: firstValue(row, ['seo_keywords']),
    seoContent: firstValue(row, ['seo_content']),
    description: firstValue(row, ['description']),
  };
};

/**
 * Accepts both the current canonical route sheet and the older importer format.
 * Canonical sheet:
 * pickup_city, drop_city, distance_km, sedan_price, ertiga_price,
 * carens_price, innova_price
 */
export const validateRouteData = (rows) => {
  const errors = [];
  if (!Array.isArray(rows) || rows.length === 0) {
    return { isValid: false, errors: ['No data found in file'] };
  }

  const seen = new Set();
  rows.forEach((rawRow, index) => {
    const rowNum = index + 2;
    const row = normalizeImportRow(rawRow);

    if (!row.fromCity) errors.push(`Row ${rowNum}: 'pickup_city' / 'from_city' is required`);
    if (!row.toCity) errors.push(`Row ${rowNum}: 'drop_city' / 'to_city' is required`);

    if (row.distanceKm === null || row.distanceKm < 0) {
      errors.push(`Row ${rowNum}: 'distance_km' / 'km' must be a valid non-negative number`);
    }
    if (row.sedanPrice === null || row.sedanPrice < 0) {
      errors.push(`Row ${rowNum}: 'sedan_price' must be a valid non-negative number`);
    }
    if (row.ertigaPrice === null || row.ertigaPrice < 0) {
      errors.push(`Row ${rowNum}: 'ertiga_price' / 'suv_6_price' must be a valid non-negative number`);
    }
    if (row.carensPrice === null || row.carensPrice < 0) {
      errors.push(`Row ${rowNum}: 'carens_price' / 'suv_7_price' must be a valid non-negative number`);
    }
    if (row.crystaPrice === null || row.crystaPrice < 0) {
      errors.push(`Row ${rowNum}: 'innova_price' / 'innova_crysta_price' / 'premium_suv_price' must be a valid non-negative number`);
    }

    if (row.fromCity && row.toCity) {
      const key = routeKey(row.fromCity, row.toCity);
      if (seen.has(key)) errors.push(`Row ${rowNum}: duplicate route in the same file (${row.fromCity} → ${row.toCity})`);
      seen.add(key);
    }
  });

  return { isValid: errors.length === 0, errors };
};

const fetchAllExistingRoutes = async () => {
  const allRoutes = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('routes')
      .select('id, from_city, to_city, slug')
      .range(from, to);

    if (error) throw error;
    const page = data || [];
    allRoutes.push(...page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRoutes;
};

const toSeoKeywords = (value, fromCity, toCity, sedanPrice) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.split(',').map((item) => item.trim()).filter(Boolean);
  return generateKeywords(fromCity, toCity, sedanPrice);
};

const buildRoutePayload = (route) => {
  const seoTitle = route.seoTitle || generateSEOTitle(route.fromCity, route.toCity, route.sedanPrice);
  const seoDescription = route.seoDescription || generateMetaDescription(route.fromCity, route.toCity);
  const seoKeywords = toSeoKeywords(route.seoKeywords, route.fromCity, route.toCity, route.sedanPrice);

  let seoContent = route.seoContent;
  let validation = { wordCount: 0, status: 'pending' };

  if (!seoContent) {
    const contentRoute = {
      from_city: route.fromCity,
      to_city: route.toCity,
      distance_km: route.distanceKm,
      sedan_price: route.sedanPrice,
      ertiga_price: route.ertigaPrice,
      carens_price: route.carensPrice,
      innova_crysta_price: route.crystaPrice,
    };
    seoContent = generateRouteContent(contentRoute, seoKeywords, 'english');
    validation = validateKeywordUsage(seoContent, seoKeywords, 'english');
  }

  const generatedSlug = `${slugify(route.fromCity)}-to-${slugify(route.toCity)}-taxi`;
  const now = new Date().toISOString();

  // Only columns already used by the existing Create/Edit route forms are sent.
  // This prevents bulk import from failing because of optional/legacy columns
  // that may not exist in a particular production schema version.
  return {
    from_city: route.fromCity,
    to_city: route.toCity,
    distance_km: route.distanceKm,
    sedan_price: route.sedanPrice,
    ertiga_price: route.ertigaPrice,
    carens_price: route.carensPrice,
    innova_crysta_price: route.crystaPrice,
    route_price: route.sedanPrice,
    distance: `${route.distanceKm} km`,
    suv_price: route.ertigaPrice,
    crysta_price: route.crystaPrice,
    suv_ertiga_price: route.ertigaPrice,
    kia_carens_price: route.carensPrice,
    description: route.description || null,
    is_active: route.status !== 'inactive',
    slug: generatedSlug,
    seo_title: seoTitle,
    seo_description: seoDescription,
    seo_keywords: seoKeywords,
    seo_content: seoContent,
    seo_content_language: 'english',
    content_word_count: validation.wordCount,
    content_validation_status: validation.status,
    content_last_updated: now,
    updated_at: now,
  };
};

const writeBatches = async (table, rows, mode) => {
  let success = 0;
  const errors = [];

  for (let i = 0; i < rows.length; i += WRITE_BATCH_SIZE) {
    const batch = rows.slice(i, i + WRITE_BATCH_SIZE);
    const response = mode === 'insert'
      ? await supabase.from(table).insert(batch)
      : await supabase.from(table).upsert(batch, { onConflict: 'id' });

    if (response.error) {
      // Retry the failed batch row-by-row so one bad row does not block
      // thousands of otherwise valid routes, and return exact row errors.
      for (const row of batch) {
        const singleResponse = mode === 'insert'
          ? await supabase.from(table).insert(row)
          : await supabase.from(table).upsert(row, { onConflict: 'id' });
        if (singleResponse.error) {
          errors.push({ row, message: singleResponse.error.message, code: singleResponse.error.code });
        } else {
          success += 1;
        }
      }
    } else {
      success += batch.length;
    }
  }

  return { success, errors };
};

export const processRoutesImport = async (parsedData, userId) => {
  const rows = Array.isArray(parsedData) ? parsedData : (parsedData?.data || []);
  const parseErrors = Array.isArray(parsedData?.errors) ? parsedData.errors : [];

  if (!rows.length) {
    return {
      totalRows: 0,
      createdCount: 0,
      updatedCount: 0,
      errorCount: parseErrors.length,
      errors: parseErrors,
      createdRoutes: [],
      updatedRoutes: [],
    };
  }

  const validation = validateRouteData(rows);
  if (!validation.isValid) {
    return {
      totalRows: rows.length,
      createdCount: 0,
      updatedCount: 0,
      errorCount: validation.errors.length,
      errors: validation.errors,
      createdRoutes: [],
      updatedRoutes: [],
    };
  }

  const existingRoutes = await fetchAllExistingRoutes();
  const routeMap = new Map(existingRoutes.map((route) => [routeKey(route.from_city, route.to_city), route]));

  const toInsert = [];
  const toUpdate = [];
  const processedCreated = [];
  const processedUpdated = [];

  for (const rawRow of rows) {
    const route = normalizeImportRow(rawRow);
    const key = routeKey(route.fromCity, route.toCity);
    const existing = routeMap.get(key);
    const payload = buildRoutePayload(route);

    if (existing) {
      toUpdate.push({ id: existing.id, ...payload, slug: existing.slug || payload.slug });
      processedUpdated.push({ from_city: route.fromCity, to_city: route.toCity });
    } else {
      toInsert.push({ ...payload, created_at: new Date().toISOString() });
      processedCreated.push({ from_city: route.fromCity, to_city: route.toCity });
    }
  }

  const [insertResult, updateResult] = await Promise.all([
    writeBatches('routes', toInsert, 'insert'),
    writeBatches('routes', toUpdate, 'update'),
  ]);

  const processingErrors = [
    ...parseErrors,
    ...insertResult.errors.map((item) => `Insert failed for ${item.row.from_city} → ${item.row.to_city}: ${item.message}${item.code ? ` [${item.code}]` : ''}`),
    ...updateResult.errors.map((item) => `Update failed for ${item.row.from_city} → ${item.row.to_city}: ${item.message}${item.code ? ` [${item.code}]` : ''}`),
  ];

  // Import logging is intentionally non-blocking. The importer must never
  // report a route failure because an optional audit/log table is unavailable.
  try {
    console.info('[RouteImportService] Import summary', {
      adminId: userId || null,
      totalRows: rows.length,
      created: insertResult.success,
      updated: updateResult.success,
      errors: processingErrors.length,
    });
  } catch (_) {
    // no-op
  }

  return {
    totalRows: rows.length,
    createdCount: insertResult.success,
    updatedCount: updateResult.success,
    errorCount: processingErrors.length,
    errors: processingErrors,
    createdRoutes: processedCreated,
    updatedRoutes: processedUpdated,
  };
};

export const importRoutes = processRoutesImport;
