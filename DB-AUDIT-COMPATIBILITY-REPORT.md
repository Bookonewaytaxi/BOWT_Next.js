# BOWT Database Audit — Application Compatibility Report

Branch: `db-audit-remediation`

Repository: `Bookonewaytaxi/BOWT_Next.js`

## Scope

Cross-checked the additive database remediation against the live-oriented application code paths present in this branch.

## Results

### Route lookup — PASS

`pages/routes/[slug].jsx` calls `getRouteBySlug(slug)` and the service continues to read the existing `routes.slug` and `routes.is_active` columns. The migration preserves both columns and does not rename slugs.

### Related route queries — PASS

`getRoutesByCity()` continues to use the existing `from_city` text column. The migration keeps the legacy columns unchanged while adding `from_city_id`/`to_city_id`, so no immediate application switch is required.

### Pricing — PASS WITH MIGRATION GUARD

The existing UI continues to read legacy pricing fields. The migration adds `route_vehicle_prices` without deleting legacy columns.

Kia Carens is intentionally NOT mapped to the existing SUV vehicle type because the audited live `vehicle_types` table does not contain a canonical Carens row. Positive legacy Carens prices are recorded in `route_pricing_migration_issues` for later manual mapping.

### Admin route listing — PASS

The admin page delegates to `RouteManagement`, which uses `useRouteManagement.fetchRoutes()` against `routes`. No new required database column is introduced into the existing select/update path.

### Route deletion — FIXED

The previous admin hook hard-deleted routes. This branch now archives a route by setting `is_active=false` instead. This preserves route identity and SEO history and remains compatible before `publication_status` is introduced. The migration later maps inactive routes to `archived`.

### SEO — PASS

Existing `routes.seo_*` fields remain authoritative for current application compatibility. `route_seo` is additive and initially mirrors existing values without overwriting them.

### Content — PASS

Existing `seo_content`, `seo_title`, `seo_description`, `seo_keywords`, and `page_sections` are preserved. `route_content_versions` creates an initial snapshot rather than replacing content.

### FAQ — PASS

Existing `route_faqs` is untouched by the migration.

### Sitemap — COMPATIBLE

Existing sitemap behavior can continue to use `is_active` and `slug`. No current URL is renamed by the migration.

### Bulk import — COMPATIBLE BUT NOT YET SWITCHED

The migration adds staging tables but does not automatically replace the existing import implementation. The application should be switched to the staging/approval workflow only in a separate, tested phase.

### Auth/RLS — BLOCKED FOR FINAL HARDENING

The branch does not blindly enable RLS on the seven audited legacy tables. Existing application authorization must be mapped to explicit admin policies before that security migration is applied.

## Critical invariants

The database migration contains fail-closed checks for:

- exact Dahej → Ahmedabad route identity and key values
- current route count of 1,717
- unresolved city mappings
- duplicate canonical route pairs

## Production rule

Do not merge to `main` or execute the migration against production until:

1. backup/recovery capability is confirmed,
2. migration is tested against a copy/staging database,
3. post-migration validation passes,
4. route lookup, admin route listing, booking flow, SEO rendering and sitemap are smoke-tested.

No production database changes are performed by this branch itself.
