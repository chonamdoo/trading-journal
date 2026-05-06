# Slice Plan: SPEC-005

## Slice 1: Weekly Report Period Schema
- Fix DB uniqueness for weekly/monthly report periods.
- Add deterministic schema behavior test.
- No UI/API behavior change.

## Later Slices
- Slice 2: Weekly Report Generation API
- Slice 3: Auto Weekly Report Check Hook
- Slice 4: AI Report Weekly/Monthly Presentation
- Slice 5: Analysis Page Auto Generation Wiring

## Current Slice Files
- `supabase/migrations/20260412000000_weekly_reports.sql`
- `src/lib/supabase/types.ts` if type drift is found
- `tests/schema/weekly-report-period.behavior.test.ts`

## Current Phase Confirmation
Reviewed at `slice-plan` phase. Proceed with Slice 1 only.
