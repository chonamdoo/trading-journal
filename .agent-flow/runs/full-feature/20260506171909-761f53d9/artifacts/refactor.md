# Refactor

No post-green refactor required.

## Changed Structure
- Added corrective Supabase migration for report period uniqueness.
- Added schema behavior test for monthly/weekly report identity.

## Scope Kept
- No UI change.
- No API behavior change.
- No generated Supabase type change needed; `period_type` and `week` already exist.
