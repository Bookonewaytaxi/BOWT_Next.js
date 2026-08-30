-- BOWT production-safe additive database migration
-- IMPORTANT: This file is NOT executed by the application build.
-- Apply only after a verified Supabase backup/PITR point exists.
-- Non-destructive: no DROP/TRUNCATE/DELETE of business data and no slug renames.

BEGIN;

-- 1) Canonical city master
CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL,
  slug text NOT NULL,
  city_key text GENERATED ALWAYS AS (lower(btrim(canonical_name))) STORED,
  state text,
  latitude numeric,
  longitude numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cities_slug_key UNIQUE (slug),
  CONSTRAINT cities_city_key_key UNIQUE (city_key)
);

-- Seed only missing canonical cities from existing route text.
INSERT INTO public.cities (canonical_name, slug)
SELECT city_name, regexp_replace(lower(btrim(city_name)), '[^a-z0-9]+', '-', 'g')
FROM (
  SELECT DISTINCT btrim(from_city) AS city_name FROM public.routes WHERE nullif(btrim(from_city), '') IS NOT NULL
  UNION
  SELECT DISTINCT btrim(to_city) AS city_name FROM public.routes WHERE nullif(btrim(to_city), '') IS NOT NULL
) c
ON CONFLICT (city_key) DO NOTHING;

-- 2) Add compatibility/lifecycle columns only if absent.
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS from_city_id uuid;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS to_city_id uuid;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS publication_status text;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS last_published_at timestamptz;

-- 3) Backfill canonical city IDs without changing legacy text fields.
UPDATE public.routes r
SET from_city_id = c.id
FROM public.cities c
WHERE r.from_city_id IS NULL
  AND c.city_key = lower(btrim(r.from_city));

UPDATE public.routes r
SET to_city_id = c.id
FROM public.cities c
WHERE r.to_city_id IS NULL
  AND c.city_key = lower(btrim(r.to_city));

-- Fail closed if any route cannot be mapped.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.routes WHERE from_city_id IS NULL OR to_city_id IS NULL) THEN
    RAISE EXCEPTION 'BOWT migration aborted: one or more routes could not be mapped to canonical cities';
  END IF;
END $$;

-- 4) Publication lifecycle. Preserve is_active exactly; map current active routes to published.
UPDATE public.routes
SET publication_status = CASE
  WHEN is_active IS TRUE THEN 'published'
  ELSE 'archived'
END
WHERE publication_status IS NULL;

UPDATE public.routes
SET published_at = COALESCE(published_at, updated_at, created_at),
    last_published_at = COALESCE(last_published_at, updated_at, created_at)
WHERE publication_status = 'published';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.routes'::regclass
      AND conname = 'routes_publication_status_check'
  ) THEN
    ALTER TABLE public.routes
      ADD CONSTRAINT routes_publication_status_check
      CHECK (publication_status IS NULL OR publication_status IN ('draft','review','published','archived'));
  END IF;
END $$;

-- 5) Canonical route-pair uniqueness is added only after a hard duplicate gate.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.routes
    GROUP BY from_city_id, to_city_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'BOWT migration aborted: duplicate canonical route pairs exist';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS routes_from_city_id_to_city_id_uidx
  ON public.routes (from_city_id, to_city_id);

CREATE INDEX IF NOT EXISTS routes_from_city_id_idx ON public.routes (from_city_id);
CREATE INDEX IF NOT EXISTS routes_to_city_id_idx ON public.routes (to_city_id);
CREATE INDEX IF NOT EXISTS routes_publication_idx ON public.routes (publication_status, is_active);
CREATE INDEX IF NOT EXISTS routes_updated_at_idx ON public.routes (updated_at DESC);

-- 6) Route redirects: no existing slugs are changed automatically.
CREATE TABLE IF NOT EXISTS public.route_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug text NOT NULL UNIQUE,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
  redirect_type smallint NOT NULL DEFAULT 301,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT route_redirects_type_check CHECK (redirect_type IN (301, 308)),
  CONSTRAINT route_redirects_not_current_slug CHECK (old_slug <> '')
);
CREATE INDEX IF NOT EXISTS route_redirects_route_id_idx ON public.route_redirects(route_id);

-- 7) Canonical per-route vehicle pricing. Copy only positive/meaningful legacy prices.
CREATE TABLE IF NOT EXISTS public.route_vehicle_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  vehicle_type_id uuid NOT NULL REFERENCES public.vehicle_types(id) ON DELETE RESTRICT,
  vehicle_key text NOT NULL,
  trip_type text NOT NULL DEFAULT 'one_way',
  price numeric NOT NULL,
  price_per_km numeric,
  minimum_fare numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT route_vehicle_prices_trip_type_check CHECK (trip_type IN ('one_way','round_trip')),
  CONSTRAINT route_vehicle_prices_price_check CHECK (price >= 0),
  CONSTRAINT route_vehicle_prices_unique UNIQUE (route_id, vehicle_type_id, trip_type)
);

INSERT INTO public.route_vehicle_prices(route_id, vehicle_type_id, vehicle_key, trip_type, price, price_per_km)
SELECT r.id, v.id, x.vehicle_key, 'one_way', x.price, x.price_per_km
FROM public.routes r
CROSS JOIN LATERAL (
  VALUES
    ('sedan', 'e38bc0ab-0f37-4226-b1f0-0c744df3ebe9'::uuid, r.sedan_price::numeric, r.sedan_price_per_km::numeric),
    ('suv_ertiga', 'd619c303-77aa-4be6-b7a2-d6202363476e'::uuid, r.suv_ertiga_price::numeric, COALESCE(r.suv_6_price_per_km, r.suv_7_price_per_km)::numeric),
    ('innova_crysta', 'c5a9912f-5b6f-4a0d-b9d0-08557cb387b4'::uuid, r.innova_crysta_price::numeric, r.crysta_price_per_km::numeric)
) x(vehicle_key, vehicle_id, price, price_per_km)
JOIN public.vehicle_types v ON v.id = x.vehicle_id
WHERE x.price IS NOT NULL AND x.price > 0
ON CONFLICT (route_id, vehicle_type_id, trip_type) DO NOTHING;

-- 8) Preserve unresolved Carens legacy pricing for later manual mapping; never invent a vehicle row.
CREATE TABLE IF NOT EXISTS public.route_pricing_migration_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  vehicle_key text NOT NULL,
  legacy_price numeric,
  issue text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(route_id, vehicle_key, issue)
);

INSERT INTO public.route_pricing_migration_issues(route_id, vehicle_key, legacy_price, issue)
SELECT id, 'kia_carens', kia_carens_price, 'Kia Carens canonical vehicle_type is missing; manual mapping required'
FROM public.routes
WHERE kia_carens_price IS NOT NULL AND kia_carens_price > 0
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS route_vehicle_prices_route_idx ON public.route_vehicle_prices(route_id);
CREATE INDEX IF NOT EXISTS route_vehicle_prices_vehicle_idx ON public.route_vehicle_prices(vehicle_type_id);

-- 9) Content snapshots. Existing SEO/content is copied, never overwritten.
CREATE TABLE IF NOT EXISTS public.route_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  version integer NOT NULL,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  seo_content text,
  page_sections jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(route_id, version)
);

INSERT INTO public.route_content_versions(route_id, version, seo_title, seo_description, seo_keywords, seo_content, page_sections, created_at)
SELECT id, 1, seo_title, seo_description, seo_keywords, seo_content, page_sections, COALESCE(content_last_updated, updated_at, created_at)
FROM public.routes
ON CONFLICT (route_id, version) DO NOTHING;
CREATE INDEX IF NOT EXISTS route_content_versions_route_idx ON public.route_content_versions(route_id, version DESC);

-- 10) Canonical route SEO compatibility table. Existing seo_metadata remains untouched.
CREATE TABLE IF NOT EXISTS public.route_seo (
  route_id uuid PRIMARY KEY REFERENCES public.routes(id) ON DELETE CASCADE,
  meta_title text,
  meta_description text,
  focus_keyword text,
  og_image_url text,
  canonical_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.route_seo(route_id, meta_title, meta_description, canonical_slug)
SELECT id, seo_title, seo_description, slug
FROM public.routes
ON CONFLICT (route_id) DO NOTHING;

-- 11) Safe import staging tables; no existing import logs are changed.
CREATE TABLE IF NOT EXISTS public.route_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text,
  status text NOT NULL DEFAULT 'staged',
  total_rows integer NOT NULL DEFAULT 0,
  inserted_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT route_import_batches_status_check CHECK (status IN ('staged','validating','validated','approved','processing','completed','failed','cancelled'))
);

CREATE TABLE IF NOT EXISTS public.route_import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.route_import_batches(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  from_city text,
  to_city text,
  slug text,
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_data jsonb,
  validation_status text NOT NULL DEFAULT 'pending',
  validation_errors jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(batch_id, row_number),
  CONSTRAINT route_import_rows_validation_status_check CHECK (validation_status IN ('pending','valid','invalid','skipped'))
);
CREATE INDEX IF NOT EXISTS route_import_rows_batch_idx ON public.route_import_rows(batch_id, validation_status);

-- 12) Existing FK performance indexes identified by the audit.
CREATE INDEX IF NOT EXISTS internal_links_target_route_id_idx ON public.internal_links(target_route_id);
CREATE INDEX IF NOT EXISTS seo_metrics_metadata_id_idx ON public.seo_metrics(metadata_id);
CREATE INDEX IF NOT EXISTS seo_scores_metadata_id_idx ON public.seo_scores(metadata_id);

-- 13) Critical Dahej -> Ahmedabad invariant. If this fails, transaction aborts.
DO $$
DECLARE ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.routes
    WHERE id = 'f9fd7466-1ba2-4923-ace7-8fb176778bf4'
      AND from_city = 'Dahej'
      AND to_city = 'Ahmedabad'
      AND slug = 'dahej-to-ahmedabad'
      AND is_active IS TRUE
      AND distance_km = 250
      AND sedan_price = 3500
      AND suv_ertiga_price = 4500
      AND kia_carens_price = 6000
      AND innova_crysta_price = 8000
  ) INTO ok;
  IF NOT ok THEN
    RAISE EXCEPTION 'BOWT migration aborted: Dahej -> Ahmedabad invariant failed';
  END IF;
END $$;

-- 14) Final route-count invariant: migration must not add/remove route rows.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.routes;
  IF n <> 1717 THEN
    RAISE EXCEPTION 'BOWT migration aborted: expected 1717 routes, found %', n;
  END IF;
END $$;

COMMIT;
