# Refactor - SPEC-005 Slice 3

## Summary
- Kept route structure unchanged.
- Moved previous ISO week calculation before weekly report lookups so the target weekly identity can be checked directly.
- Added behavior coverage for existing-target and missing-target auto-check outcomes.

## Files
- `src/app/api/report/auto-check/route.ts`
- `tests/api/report-auto-check.behavior.test.ts`
