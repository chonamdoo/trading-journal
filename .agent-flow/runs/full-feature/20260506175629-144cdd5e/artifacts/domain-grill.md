# Domain Grill: SPEC-005 Slice 2 Weekly Report Generation Conflict Key

## Task
SPEC-005 Slice 2: Weekly Report Generation Conflict Key.

## Domain Decisions
- Weekly Report identity is `user_id + ISO year + ISO week`.
- `month` is display/context metadata for a weekly report, not part of weekly identity.
- The API must update an existing weekly report by `user_id/year/week/period_type`, regardless of stored month.

## Terms
- Weekly Report: report for one ISO week.
- Report Period: unique period bucket for a report.
- ISO Week: week number identity for weekly reports.

## Open Questions
- None for this slice.

## Sources Checked
- `specs/005-weekly-auto-report.md`
- `supabase/migrations/20260507000100_fix_report_period_uniqueness.sql`
- `src/app/api/report/generate/route.ts`
