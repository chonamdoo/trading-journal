# DDD Design - SPEC-005 Slice 4

## Presentation Boundary
AI report page owns active Report Period selection.

## Rules
- Report Period label generation is pure and deterministic.
- The page uses API client boundary, not Supabase directly.
- Domain/data module rules unchanged.

## Files
- `src/app/(main)/analysis/report/page.tsx`
- `src/lib/report-period-presentation.ts`
- `tests/lib/report-period-presentation.behavior.test.ts`

## Current Phase Confirmation
Confirmed during active `ddd-design` phase.
