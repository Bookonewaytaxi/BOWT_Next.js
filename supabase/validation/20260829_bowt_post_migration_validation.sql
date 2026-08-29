-- BOWT READ-ONLY POST-MIGRATION VALIDATION
-- Run after the migration has committed. This file contains SELECT/CTE checks only.

-- 1. Route count/status
SELECT count(*) AS total_routes,
       count(*) FILTER (WHERE is_active IS TRUE) AS active_routes,
       count(*) FILTER (WHERE is_active IS FALSE) AS inactive_routes,
       count(*) FILTER (WHERE publication_status = 'published') AS published_routes
FROM public.routes;

-- 2. Duplicate legacy route pairs
SELECT lower(btrim(from_city)) AS from_city_key,
       lower(btrim(to_city)) AS to_city_key,
       count(*) AS duplicate_count
FROM public.routes
GROUP BY 1,2
HAVING count(*) > 1
ORDER BY duplicate_count DESC;

-- 3. Duplicate canonical route pairs
SELECT from_city_id, to_city_id, count(*) AS duplicate_count
FROM public.routes
GROUP BY 1,2
HAVING count(*) > 1;

-- 4. Unmapped routes
SELECT count(*) AS routes_missing_city_mapping
FROM public.routes
WHERE from_city_id IS NULL OR to_city_id IS NULL;

-- 5. Dahej -> Ahmedabad immutable safety check
SELECT id, from_city, to_city, slug, is_active, distance_km,
       sedan_price, suv_ertiga_price, kia_carens_price, innova_crysta_price,
       publication_status
FROM public.routes
WHERE id = 'f9fd7466-1ba2-4923-ace7-8fb176778bf4';

-- 6. Existing malformed slugs are still preserved; no automatic rename expected.
SELECT id, from_city, to_city, slug
FROM public.routes
WHERE slug IN (
  'anand-to-mahuva-saurastra-',
  'mahuva-saurastra--to-ankleshwar',
  'mahuva-saurastra--to-bharuch',
  'mahuva-saurastra--to-vadodara',
  'vadodara-to-mahuva-saurastra-'
)
ORDER BY slug;

-- 7. Pricing migration coverage
SELECT count(*) AS canonical_price_rows
FROM public.route_vehicle_prices;

SELECT vehicle_key, count(*) AS rows
FROM public.route_vehicle_prices
GROUP BY vehicle_key
ORDER BY vehicle_key;

-- 8. Unresolved legacy pricing issues (Carens should be visible here until a canonical vehicle exists)
SELECT vehicle_key, count(*) AS issue_rows
FROM public.route_pricing_migration_issues
GROUP BY vehicle_key
ORDER BY vehicle_key;

-- 9. Content snapshot coverage
SELECT count(*) AS routes_with_v1_snapshot
FROM public.route_content_versions
WHERE version = 1;

-- 10. Canonical SEO coverage
SELECT count(*) AS route_seo_rows,
       count(*) FILTER (WHERE meta_title IS NOT NULL AND meta_title <> '') AS with_title,
       count(*) FILTER (WHERE meta_description IS NOT NULL AND meta_description <> '') AS with_description
FROM public.route_seo;

-- 11. FAQ preservation
SELECT count(*) AS faq_rows,
       count(DISTINCT route_id) AS routes_with_faq
FROM public.route_faqs;

-- 12. Internal links should remain untouched by this migration
SELECT count(*) AS internal_link_rows
FROM public.internal_links;

-- 13. Import staging tables
SELECT to_regclass('public.route_import_batches') AS route_import_batches,
       to_regclass('public.route_import_rows') AS route_import_rows;

-- 14. Required indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'routes_from_city_id_to_city_id_uidx',
    'routes_from_city_id_idx',
    'routes_to_city_id_idx',
    'routes_publication_idx',
    'routes_updated_at_idx',
    'route_redirects_route_id_idx',
    'route_vehicle_prices_route_idx',
    'route_vehicle_prices_vehicle_idx',
    'route_content_versions_route_idx',
    'route_import_rows_batch_idx',
    'internal_links_target_route_id_idx',
    'seo_metrics_metadata_id_idx',
    'seo_scores_metadata_id_idx'
  )
ORDER BY indexname;

-- 15. RLS status report (read-only; this migration intentionally does NOT change legacy RLS)
SELECT n.nspname AS schema_name,
       c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 16. Constraint/FK report for the new architecture
SELECT tc.table_name, tc.constraint_name, tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'cities','routes','route_redirects','route_vehicle_prices',
    'route_pricing_migration_issues','route_content_versions',
    'route_seo','route_import_batches','route_import_rows'
  )
ORDER BY tc.table_name, tc.constraint_name;
