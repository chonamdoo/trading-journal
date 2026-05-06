# PRD: SPEC-005 Slice 1 Weekly Report Period Schema

## Problem
Weekly reports need a period identity in the existing `monthly_reports` table. The current schema extension uses `week` for weekly periods and `NULL` for monthly periods. A plain unique constraint including `week` does not prevent duplicate monthly reports because `NULL` values are distinct in PostgreSQL uniqueness checks.

## Goal
Make report period identity safe for weekly and monthly reports at the database schema level.

## Non-Goals
- No UI change.
- No Gemini prompt change.
- No automatic weekly generation behavior change.
- No production Supabase test run.

## Acceptance Criteria
- Migration enforces one monthly report per user/year/month.
- Migration enforces one weekly report per user/year/week.
- `period_type` remains constrained to `weekly`, `monthly`, `yearly`.
- Existing monthly rows remain valid with `week = null`.
- TypeScript DB types keep `period_type` and nullable `week`.
- Behavior test documents the NULL uniqueness bug and expected migration contract.
