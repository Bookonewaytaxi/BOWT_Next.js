-- BOWT PHASE 2: CANONICAL CITY MAPPING / CONTROLLED DATA NORMALIZATION
-- Run only after Phase 1 validation has passed.
-- This migration changes existing route rows by backfilling compatibility IDs/status.
-- It NEVER deletes routes, slugs, FAQs or SEO content.
-- Designed to be run as one transaction with fail-closed safety gates.

BEGIN;

-- PRE-FLIGHT: expected live dataset.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.routes;
  IF n <> 1717 THEN
    RAISE EXCEPTION 'BOWT Phase 2 aborted: expected 1717 routes, found %', n;
  END IF;
END $$;

-- 1. Populate canonical cities from existing route text only when missing.
INSERT INTO public.cities (canonical_name, slug, state)
SELECT city_name,
       regexp_replace(lower(btrim(city_name)), '[^a-z0-9]+', '-', 'g'),
       NULL
FROM (
  SELECT DISTINCT btrim(from_city) AS city_name
  FROM public.routes
  WHERE nullif(btrim(from_city), '') IS NOT NULL
  UNION
  SELECT DISTINCT btrim(to_city) AS city_name
  FROM public.routes
  WHERE nullif(btrim(to_city), '') IS NOT NULL
) c
ON CONFLICT (city_key) DO NOTHING;

-- 2. Verify every route can map uniquely to a canonical city.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.routes r
    LEFT JOIN public.cities c1 ON c1.city_key = lower(btrim(r.from_city))
    LEFT JOIN public.cities c2 ON c2.city_key = lower(btrim(r.to_city))
    WHERE c1.id IS NULL OR c2.id IS NULL
  ) THEN
    RAISE EXCEPTION 'BOWT Phase 2 aborted: unresolved canonical city mapping exists';
  END IF;
END $$;

-- 3. Backfill IDs only; preserve legacy text values.
UPDATE public.routes r
SET from_city_id = c.id
FROM public.cities c
WHERE c.city_key = lower(btrim(r.from_city))
  AND r.from_city_id IS DISTINCT FROM c.id;

UPDATE public.routes r
SET to_city_id = c.id
FROM public.cities c
WHERE c.city_key = lower(btrim(r.to_city))
  AND r.to_city_id IS DISTINCT FROM c.id;

-- 4. Publication status is introduced from existing is_active semantics.
UPDATE public.routes
SET publication_status = CASE WHEN is_active IS TRUE THEN 'published' ELSE 'archived' END
WHERE publication_status IS NULL;

UPDATE public.routes
SET published_at = COALESCE(published_at, updated_at, created_at),
    last_published_at = COALESCE(last_published_at, updated_at, created_at)
WHERE publication_status = 'published'
  AND (published_at IS NULL OR last_published_at IS NULL);

-- 5. Verify canonical route-pair uniqueness before adding the unique index.
DO $$
BEGIN
  IF EXISTS (
    SELECT from_city_id, to_city_id
    FROM public.routes
    GROUP BY from_city_id, to_city_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'BOWT Phase 2 aborted: duplicate canonical route pairs exist';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS routes_from_city_id_to_city_id_uidx
  ON public.routes(from_city_id, to_city_id);

CREATE INDEX IF NOT EXISTS routes_from_city_id_idx ON public.routes(from_city_id);
CREATE INDEX IF NOT EXISTS routes_to_city_id_idx ON public.routes(to_city_id);
CREATE INDEX IF NOT EXISTS routes_publication_idx ON public.routes(publication_status, is_active);
CREATE INDEX IF NOT EXISTS routes_updated_at_idx ON public.routes(updated_at DESC);

-- 6. Preserve the protected route exactly.
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
      AND from_city_id IS NOT NULL
      AND to_city_id IS NOT NULL
      AND publication_status = 'published'
  ) THEN
    RAISE EXCEPTION 'BOWT Phase 2 aborted: Dahej -> Ahmedabad post-migration invariant failed';
  END IF;
END $$;

-- 7. Final invariants: no route count change and no missing mappings.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.routes;
  IF n <> 1717 THEN
    RAISE EXCEPTION 'BOWT Phase 2 aborted: route count changed to %', n;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.routes
    WHERE from_city_id IS NULL OR to_city_id IS NULL OR publication_status IS NULL
  ) THEN
    RAISE EXCEPTION 'BOWT Phase 2 aborted: one or more routes remain unmapped or unpublished-state undefined';
  END IF;
END $$;

COMMIT;
