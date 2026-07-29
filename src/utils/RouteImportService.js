import { supabase } from '@/lib/customSupabaseClient';
import { generateSEOTitle, generateMetaDescription, generateKeywords } from '@/utils/seoGeneratorService';
import { generateRouteContent, validateKeywordUsage } from '@/utils/ContentGeneratorService';

/**
 * Validates strictly the required fields as per new requirements.
 * Required: from_city, to_city, km, sedan_price, suv_6_price, suv_7_price, premium_suv_price
 */
export const validateRouteData = (rows) => {
  const errors = [];
  
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return { isValid: false, errors: ["No data found in file"] };
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header row

    // Required Text Fields
    if (!row.from_city || !String(row.from_city).trim()) {
      errors.push(`Row ${rowNum}: 'from_city' is required`);
    }
    if (!row.to_city || !String(row.to_city).trim()) {
      errors.push(`Row ${rowNum}: 'to_city' is required`);
    }

    // Required Numeric Fields
    // KM
    const km = row.km || row.distance_km;
    if (km === undefined || km === null || String(km).trim() === '') {
      errors.push(`Row ${rowNum}: 'km' is required`);
    } else if (isNaN(Number(km))) {
      errors.push(`Row ${rowNum}: 'km' must be a valid number`);
    }

    // Sedan Price
    const sedan = row.sedan_price || row.route_price;
    if (sedan === undefined || sedan === null || String(sedan).trim() === '') {
      errors.push(`Row ${rowNum}: 'sedan_price' is required`);
    } else if (isNaN(Number(sedan))) {
      errors.push(`Row ${rowNum}: 'sedan_price' must be a valid number`);
    }

    // SUV 6 (Ertiga)
    const suv6 = row.suv_6_price || row.ertiga_price;
    if (suv6 === undefined || suv6 === null || String(suv6).trim() === '') {
      errors.push(`Row ${rowNum}: 'suv_6_price' is required`);
    } else if (isNaN(Number(suv6))) {
      errors.push(`Row ${rowNum}: 'suv_6_price' must be a valid number`);
    }

    // SUV 7 (Carens)
    const suv7 = row.suv_7_price || row.carens_price;
    if (suv7 === undefined || suv7 === null || String(suv7).trim() === '') {
      errors.push(`Row ${rowNum}: 'suv_7_price' is required`);
    } else if (isNaN(Number(suv7))) {
      errors.push(`Row ${rowNum}: 'suv_7_price' must be a valid number`);
    }

    // Premium SUV (Crysta)
    const premium = row.premium_suv_price || row.premium_price || row.innova_crysta_price;
    if (premium === undefined || premium === null || String(premium).trim() === '') {
      errors.push(`Row ${rowNum}: 'premium_suv_price' is required`);
    } else if (isNaN(Number(premium))) {
      errors.push(`Row ${rowNum}: 'premium_suv_price' must be a valid number`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Main function to process import.
 * Note: Does NOT send slug to DB, relying on 'generate_route_slug_trigger' for NEW records.
 */
export const processRoutesImport = async (parsedData, userId) => {
  console.log("Starting processRoutesImport...");
  const rows = Array.isArray(parsedData) ? parsedData : (parsedData.data || []);
  const parseErrors = parsedData.errors || [];
  
  if (rows.length === 0) {
    console.warn("No rows to process.");
    return {
      totalRows: 0,
      createdCount: 0,
      updatedCount: 0,
      errorCount: parseErrors.length,
      errors: parseErrors,
      createdRoutes: [],
      updatedRoutes: []
    };
  }

  // 1. Fetch existing to handle Upserts (Update if exists, Insert if new)
  const { data: existingRoutes, error: fetchError } = await supabase
    .from('routes')
    .select('id, from_city, to_city');

  if (fetchError) throw fetchError;

  const routeMap = new Map();
  existingRoutes.forEach(r => {
    const key = `${r.from_city.toLowerCase().trim()}-${r.to_city.toLowerCase().trim()}`;
    routeMap.set(key, r.id);
  });

  const toInsert = [];
  const toUpdate = [];
  const processedCreated = [];
  const processedUpdated = [];
  const processingErrors = [...parseErrors];

  // 2. Transform Data
  rows.forEach((row, index) => {
    const rowNum = index + 2;
    try {
        console.log(`Processing Row ${rowNum}: ${row.from_city} -> ${row.to_city}`);
        
        // Clean City Names
        const fromCity = String(row.from_city).trim();
        const toCity = String(row.to_city).trim();
        const key = `${fromCity.toLowerCase()}-${toCity.toLowerCase()}`;
        const existingId = routeMap.get(key);

        // Map Prices
        const km = Number(row.km || row.distance_km);
        const sedanPrice = Number(row.sedan_price || row.route_price);
        const suv6Price = Number(row.suv_6_price || row.ertiga_price);
        const suv7Price = Number(row.suv_7_price || row.carens_price);
        const premiumSuvPrice = Number(row.premium_suv_price || row.innova_crysta_price || row.premium_price);

        console.log(`Row ${rowNum} Prices: Sedan: ${sedanPrice}, SUV6: ${suv6Price}, SUV7: ${suv7Price}, Premium: ${premiumSuvPrice}`);

        // SEO Defaults
        const seo_title = row.seo_title || generateSEOTitle(fromCity, toCity, sedanPrice);
        const seo_description = row.seo_description || generateMetaDescription(fromCity, toCity);
        const seo_keywords = row.seo_keywords ? 
            (typeof row.seo_keywords === 'string' ? row.seo_keywords.split(',') : row.seo_keywords) 
            : generateKeywords(fromCity, toCity, sedanPrice);
        
        // Content
        const language = 'english';
        let content = row.seo_content;
        let validation = { wordCount: 0, status: 'pending' };

        if (!content) {
             const routeObj = {
                from_city: fromCity,
                to_city: toCity,
                distance_km: km,
                sedan_price: sedanPrice,
                ertiga_price: suv6Price,
                carens_price: suv7Price,
                innova_crysta_price: premiumSuvPrice
            };
            content = generateRouteContent(routeObj, seo_keywords, language);
            validation = validateKeywordUsage(content, seo_keywords, language);
        }

        // Prepare Payload - CRITICAL: NO SLUG INCLUDED
        // Ensure ALL price columns are included in the payload
        const routePayload = {
          from_city: fromCity,
          to_city: toCity,
          distance_km: km,
          distance: `${km} km`,
          
          // Core New Price Columns
          sedan_price: sedanPrice,
          suv_6_price: suv6Price,
          suv_7_price: suv7Price,
          premium_suv_price: premiumSuvPrice,
          
          // Legacy/Duplicate Pricing Columns (for compatibility if needed, though we prioritize core ones)
          route_price: sedanPrice, // often aliased to sedan
          ertiga_price: suv6Price,
          carens_price: suv7Price,
          innova_crysta_price: premiumSuvPrice,
          suv_price: suv6Price, // Legacy mapping
          suv_ertiga_price: suv6Price,
          kia_carens_price: suv7Price,
          crysta_price: premiumSuvPrice,

          is_active: row.status === 'inactive' || row.status === false ? false : true,
          updated_at: new Date().toISOString(),

          // SEO
          seo_title,
          seo_description,
          seo_keywords,
          seo_content: content,
          seo_content_language: language,
          content_word_count: validation.wordCount,
          content_validation_status: validation.status,
          content_last_updated: new Date().toISOString()
        };

        if (existingId) {
            // Update: Do not touch slug. DB keeps existing.
            console.log(`Row ${rowNum}: Found existing route ID ${existingId}. Queueing for UPDATE.`);
            toUpdate.push({ id: existingId, ...routePayload });
            processedUpdated.push({ from_city: fromCity, to_city: toCity });
        } else {
            // Insert: Do not send slug. Trigger will generate it.
            console.log(`Row ${rowNum}: New route. Queueing for INSERT (Delegating slug generation to DB trigger).`);
            toInsert.push({ 
                ...routePayload, 
                created_at: new Date().toISOString() 
            });
            processedCreated.push({ from_city: fromCity, to_city: toCity });
        }

    } catch (err) {
        console.error(`Error processing row ${rowNum}:`, err);
        processingErrors.push(`Row ${rowNum}: ${err.message}`);
    }
  });

  // 3. Execute Database Operations
  let successInserts = 0;
  let successUpdates = 0;
  const BATCH_SIZE = 50;

  try {
      // Inserts
      for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const batch = toInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('routes').insert(batch);
        
        if (error) {
            console.error("Batch Insert Failed:", error);
            throw new Error(`Insert failed: ${error.message}`);
        }
        successInserts += batch.length;
      }
      console.log(`Successfully inserted ${successInserts} new routes.`);

      // Updates
      for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
        const batch = toUpdate.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('routes').upsert(batch, { onConflict: 'id' });
        
        if (error) {
            console.error("Batch Update Failed:", error);
            throw new Error(`Update failed: ${error.message}`);
        }
        successUpdates += batch.length;
      }
      console.log(`Successfully updated ${successUpdates} existing routes.`);

  } catch (err) {
      console.error("Database operation failed:", err);
      throw err;
  }

  // 4. Log
  try {
    await supabase.from('import_logs').insert([{
        admin_id: userId,
        file_name: "bulk_import_" + new Date().getTime(),
        total_rows: rows.length,
        created_count: successInserts,
        updated_count: successUpdates,
        error_count: processingErrors.length,
        status: processingErrors.length === 0 ? 'success' : 'partial',
        error_details: processingErrors.length > 0 ? processingErrors : null
    }]);
  } catch (e) {
      console.warn("Logging failed", e);
  }

  return {
    totalRows: rows.length,
    createdCount: successInserts,
    updatedCount: successUpdates,
    errorCount: processingErrors.length,
    errors: processingErrors,
    createdRoutes: processedCreated,
    updatedRoutes: processedUpdated
  };
};

// Alias for compatibility if needed elsewhere, though export is named
export const importRoutes = processRoutesImport;
