# DDD Design - SPEC-005 Slice 5

## Presentation Boundary
`AnalysisPage` consumes hook state and renders feedback.

## Rule
Generated report type is part of presentation state, not domain behavior.

## Files
- `src/app/(main)/analysis/page.tsx`
- `src/components/ui/AutoReportToast.tsx`
- `tests/app/analysis-auto-report-wiring.behavior.test.ts`
- `tests/components/auto-report-toast.behavior.test.ts`

## Current Phase Confirmation
Confirmed during active `ddd-design` phase.
