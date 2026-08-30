-- BOWT PHASE 1 READ-ONLY VALIDATION
-- SELECT-only. This file must not modify data or schema.

-- 1. Core route invariants
SELECT count(*) AS total_routes,
       count(*) FILTER (WHERE is_active IS TRUE) AS active_routes,
       count(*) FILTER (WHERE is_active IS FALSE) AS inactive_routes
FROM public.routes;

-- 2. Protected Dahej -> Ahmedabad route
SELECT id, from_city, to_city, slug, is_active,
       distance_km, sedan_price, suv_ertiga_price,
       kia_carens_price, innova_crysta_price,
       from_city_id, to_city_id, publication_status,
       published_at, last_published_at
FROM public.routes
WHERE id = 'f9fd7466-1ba2-4923-ace7-8fb176778bf4';

-- 3. New tables exist
SELECT to_regclass('public.cities') AS cities,
       to_regclass('public.route_redirects') AS route_redirects,
       to_regclass('public.route_import_batches') AS route_import_batches,
       to_regclass('public.route_import_rows') AS route_import_rows;

-- 4. Phase 1 must not have populated migration data
SELECT (SELECT count(*) FROM public.cities) AS cities_rows,
       (SELECT count(*) FROM public.route_redirects) AS redirect_rows,
       (SELECT count(*) FROM public.route_import_batches) AS import_batch_rows,
       (SELECT count(*) FROM public.route_import_rows) AS import_row_rows;

-- 5. New routes compatibility columns are present and still nullable/backfill-free.
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'routes'
  AND column_name IN ('from_city_id','to_city_id','publication_status','published_at','last_published_at')
ORDER BY column_name;

-- 6. No existing slugs were changed by Phase 1: malformed slugs remain present.
SELECT count(*) AS preserved_malformed_slug_count
FROM public.routes
WHERE slug IN (
  'anand-to-mahuva-saurastra-',
  'mahuva-saurastra--to-ankleshwar',
  'mahuva-saurastra--to-bharuch',
  'mahuva-saurastra--to-vadodara',
  'vadodara-to-mahuva-saurastra-'
);

-- 7. Existing FAQ count must be preserved.
SELECT count(*) AS faq_rows,
       count(DISTINCT route_id) AS routes_with_faq
FROM public.route_faqs;

-- 8. Existing SEO completeness must be preserved.
SELECT count(*) AS total_routes,
       count(*) FILTER (WHERE seo_title IS NOT NULL AND seo_title <> '') AS routes_with_seo_title,
       count(*) FILTER (WHERE seo_description IS NOT NULL AND seo_description <> '') AS routes_with_seo_description,
       count(*) FILTER (WHERE seo_content IS NOT NULL AND seo_content <> '') AS routes_with_seo_content
FROM public.routes;

-- 9. RLS report only; Phase 1 intentionally does not change legacy RLS.
SELECT n.nspname AS schema_name,
       c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 10. Phase 1 indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'route_redirects_route_id_idx',
    'route_import_rows_batch_idx'
  )
ORDER BY indexname;

-- 11. Foreign keys for Phase 1 tables
SELECT tc.table_name, tc.constraint_name, tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('cities','route_redirects','route_import_batches','route_import_rows')
ORDER BY tc.table_name, tc.constraint_name;
