# Domain Grill: SPEC-005 Slice 1 Weekly Report Period Schema

## Task
SPEC-005 Slice 1: Weekly Report Period Schema.

## Domain Decisions
- Report Period is the identity boundary for generated reports.
- Monthly Report uses `period_type = 'monthly'` and `week = null`.
- Weekly Report uses `period_type = 'weekly'` and an ISO week number.
- Existing monthly report rows must remain valid and must not be duplicated after weekly support lands.
- This slice only changes schema/type safety. It does not generate reports, change UI, or call Gemini.

## Terms
- Report: generated trading performance summary.
- Report Period: the time bucket a report covers.
- Weekly Report: report for one ISO week.
- Monthly Report: report for one calendar month.

## Open Questions
- None for this slice. SPEC-005 already defines weekly/monthly/yearly period types.

## Sources Checked
- `specs/005-weekly-auto-report.md`
- `supabase/migrations/20260412000000_weekly_reports.sql`
- `src/lib/supabase/types.ts`
- `src/app/api/report/generate/route.ts`

## Key Finding
`UNIQUE (user_id, year, month, week, period_type)` does not protect monthly rows because PostgreSQL unique constraints treat `NULL` values as distinct. Monthly reports use `week = null`, so duplicates remain possible unless the migration uses a NULL-safe uniqueness strategy.
