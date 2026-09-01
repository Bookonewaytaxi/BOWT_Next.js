-- BOWT PHASE 2 READ-ONLY VALIDATION
-- SELECT-only. Run only after Phase 2 migration commits.

-- 1. Route volume/status
SELECT count(*) AS total_routes,
       count(*) FILTER (WHERE is_active IS TRUE) AS active_routes,
       count(*) FILTER (WHERE is_active IS FALSE) AS inactive_routes,
       count(*) FILTER (WHERE publication_status = 'published') AS published_routes,
       count(*) FILTER (WHERE publication_status = 'archived') AS archived_routes,
       count(*) FILTER (WHERE from_city_id IS NULL) AS missing_from_city_id,
       count(*) FILTER (WHERE to_city_id IS NULL) AS missing_to_city_id
FROM public.routes;

-- 2. Canonical city coverage
SELECT count(*) AS canonical_cities,
       count(*) FILTER (WHERE is_active IS TRUE) AS active_cities
FROM public.cities;

-- 3. Duplicate canonical route pairs
SELECT from_city_id, to_city_id, count(*) AS duplicate_count
FROM public.routes
GROUP BY from_city_id, to_city_id
HAVING count(*) > 1;

-- 4. Dahej -> Ahmedabad safety check
SELECT id, from_city, to_city, slug, is_active, distance_km,
       sedan_price, suv_ertiga_price, kia_carens_price, innova_crysta_price,
       from_city_id, to_city_id, publication_status,
       published_at, last_published_at
FROM public.routes
WHERE id = 'f9fd7466-1ba2-4923-ace7-8fb176778bf4';

-- 5. Existing FAQ/SEO counts must remain intact
SELECT (SELECT count(*) FROM public.route_faqs) AS faq_rows,
       (SELECT count(*) FROM public.routes WHERE seo_title IS NOT NULL AND seo_title <> '') AS seo_title_rows,
       (SELECT count(*) FROM public.routes WHERE seo_description IS NOT NULL AND seo_description <> '') AS seo_description_rows,
       (SELECT count(*) FROM public.routes WHERE seo_content IS NOT NULL AND seo_content <> '') AS seo_content_rows;

-- 6. Existing slugs remain unique
SELECT lower(btrim(slug)) AS normalized_slug, count(*) AS duplicate_count
FROM public.routes
GROUP BY 1
HAVING count(*) > 1;

-- 7. Existing malformed slugs preserved for later redirect planning
SELECT count(*) AS preserved_malformed_slug_count
FROM public.routes
WHERE slug IN (
  'anand-to-mahuva-saurastra-',
  'mahuva-saurastra--to-ankleshwar',
  'mahuva-saurastra--to-bharuch',
  'mahuva-saurastra--to-vadodara',
  'vadodara-to-mahuva-saurastra-'
);

-- 8. Required canonical indexes
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'routes_from_city_id_to_city_id_uidx',
    'routes_from_city_id_idx',
    'routes_to_city_id_idx',
    'routes_publication_idx',
    'routes_updated_at_idx'
  )
ORDER BY indexname;
