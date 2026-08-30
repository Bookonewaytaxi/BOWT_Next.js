-- BOWT PHASE 1: MINIMUM-CHANGE ADDITIVE FOUNDATION
-- Purpose: prepare the database for later normalization without touching existing
-- business data, routes, prices, SEO, FAQs, bookings, customers, drivers or bills.
-- This migration intentionally does NOT enable RLS, add FKs to legacy columns,
-- backfill existing routes, create route pricing rows, or alter existing policies.
-- It is designed as the lowest-risk schema-only phase.

BEGIN;

-- Safety: fail closed if this is not the expected BOWT route dataset.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.routes;
  IF n <> 1717 THEN
    RAISE EXCEPTION 'BOWT Phase 1 aborted: expected 1717 routes, found %', n;
  END IF;
END $$;

-- 1. Canonical city master. Empty on creation: NO route data is copied or changed.
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

-- 2. Add nullable compatibility/lifecycle columns only.
-- Existing values are untouched because these columns are introduced as NULL.
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS from_city_id uuid;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS to_city_id uuid;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS publication_status text;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS last_published_at timestamptz;

-- 3. Publication status is intentionally NOT backfilled in Phase 1.
-- The application must first be audited for all existing is_active consumers.
-- This prevents a new status field from changing production behavior.

-- 4. Redirect registry is empty by design. Existing slugs remain untouched.
CREATE TABLE IF NOT EXISTS public.route_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug text NOT NULL UNIQUE,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
  redirect_type smallint NOT NULL DEFAULT 301,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT route_redirects_type_check CHECK (redirect_type IN (301, 308)),
  CONSTRAINT route_redirects_not_current_slug CHECK (old_slug <> '')
);

-- 5. Import staging tables are empty. No existing import logs are changed.
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
  CONSTRAINT route_import_batches_status_check CHECK (
    status IN ('staged','validating','validated','approved','processing','completed','failed','cancelled')
  )
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
  CONSTRAINT route_import_rows_validation_status_check CHECK (
    validation_status IN ('pending','valid','invalid','skipped')
  )
);

-- 6. Empty redirect/import tables need only their basic access indexes.
CREATE INDEX IF NOT EXISTS route_redirects_route_id_idx
  ON public.route_redirects(route_id);
CREATE INDEX IF NOT EXISTS route_import_rows_batch_idx
  ON public.route_import_rows(batch_id, validation_status);

-- 7. Final invariants: this phase must not change route count or the protected route.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.routes;
  IF n <> 1717 THEN
    RAISE EXCEPTION 'BOWT Phase 1 aborted: route count changed to %', n;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
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
  ) THEN
    RAISE EXCEPTION 'BOWT Phase 1 aborted: Dahej -> Ahmedabad invariant failed';
  END IF;
END $$;

COMMIT;
