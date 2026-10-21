# BOWT Backlink Automation V1

## Goal
Create a controlled daily workflow targeting 30 qualified backlink opportunities per day. The system does not mass-post links or guarantee 30 published backlinks.

## Components
- Supabase tables: backlink_domains, backlink_opportunities, backlink_outreach, backlinks, backlink_daily_runs
- Admin UI: /admin/backlinks
- Daily discovery worker: planned for V1.1 after selecting a search provider.
- Verification worker: planned for V1.1.

## Safety rules
1. One domain is tracked once; opportunities are deduplicated by domain + source URL.
2. No automatic mass posting to third-party sites.
3. Outreach requires a reviewable draft/status.
4. Published backlinks are counted only after verification.
5. Existing site UI, route pages, pricing, booking and sitemap code are not modified by this module.
