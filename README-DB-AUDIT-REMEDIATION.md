# BOWT Database Audit Remediation

Branch: `db-audit-remediation`

This branch contains the database-side preparation from the live Supabase audit. It is intentionally additive and does not change production by itself.

## Files

- `supabase/migrations/20260829_bowt_audit_remediation.sql` — transactional, non-destructive migration.
- `supabase/validation/20260829_bowt_post_migration_validation.sql` — read-only validation checks.

## Safety rules

1. Do not execute the migration until Supabase backup/PITR/recovery is confirmed for the production project.
2. Do not rename or delete existing route slugs.
3. Do not delete route, FAQ, booking, customer, driver, billing, or SEO records.
4. Kia Carens is not invented as a vehicle type. Existing Carens pricing is recorded as an unresolved migration issue until a canonical vehicle row is created intentionally.
5. Legacy RLS policies are not changed by this migration. Security hardening must be a separate, application-verified phase because the current frontend/admin access matrix must be confirmed first.
6. The migration contains hard gates for the 1,717 route count and the Dahej → Ahmedabad route.

## Application follow-up

After the database migration is validated in a safe environment, update the application in a separate reviewable change to consume canonical city IDs, canonical route pricing, publication status, route SEO, and redirect records. Keep legacy fields as compatibility fallbacks during rollout.

## Current GitHub audit note

The repository is `Bookonewaytaxi/BOWT_Next.js`. The current main branch is on SEO Phase 3 and uses the Next.js Pages Router. Route pages use `getRouteBySlug(slug)` with blocking fallback and hourly ISR. The database migration should therefore remain independent from rendering and should not introduce build-time route enumeration.
